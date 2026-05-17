import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, ChevronRight, Target } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { getCategoryByLabel } from '../constants/categories';
import { formatRupiah } from '../utils/currency';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Personalised greeting + avatar */
const Header = ({ displayName }) => {
  const letter = (displayName?.[0] ?? '?').toUpperCase();
  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-2">
      <div>
        <p className="text-sm text-slate-400 font-medium">Hello, {displayName}!</p>
        <h1 className="text-2xl font-extrabold text-white leading-tight">Home</h1>
      </div>
      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
        <span className="text-emerald-400 text-lg font-bold select-none">{letter}</span>
      </div>
    </div>
  );
};

/** Green balance card */
const BalanceCard = ({ balance }) => (
  <div className="mx-5 mt-3 rounded-2xl bg-emerald-600 p-5 shadow-lg shadow-emerald-900/40 relative overflow-hidden">
    {/* Decorative circles */}
    <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
    <div className="absolute -bottom-8 -right-2 w-20 h-20 rounded-full bg-white/10" />

    <p className="text-emerald-100 text-sm font-medium mb-1">Current Balance</p>
    <p className="text-white text-3xl font-extrabold tracking-tight">
      {formatRupiah(balance)}
    </p>

    <Link
      to="/transactions"
      id="balance-see-transactions"
      className="absolute right-4 top-1/2 -translate-y-1/2
                 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center
                 hover:bg-white/30 transition-colors"
    >
      <ChevronRight className="w-5 h-5 text-white" />
    </Link>
  </div>
);

/** Income / Expense summary row */
const SummaryRow = ({ totalIncome, totalExpense }) => {
  // Expense ratio — safe against zero-income
  const expPct = totalIncome > 0
    ? Math.min(100, Math.round((totalExpense / totalIncome) * 100))
    : null;
  const remaining = totalIncome - totalExpense;

  return (
    <div className="flex gap-3 mx-5 mt-4">
      {/* Income card */}
      <div className="flex-1 rounded-2xl bg-slate-800/60 border border-slate-700/60 p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400 font-medium">Income</span>
          <ArrowUpRight className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
        </div>
        <p className="text-sm font-bold text-white">{formatRupiah(totalIncome)}</p>
        <p className="text-[11px] text-emerald-400 mt-0.5 font-medium">
          {expPct !== null
            ? `${100 - expPct}% remaining`
            : 'No income yet'}
        </p>
      </div>

      {/* Expense card */}
      <div className="flex-1 rounded-2xl bg-slate-800/60 border border-slate-700/60 p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400 font-medium">Expenses</span>
          <ArrowDownRight className="w-4 h-4 text-red-400" strokeWidth={2.5} />
        </div>
        <p className="text-sm font-bold text-red-400">{formatRupiah(totalExpense)}</p>
        <p className="text-[11px] mt-0.5 font-medium"
           style={{ color: expPct !== null && expPct > 80 ? '#f87171' : '#94a3b8' }}>
          {expPct !== null ? `Exp ${expPct}% from income` : '—'}
        </p>
      </div>
    </div>
  );
};

/** Savings goal progress card – driven by live context data */
const SavingsGoalCard = ({ goalState }) => {
  if (!goalState) {
    return (
      <Link
        to="/goals"
        className="mx-5 mt-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 p-4 flex items-center gap-3 hover:bg-slate-800 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
          <Target className="w-5 h-5 text-emerald-400" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-200">Savings Goal</p>
          <p className="text-xs text-slate-500 mt-0.5">Tap to set up your savings goal →</p>
        </div>
      </Link>
    );
  }

  const safeTarget = goalState.target || 1;
  const percentage = Math.min(100, Math.round((goalState.current / safeTarget) * 100));

  const motivationalText = () => {
    if (percentage >= 100) return '🎉 Goal reached! Congratulations!';
    if (percentage >= 75) return "Almost there! You're doing great 💪";
    if (percentage >= 50) return "Awesome! You're halfway there 🎉";
    if (percentage >= 25) return 'Good progress! Keep it up 🚀';
    return 'Keep depositing, bro!';
  };

  return (
    <Link
      to="/goals"
      className="mx-5 mt-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 p-4 block hover:bg-slate-800 transition-colors"
    >
      <p className="text-sm font-semibold text-slate-200 mb-2">
        {goalState.title ?? 'Savings Goal'}
      </p>
      <p className="text-sm text-slate-400 mb-3">
        <span className="text-white font-bold">{formatRupiah(goalState.current)}</span>
        {' / '}
        {formatRupiah(goalState.target)}
      </p>

      <div className="relative h-2 rounded-full bg-slate-700 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-slate-500">{motivationalText()}</p>
        <span className="text-xs font-bold text-emerald-400">{percentage}%</span>
      </div>
    </Link>
  );
};

/** A single transaction row */
const TransactionItem = ({ transaction }) => {
  const meta = getCategoryByLabel(transaction.category);
  const Icon = meta.icon;
  const isIncome = transaction.type === 'income';

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Icon bubble */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${meta.color}`}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Title + category */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-100 truncate">
          {transaction.note || transaction.category}
        </p>
        <p className="text-xs text-slate-500 truncate">{transaction.category}</p>
      </div>

      {/* Amount + date */}
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
          {isIncome ? '+' : '-'}{formatRupiah(transaction.amount)}
        </p>
        <p className="text-xs text-slate-500">
          {new Date(transaction.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
};

/** Empty state */
const EmptyTransactions = () => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-3">
      <span className="text-2xl">💸</span>
    </div>
    <p className="text-sm font-semibold text-slate-400">No transactions yet</p>
    <p className="text-xs text-slate-600 mt-1">Tap the + button to add your first one</p>
  </div>
);

/** Recent transactions section */
const RecentTransactions = ({ transactions }) => (
  <div className="mt-4 mb-6">
    <div className="flex items-center justify-between px-5 mb-2">
      <h2 className="text-sm font-bold text-slate-200">Recent Transactions</h2>
      <Link
        to="/transactions"
        id="home-see-all-transactions"
        className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5 hover:underline"
      >
        See All <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>

    <div className="bg-slate-800/60 rounded-2xl mx-5 border border-slate-700/60 divide-y divide-slate-700/40">
      {transactions.length === 0 ? (
        <EmptyTransactions />
      ) : (
        transactions
          .slice(0, 5)
          .map((tx) => <TransactionItem key={tx.id} transaction={tx} />)
      )}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main Home page
// ---------------------------------------------------------------------------

const Home = () => {
  const { currentBalance, totalIncome, totalExpense, transactions, goalState } =
    useTransactions();
  const { user } = useAuth();

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split('@')[0] ??
    'there';

  return (
    <div className="flex flex-col pb-24 bg-slate-900 min-h-full">
      <Header displayName={displayName} />
      <BalanceCard balance={currentBalance} />
      <SummaryRow totalIncome={totalIncome} totalExpense={totalExpense} />
      <SavingsGoalCard goalState={goalState} />
      <RecentTransactions transactions={transactions} />
    </div>
  );
};

export default Home;
