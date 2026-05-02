import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { getCategoryByLabel } from '../constants/categories';
import { formatRupiah } from '../utils/currency';
import { formatRelativeDate } from '../utils/date';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Personalised greeting + avatar */
const Header = () => (
  <div className="flex items-center justify-between px-5 pt-6 pb-2">
    <div>
      <p className="text-sm text-gray-500 font-medium">Hello, John Smith!</p>
      <h1 className="text-2xl font-extrabold text-gray-800 leading-tight">Home</h1>
    </div>
    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
      <span className="text-emerald-700 text-lg font-bold select-none">J</span>
    </div>
  </div>
);

/** Green balance card */
const BalanceCard = ({ balance }) => (
  <div className="mx-5 mt-3 rounded-2xl bg-[#189C63] p-5 shadow-lg relative overflow-hidden">
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
const SummaryRow = ({ totalIncome, totalExpense }) => (
  <div className="flex gap-3 mx-5 mt-4">
    {/* Income card */}
    <div className="flex-1 rounded-2xl bg-blue-50 border border-blue-100 p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500 font-medium">Income</span>
        <ArrowUpRight className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
      </div>
      <p className="text-sm font-bold text-gray-800">{formatRupiah(totalIncome)}</p>
      <p className="text-[11px] text-emerald-500 mt-0.5 font-medium">+12.5% from last month</p>
    </div>

    {/* Expense card */}
    <div className="flex-1 rounded-2xl bg-red-50 border border-red-100 p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500 font-medium">Expenses</span>
        <ArrowDownRight className="w-4 h-4 text-red-400" strokeWidth={2.5} />
      </div>
      <p className="text-sm font-bold text-red-500">{formatRupiah(totalExpense)}</p>
      <p className="text-[11px] text-red-400 mt-0.5 font-medium">-8.3% from last month</p>
    </div>
  </div>
);

/** Savings goal progress card */
const SavingsGoalCard = () => {
  const current = 1_000_000;
  const target = 2_000_000;
  const percentage = Math.round((current / target) * 100);

  return (
    <div className="mx-5 mt-4 rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
      <p className="text-sm font-semibold text-gray-700 mb-2">Savings Goal</p>
      <p className="text-sm text-gray-500 mb-3">
        <span className="text-gray-800 font-bold">{formatRupiah(current)}</span>
        {' / '}
        {formatRupiah(target)}
      </p>

      <div className="relative h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[#189C63] transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-gray-400">Awesome! You're halfway there 🎉</p>
        <span className="text-xs font-bold text-[#189C63]">{percentage}%</span>
      </div>
    </div>
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
        <p className="text-sm font-semibold text-gray-800 truncate">
          {transaction.note || transaction.category}
        </p>
        <p className="text-xs text-gray-400 truncate">{transaction.category}</p>
      </div>

      {/* Amount + date */}
      <div className="text-right shrink-0">
        <p
          className={`text-sm font-bold ${isIncome ? 'text-emerald-600' : 'text-red-500'
            }`}
        >
          {isIncome ? '+' : '-'}{formatRupiah(transaction.amount)}
        </p>
        <p className="text-xs text-gray-400">{formatRelativeDate(transaction.date)}</p>
      </div>
    </div>
  );
};

/** Empty state for the transactions list */
const EmptyTransactions = () => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <span className="text-2xl">💸</span>
    </div>
    <p className="text-sm font-semibold text-gray-500">No transactions yet</p>
    <p className="text-xs text-gray-400 mt-1">Tap the + button to add your first one</p>
  </div>
);

/** Recent transactions section */
const RecentTransactions = ({ transactions }) => (
  <div className="mt-4 mb-6">
    <div className="flex items-center justify-between px-5 mb-2">
      <h2 className="text-sm font-bold text-gray-800">Recent Transactions</h2>
      <Link
        to="/transactions"
        id="home-see-all-transactions"
        className="text-xs text-[#189C63] font-semibold flex items-center gap-0.5 hover:underline"
      >
        See All <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>

    <div className="bg-white rounded-2xl mx-5 shadow-sm border border-gray-100 divide-y divide-gray-50">
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

/**
 * Home
 *
 * Consumes all financial data from TransactionContext:
 *   - currentBalance  → shown in the green balance card
 *   - totalIncome     → Income summary card
 *   - totalExpense    → Expense summary card
 *   - transactions    → Recent transactions list (pre-sorted newest-first by context)
 *
 * No local state or localStorage calls — all data ownership lives in the context.
 */
const Home = () => {
  const { currentBalance, totalIncome, totalExpense, transactions } =
    useTransactions();

  return (
    <div className="flex flex-col pb-24">
      <Header />
      <BalanceCard balance={currentBalance} />
      <SummaryRow totalIncome={totalIncome} totalExpense={totalExpense} />
      <SavingsGoalCard />
      <RecentTransactions transactions={transactions} />
    </div>
  );
};

export default Home;
