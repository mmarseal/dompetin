import { createContext, useContext, useMemo, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

// ---------------------------------------------------------------------------
// Storage key
// ---------------------------------------------------------------------------
const STORAGE_KEY = 'dompetin_transactions';
const GOAL_STORAGE_KEY = 'dompetin_goal';

/**
 * INITIAL_BALANCE (Rp)
 *
 * A base balance that exists before any tracked transactions.
 * This lets the app show a realistic starting balance (Rp 25.520.000)
 * while Income/Expense summaries only reflect actual user transactions.
 *
 * Balance formula:
 *   currentBalance = INITIAL_BALANCE + totalIncome - totalExpense
 */
const INITIAL_BALANCE = 23_070_000;

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
/**
 * Helper: returns an ISO timestamp N days before now.
 */
const daysAgo = (n) => new Date(Date.now() - n * 86_400_000).toISOString();

/**
 * Realistic seed transactions.
 * Designed so that:
 *   totalIncome  = 4,800,000
 *   totalExpense = 2,350,000
 *   currentBalance = 23,070,000 + 4,800,000 - 2,350,000 = 25,520,000
 */
const SEED_TRANSACTIONS = [
  { id: 'seed-1', type: 'expense', amount: 25_000,    category: 'Food',          note: 'Lunch',                   date: daysAgo(0) },
  { id: 'seed-2', type: 'income',  amount: 800_000,   category: 'Salary',        note: 'Part-Time Salary',        date: daysAgo(1) },
  { id: 'seed-3', type: 'expense', amount: 49_000,    category: 'Entertainment', note: 'Spotify subscription',    date: daysAgo(1) },
  { id: 'seed-4', type: 'expense', amount: 35_000,    category: 'Transport',     note: 'Grab Car',                date: daysAgo(2) },
  { id: 'seed-5', type: 'expense', amount: 42_000,    category: 'Food',          note: 'Coffee Shop',             date: daysAgo(2) },
  { id: 'seed-6', type: 'income',  amount: 2_500_000, category: 'Salary',        note: 'Freelance Project',       date: daysAgo(3) },
  { id: 'seed-7', type: 'expense', amount: 499_000,   category: 'Shopping',      note: 'Online shopping',         date: daysAgo(4) },
  { id: 'seed-8', type: 'income',  amount: 1_500_000, category: 'Salary',        note: 'Monthly salary (partial)',date: daysAgo(5) },
  { id: 'seed-9', type: 'expense', amount: 1_700_000, category: 'Bills',         note: 'Electricity bill',        date: daysAgo(6) },
];

const INITIAL_GOAL = {
  title: 'Gadget Fund',
  target: 5000000,
  current: 1250000,
  estimatedDays: 75,
  history: [
    { id: 'g1', amount: 150000, date: daysAgo(0) },
    { id: 'g2', amount: 200000, date: daysAgo(3) },
    { id: 'g3', amount: 100000, date: daysAgo(7) },
    { id: 'g4', amount: 150000, date: daysAgo(14) },
    { id: 'g5', amount: 200000, date: daysAgo(21) },
  ]
};

// ---------------------------------------------------------------------------
// Validation guard: detect & discard old-format data from previous stubs
// ---------------------------------------------------------------------------

/**
 * Returns true only if every item in the array is a valid v2 transaction:
 *   - type is exactly 'income' or 'expense'
 *   - amount is a positive number
 *   - date is a parseable ISO string
 */
const isValidTransaction = (t) =>
  t !== null &&
  typeof t === 'object' &&
  (t.type === 'income' || t.type === 'expense') &&
  typeof t.amount === 'number' &&
  t.amount > 0 &&
  !isNaN(Date.parse(t.date));

const isValidTransactionArray = (data) =>
  Array.isArray(data) && data.length > 0 && data.every(isValidTransaction);

const loadInitialTransactions = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_TRANSACTIONS;
    const parsed = JSON.parse(raw);
    if (!isValidTransactionArray(parsed)) {
      // Stale/incompatible data – purge it and start fresh with seed data
      window.localStorage.removeItem(STORAGE_KEY);
      return SEED_TRANSACTIONS;
    }
    return parsed;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return SEED_TRANSACTIONS;
  }
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const TransactionContext = createContext(null);

/**
 * useTransactions
 * Custom hook to consume the TransactionContext.
 * Throws a descriptive error if used outside of TransactionProvider.
 */
export const useTransactions = () => {
  const ctx = useContext(TransactionContext);
  if (!ctx) {
    throw new Error('useTransactions must be used within a <TransactionProvider>.');
  }
  return ctx;
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * TransactionProvider
 *
 * Exposes:
 *   transactions   – array sorted newest-first
 *   addTransaction – adds one transaction to state + localStorage
 *   totalIncome    – sum of all income transaction amounts
 *   totalExpense   – sum of all expense transaction amounts
 *   currentBalance – INITIAL_BALANCE + totalIncome - totalExpense
 */
export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useLocalStorage(
    STORAGE_KEY,
    loadInitialTransactions()
  );

  const [goalState, setGoalState] = useLocalStorage(
    GOAL_STORAGE_KEY,
    INITIAL_GOAL
  );

  // ── Computed values (memoised to avoid recalculation on every render) ────

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const currentBalance = useMemo(
    () => INITIAL_BALANCE + totalIncome - totalExpense,
    [totalIncome, totalExpense]
  );

  /** Transactions sorted newest-first for display */
  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions]
  );

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * addTransaction
   *
   * Prepends a new transaction to the list.
   *
   * @param {{ type: string, amount: number, category: string, note: string, date: string }} transaction
   */
  const addTransaction = useCallback(
    (transaction) => {
      setTransactions((prev) => [transaction, ...prev]);
    },
    [setTransactions]
  );

  /**
   * addGoalDeposit
   *
   * Adds to goal current total, pushes to history, and adds an expense transaction
   * to deduct from the main wallet balance.
   */
  const addGoalDeposit = useCallback(
    (amount) => {
      setGoalState((prev) => ({
        ...prev,
        current: prev.current + amount,
        history: [
          {
            id: Date.now().toString(),
            amount,
            date: new Date().toISOString(),
          },
          ...prev.history,
        ],
      }));

      addTransaction({
        id: `goal-dep-${Date.now()}`,
        type: 'expense',
        amount: amount,
        category: 'Others',
        note: 'Deposit to Goal',
        date: new Date().toISOString(),
      });
    },
    [setGoalState, addTransaction]
  );

  // ── Context value ─────────────────────────────────────────────────────────

  const value = {
    transactions: sortedTransactions,
    addTransaction,
    totalIncome,
    totalExpense,
    currentBalance,
    goalState,
    addGoalDeposit,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionContext;
