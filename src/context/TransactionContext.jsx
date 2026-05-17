import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabase.js';
import { useAuth } from './AuthContext.jsx';

const TransactionContext = createContext(null);

export const useTransactions = () => {
  const ctx = useContext(TransactionContext);
  if (!ctx) {
    throw new Error('useTransactions must be used within a <TransactionProvider>.');
  }
  return ctx;
};

export const TransactionProvider = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  // null means "not loaded / no goal row exists yet"
  const [goalState, setGoalState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear state immediately when there is no logged-in user
    if (!user) {
      setTransactions([]);
      setGoalState(null);
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch only the current user's transactions
        const { data: txData, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (txError) throw txError;
        setTransactions(txData ?? []);

        // Fetch the current user's goal row
        const { data: goalData, error: goalError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (goalError) throw goalError;

        // Fetch only the current user's goal deposits
        const { data: depositsData, error: depositsError } = await supabase
          .from('goal_deposits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (depositsError) throw depositsError;

        if (goalData) {
          setGoalState({
            id: goalData.id,
            title: goalData.title ?? 'Savings Goal',
            target: goalData.target ?? 0,
            current: goalData.current ?? 0,
            estimatedDays: goalData.estimated_days ?? 0,
            history: depositsData ?? [],
          });
        } else {
          // No goal row yet — keep null but still store any stray deposits
          setGoalState(null);
        }
      } catch (err) {
        console.error('[TransactionProvider] Failed to fetch data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

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
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
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
  }, [user]);

  const addGoalDeposit = useCallback(async (amount) => {
    if (!user || !goalState) return;
    try {
      const { data: depositData, error: depositError } = await supabase
        .from('goal_deposits')
        .insert([{ amount, user_id: user.id, goal_id: goalState.id ?? null }])
        .select()
        .single();

      if (depositError) throw depositError;

      const newCurrent = goalState.current + amount;
      const { error: goalUpdateError } = await supabase
        .from('goals')
        .update({ current: newCurrent })
        .eq('user_id', user.id);

      if (goalUpdateError) throw goalUpdateError;

      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
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
  }, [user, goalState]);

  /**
   * updateGoalTarget – upsert the goal row for the logged-in user.
   * Creates the row if it doesn't exist yet (first-time setup).
   */
  const updateGoalTarget = useCallback(async ({ target, title }) => {
    if (!user) return;
    try {
      const payload = {
        user_id: user.id,
        target: target ?? goalState?.target ?? 0,
        title: title ?? goalState?.title ?? 'Savings Goal',
        // preserve current savings amount if a row already exists
        current: goalState?.current ?? 0,
      };

      const { data, error } = await supabase
        .from('goals')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      setGoalState((prev) => ({
        ...(prev ?? {}),
        id: data.id,
        title: data.title ?? 'Savings Goal',
        target: data.target ?? 0,
        current: data.current ?? prev?.current ?? 0,
        history: prev?.history ?? [],
      }));
    } catch (err) {
      console.error('[updateGoalTarget] Error:', err.message);
      throw err; // re-throw so the UI can show an error state
    }
  }, [user, goalState]);

  const value = {
    transactions,
    addTransaction,
    totalIncome,
    totalExpense,
    currentBalance,
    goalState,
    addGoalDeposit,
    updateGoalTarget,
    loading,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionContext;