import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { getCategoryByLabel } from '../constants/categories';
import { formatRupiah } from '../utils/currency';
import { formatRelativeDate } from '../utils/date';

// ---------------------------------------------------------------------------
// Static chart data (dummy for this week – wired to context in a future step)
// ---------------------------------------------------------------------------

const CHART_SEGMENTS = [
  { label: 'Food',          percentage: 40, amount: 248_000, color: '#3B82F6' },
  { label: 'Transport',     percentage: 25, amount: 155_000, color: '#EF4444' },
  { label: 'Shopping',      percentage: 15, amount:  93_000, color: '#F59E0B' },
  { label: 'Entertainment', percentage: 10, amount:  62_000, color: '#9CA3AF' },
  { label: 'Others',        percentage: 10, amount:  62_000, color: '#374151' },
];

const TOTAL_SPENDING   = 620_000;
const DAILY_AVERAGE    = 88_571;

/**
 * Builds the CSS conic-gradient string from CHART_SEGMENTS.
 * e.g. "conic-gradient(#3B82F6 0% 40%, #EF4444 40% 65%, …)"
 */
const buildConicGradient = (segments) => {
  let cumulative = 0;
  const stops = segments.map(({ color, percentage }) => {
    const start = cumulative;
    cumulative += percentage;
    return `${color} ${start}% ${cumulative}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
};

// ---------------------------------------------------------------------------
// Utility: format ISO date as "Today, HH:MM" / "Yesterday, HH:MM" / "DD MMM, HH:MM"
// ---------------------------------------------------------------------------
const formatTransactionDate = (isoDate) => {
  const relative = formatRelativeDate(isoDate);
  const time = new Date(isoDate).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${relative}, ${time}`;
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Page header with period selector */
const Header = ({ period, onPeriodToggle }) => (
  <div className="flex items-center justify-between px-5 pt-6 pb-3">
    <h1 className="text-2xl font-extrabold text-[#189C63]">Transactions</h1>
    <button
      id="period-selector"
      onClick={onPeriodToggle}
      className="flex items-center gap-1 text-sm font-semibold text-gray-600
                 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
    >
      {period}
      <ChevronDown className="w-4 h-4" />
    </button>
  </div>
);

/** Two-card summary row */
const WeeklySummary = () => (
  <div className="px-5">
    <h2 className="text-base font-bold text-gray-800 mb-3">This Week's Summary</h2>
    <div className="flex gap-3">
      {/* Total Spending */}
      <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4">
        <p className="text-xs text-gray-500 font-medium mb-1">Total Spending</p>
        <p className="text-base font-extrabold text-gray-800">{formatRupiah(TOTAL_SPENDING)}</p>
        <p className="text-[11px] text-emerald-500 font-semibold mt-1">+18% from last week</p>
      </div>
      {/* Daily Average */}
      <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4">
        <p className="text-xs text-gray-500 font-medium mb-1">Daily Average</p>
        <p className="text-base font-extrabold text-gray-800">{formatRupiah(DAILY_AVERAGE)}</p>
        <p className="text-[11px] text-emerald-500 font-semibold mt-1">+12% from last week</p>
      </div>
    </div>
  </div>
);

/** CSS-only donut chart + legend */
const CategoryChart = () => (
  <div className="px-5 mt-5">
    <h2 className="text-base font-bold text-gray-800 mb-4">Largest Categories</h2>

    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="relative shrink-0 w-32 h-32">
          {/* Coloured ring via conic-gradient */}
          <div
            className="w-full h-full rounded-full"
            style={{ background: buildConicGradient(CHART_SEGMENTS) }}
          />
          {/* White hole – creates the donut shape */}
          <div className="absolute inset-5 rounded-full bg-white shadow-inner flex flex-col items-center justify-center">
            <span className="text-[9px] text-gray-400 font-medium">Total</span>
            <span className="text-[11px] font-extrabold text-gray-800 text-center leading-tight">
              {formatRupiah(TOTAL_SPENDING)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 flex flex-col gap-2">
          {CHART_SEGMENTS.map(({ label, percentage, amount, color }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {/* Colour dot */}
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700 leading-tight truncate">
                    {label}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    {formatRupiah(amount)}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-600 ml-2 shrink-0">
                {percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/** A single row in the transaction list */
const TransactionRow = ({ transaction }) => {
  const meta   = getCategoryByLabel(transaction.category);
  const Icon   = meta.icon;
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

      {/* Amount + timestamp */}
      <div className="text-right shrink-0">
        <p
          className={`text-sm font-bold ${
            isIncome ? 'text-emerald-600' : 'text-red-500'
          }`}
        >
          {isIncome ? '+' : '-'}{formatRupiah(transaction.amount)}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {formatTransactionDate(transaction.date)}
        </p>
      </div>
    </div>
  );
};

/** Full transaction list from context */
const TransactionList = ({ transactions }) => (
  <div className="mt-5 px-5 mb-6">
    <h2 className="text-base font-bold text-gray-800 mb-3">Transaction List</h2>

    {transactions.length === 0 ? (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col
                      items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <span className="text-2xl">💸</span>
        </div>
        <p className="text-sm font-semibold text-gray-500">No transactions yet</p>
        <p className="text-xs text-gray-400 mt-1">Tap the + button to add your first one</p>
      </div>
    ) : (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {transactions.map((tx) => (
          <TransactionRow key={tx.id} transaction={tx} />
        ))}
      </div>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

/**
 * Transactions
 *
 * Displays:
 *  - Period selector (Weekly / Monthly / Yearly — UI only for now)
 *  - This Week's Summary  (static dummy totals)
 *  - Largest Categories   (CSS conic-gradient donut + legend, static)
 *  - Transaction List     (real data from TransactionContext, newest first)
 */
const Transactions = () => {
  const { transactions } = useTransactions();

  // Period selector – UI only; filtering will be added in a later step
  const [period, setPeriod] = useState('Weekly');
  const periods = ['Weekly', 'Monthly', 'Yearly'];

  const cyclePeriod = () => {
    setPeriod((prev) => {
      const idx = periods.indexOf(prev);
      return periods[(idx + 1) % periods.length];
    });
  };

  return (
    <div className="flex flex-col pb-24 bg-gray-50 min-h-full">
      <Header period={period} onPeriodToggle={cyclePeriod} />
      <WeeklySummary />
      <CategoryChart />
      <TransactionList transactions={transactions} />
    </div>
  );
};

export default Transactions;
