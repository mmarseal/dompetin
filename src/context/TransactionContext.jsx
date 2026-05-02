import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabase.js';

const TransactionContext = createContext(null);

export const useTransactions = () => {
  const ctx = useContext(TransactionContext);
  if (!ctx) {
    throw new Error('useTransactions must be used within a <TransactionProvider>.');
  }
  return ctx;
};

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [goalState, setGoalState] = useState({
    target: 5000000,
    current: 0,
    history: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data: txData, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (txError) throw txError;
        setTransactions(txData ?? []);

        const { data: goalData, error: goalError } = await supabase
          .from('goals')
          .select('*')
          .eq('id', 1)
          .single();

        if (goalError && goalError.code !== 'PGRST116') throw goalError;

        const { data: depositsData, error: depositsError } = await supabase
          .from('goal_deposits')
          .select('*')
          .order('created_at', { ascending: false });

        if (depositsError) throw depositsError;

        if (goalData) {
          setGoalState({
            title: goalData.title ?? 'Savings Goal',
            target: goalData.target ?? 5000000,
            current: goalData.current ?? 0,
            estimatedDays: goalData.estimated_days ?? 0,
            history: depositsData ?? [],
          });
        }
      } catch (err) {
        console.error('[TransactionProvider] Failed to fetch data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + (t.amount ?? 0), 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () => transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + (t.amount ?? 0), 0),
    [transactions]
  );

  const currentBalance = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);

  const addTransaction = useCallback(async (transaction) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            title: transaction.title ?? transaction.note ?? 'Transaction',
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            note: transaction.note ?? '',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setTransactions((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('[addTransaction] Error:', err.message);
      return null;
    }
  }, []);

  const addGoalDeposit = useCallback(async (amount) => {
    try {
      const { data: depositData, error: depositError } = await supabase
        .from('goal_deposits')
        .insert([{ amount, goal_id: 1 }])
        .select()
        .single();

      if (depositError) throw depositError;

      const newCurrent = goalState.current + amount;
      const { error: goalUpdateError } = await supabase
        .from('goals')
        .update({ current: newCurrent })
        .eq('id', 1);

      if (goalUpdateError) throw goalUpdateError;

      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert([
          {
            title: 'Deposit to Goal',
            type: 'expense',
            amount,
            category: 'Others',
            note: 'Deposit to Goal',
          },
        ])
        .select()
        .single();

      if (txError) throw txError;

      setGoalState((prev) => ({
        ...prev,
        current: newCurrent,
        history: [depositData, ...prev.history],
      }));

      setTransactions((prev) => [txData, ...prev]);
    } catch (err) {
      console.error('[addGoalDeposit] Error:', err.message);
    }
  }, [goalState.current]);

  const value = {
    transactions,
    addTransaction,
    totalIncome,
    totalExpense,
    currentBalance,
    goalState,
    addGoalDeposit,
    loading,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionContext;