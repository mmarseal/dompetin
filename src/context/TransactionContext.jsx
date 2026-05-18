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
  const [goalState, setGoalState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const toggleBalance = useCallback(() => setShowBalance((v) => !v), []);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setGoalState(null);
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data: txData, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (txError) throw txError;
        setTransactions(txData ?? []);

        const { data: goalData, error: goalError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (goalError) throw goalError;

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

  const deleteTransaction = useCallback(async (id) => {
    if (!user) return;
    try {

      const txToDelete = transactions.find((t) => t.id === id);

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransactions((prev) => prev.filter((t) => t.id !== id));

      if (txToDelete?.title === 'Deposit to Goal' && goalState) {
        const amount = txToDelete.amount ?? 0;

        const { data: depositMatch } = await supabase
          .from('goal_deposits')
          .select('id')
          .eq('user_id', user.id)
          .eq('amount', amount)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (depositMatch) {
          await supabase
            .from('goal_deposits')
            .delete()
            .eq('id', depositMatch.id)
            .eq('user_id', user.id);
        }

        // Roll back goals.current
        const newCurrent = Math.max(0, goalState.current - amount);
        await supabase
          .from('goals')
          .update({ current: newCurrent })
          .eq('user_id', user.id);

        const [{ data: goalData }, { data: depositsData }] = await Promise.all([
          supabase.from('goals').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('goal_deposits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        ]);

        if (goalData) {
          setGoalState((prev) => ({
            ...(prev ?? {}),
            current: goalData.current ?? newCurrent,
            history: depositsData ?? [],
          }));
        }
      }
    } catch (err) {
      console.error('[deleteTransaction] Error:', err.message);
    }
  }, [user, transactions, goalState]);

  const deleteGoalDeposit = useCallback(async (id, amount) => {
    if (!user || !goalState) return;
    try {
      // Delete the deposit row
      const { error: depositError } = await supabase
        .from('goal_deposits')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (depositError) throw depositError;

      // Roll back goals.current
      const newCurrent = Math.max(0, goalState.current - amount);
      const { error: goalUpdateError } = await supabase
        .from('goals')
        .update({ current: newCurrent })
        .eq('user_id', user.id);

      if (goalUpdateError) throw goalUpdateError;

      // Find and delete the corresponding "Deposit to Goal" transaction.
      // Match on title + amount + user_id
      const { data: txMatch } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('title', 'Deposit to Goal')
        .eq('amount', amount)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (txMatch) {
        await supabase
          .from('transactions')
          .delete()
          .eq('id', txMatch.id)
          .eq('user_id', user.id);

        setTransactions((prev) => prev.filter((t) => t.id !== txMatch.id));
      }

      setGoalState((prev) => ({
        ...prev,
        current: newCurrent,
        history: prev.history.filter((d) => d.id !== id),
      }));
    } catch (err) {
      console.error('[deleteGoalDeposit] Error:', err.message);
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
      throw err;
    }
  }, [user, goalState]);

  const value = {
    transactions,
    addTransaction,
    deleteTransaction,
    totalIncome,
    totalExpense,
    currentBalance,
    goalState,
    addGoalDeposit,
    deleteGoalDeposit,
    updateGoalTarget,
    loading,
    showBalance,
    toggleBalance,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionContext;