import { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { getCategoryByLabel, CATEGORIES } from '../constants/categories';
import { formatRupiah } from '../utils/currency';
import { formatRelativeDate } from '../utils/date';

// ---------------------------------------------------------------------------
// Category chart colours (hex) — derived from the categories constant so
// the donut and legend always stay in sync with the rest of the app.
// ---------------------------------------------------------------------------
const CATEGORY_CHART_COLORS = {
  Food:          '#F97316', // orange-500
  Transport:     '#3B82F6', // blue-500
  Shopping:      '#EC4899', // pink-500
  Entertainment: '#A855F7', // purple-500
  Bills:         '#EAB308', // yellow-500
  Health:        '#EF4444', // red-500
  Salary:        '#10B981', // emerald-500
  Others:        '#6B7280', // gray-500
};

/**
 * Builds the CSS conic-gradient string from an array of segments.
 * Each segment must have { percentage, color }.
 */
const buildConicGradient = (segments) => {
  if (!segments.length) return 'conic-gradient(#E5E7EB 0% 100%)';
  let cumulative = 0;
  const stops = segments.map(({ color, percentage }) => {
    const start = cumulative;
    cumulative += percentage;
    return `${color} ${start}% ${cumulative}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
};

// ---------------------------------------------------------------------------
// Utility: format Supabase ISO timestamp (created_at) for the transaction list
// ---------------------------------------------------------------------------
const formatTransactionDate = (isoTimestamp) => {
  if (!isoTimestamp) return '';
  const date = new Date(isoTimestamp);
  if (isNaN(date.getTime())) return '';

  // Use formatRelativeDate for "Today" / "Yesterday" / relative label
  const relative = formatRelativeDate(isoTimestamp);
  const time = date.toLocaleTimeString('id-ID', {
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

/** Two-card summary row — totals derived from real expense transactions */
const WeeklySummary = ({ totalSpending, transactionCount }) => {
  const dailyAverage = transactionCount > 0
    ? Math.round(totalSpending / 7)
    : 0;

  return (
    <div className="px-5">
      <h2 className="text-base font-bold text-gray-800 mb-3">Summary</h2>
      <div className="flex gap-3">
        {/* Total Spending */}
        <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Total Spending</p>
          <p className="text-base font-extrabold text-gray-800">{formatRupiah(totalSpending)}</p>
          <p className="text-[11px] text-gray-400 font-medium mt-1">
            {transactionCount} expense{transactionCount !== 1 ? 's' : ''}
          </p>
        </div>
        {/* Daily Average */}
        <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Daily Average</p>
          <p className="text-base font-extrabold text-gray-800">{formatRupiah(dailyAverage)}</p>
          <p className="text-[11px] text-gray-400 font-medium mt-1">over 7 days</p>
        </div>
      </div>
    </div>
  );
};

/** CSS-only donut chart + legend — built from real expense data */
const CategoryChart = ({ segments, totalSpending }) => {
  const hasData = segments.length > 0;

  return (
    <div className="px-5 mt-5">
      <h2 className="text-base font-bold text-gray-800 mb-4">Largest Categories</h2>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        {!hasData ? (
          <p className="text-sm text-gray-400 text-center py-6 font-medium">
            No expense data yet
          </p>
        ) : (
          <div className="flex items-center gap-4">
            {/* Donut */}
            <div className="relative shrink-0 w-32 h-32">
              <div
                className="w-full h-full rounded-full"
                style={{ background: buildConicGradient(segments) }}
              />
              {/* White hole */}
              <div className="absolute inset-5 rounded-full bg-white shadow-inner flex flex-col items-center justify-center">
                <span className="text-[9px] text-gray-400 font-medium">Total</span>
                <span className="text-[11px] font-extrabold text-gray-800 text-center leading-tight">
                  {formatRupiah(totalSpending)}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 flex flex-col gap-2">
              {segments.map(({ label, percentage, amount, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
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
        )}
      </div>
    </div>
  );
};

/** A single row in the transaction list */
const TransactionRow = ({ transaction }) => {
  const meta   = getCategoryByLabel(transaction.category);
  const Icon   = meta.icon;
  const isIncome = transaction.type === 'income';

  // Prefer title field (Supabase column), fall back to note, then category
  const displayTitle = transaction.title || transaction.note || transaction.category;

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
          {displayTitle}
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
          {formatTransactionDate(transaction.created_at)}
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

const Transactions = () => {
  const { transactions } = useTransactions();

  // Period selector – UI only
  const [period, setPeriod] = useState('Weekly');
  const periods = ['Weekly', 'Monthly', 'Yearly'];

  const cyclePeriod = () => {
    setPeriod((prev) => {
      const idx = periods.indexOf(prev);
      return periods[(idx + 1) % periods.length];
    });
  };

  // ── Derived data from real transactions ────────────────────────────────────

  const expenses = useMemo(
    () => transactions.filter((t) => t.type === 'expense'),
    [transactions]
  );

  const totalSpending = useMemo(
    () => expenses.reduce((sum, t) => sum + (t.amount ?? 0), 0),
    [expenses]
  );

  // Group expenses by category and compute percentage + colour for each
  const chartSegments = useMemo(() => {
    if (totalSpending === 0) return [];

    const grouped = {};
    for (const tx of expenses) {
      const cat = tx.category || 'Others';
      grouped[cat] = (grouped[cat] ?? 0) + (tx.amount ?? 0);
    }

    return Object.entries(grouped)
      .map(([label, amount]) => ({
        label,
        amount,
        percentage: Math.round((amount / totalSpending) * 100),
        color: CATEGORY_CHART_COLORS[label] ?? CATEGORY_CHART_COLORS.Others,
      }))
      .sort((a, b) => b.amount - a.amount); // largest first
  }, [expenses, totalSpending]);

  return (
    <div className="flex flex-col pb-24 bg-gray-50 min-h-full">
      <Header period={period} onPeriodToggle={cyclePeriod} />
      <WeeklySummary totalSpending={totalSpending} transactionCount={expenses.length} />
      <CategoryChart segments={chartSegments} totalSpending={totalSpending} />
      <TransactionList transactions={transactions} />
    </div>
  );
};

export default Transactions;
