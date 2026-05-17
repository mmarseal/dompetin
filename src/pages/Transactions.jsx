import { useState, useMemo, useRef, useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { getCategoryByLabel } from '../constants/categories';
import { formatRupiah } from '../utils/currency';

// ---------------------------------------------------------------------------
// Constants & Helpers
// ---------------------------------------------------------------------------

const CATEGORY_CHART_COLORS = {
  Food: '#F97316', Transport: '#3B82F6', Shopping: '#EC4899',
  Entertainment: '#A855F7', Bills: '#EAB308', Health: '#EF4444',
  Salary: '#10B981', Others: '#6B7280',
};

const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const buildConicGradient = (segments) => {
  if (!segments.length) return 'conic-gradient(#1e293b 0% 100%)';
  let cum = 0;
  return `conic-gradient(${segments.map(({ color, percentage }) => {
    const s = cum; cum += percentage; return `${color} ${s}% ${cum}%`;
  }).join(', ')})`;
};

const fmtTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
};

/** Build an array of the last N days (default 30) starting from today */
const buildDateRange = (n = 30) => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
};

/** Check if two Date objects represent the same calendar day */
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Return the start-of-day boundary for a given period relative to now */
const getPeriodStart = (period) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === 'Daily')   { /* today only – handled by selectedDate */ return d; }
  if (period === 'Weekly')  { d.setDate(d.getDate() - 6); return d; }
  if (period === 'Monthly') { d.setDate(1); return d; }
  if (period === 'Yearly')  { d.setMonth(0, 1); return d; }
  return null;
};

const PERIODS = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

// ---------------------------------------------------------------------------
// Period Tab Pills
// ---------------------------------------------------------------------------

const PeriodTabs = ({ active, onChange }) => (
  <div className="flex gap-2 px-5 pb-2">
    {PERIODS.map((p) => (
      <button
        key={p}
        onClick={() => onChange(p)}
        className={`flex-1 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95
                    ${
                      active === p
                        ? 'bg-[#189C63] text-white shadow-md shadow-emerald-900/40'
                        : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
      >
        {p}
      </button>
    ))}
  </div>
);


const DatePicker = ({ selectedDate, onSelect }) => {
  const dates = useMemo(() => buildDateRange(30), []);
  const scrollRef = useRef(null);
  const today = new Date();

  // Scroll to today on mount
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, []);

  return (
    <div className="relative">
      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-8 z-10
                      bg-gradient-to-r from-slate-900 to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-8 z-10
                      bg-gradient-to-l from-slate-900 to-transparent" />

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-5 py-3 scrollbar-hide"
      >
        {dates.map((date) => {
          const isActive = selectedDate && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          return (
            <button
              key={date.toISOString()}
              data-active={isActive}
              onClick={() => onSelect(isActive ? null : date)}
              className={`flex flex-col items-center shrink-0 rounded-xl px-3 py-2 min-w-[48px]
                          transition-all duration-200 active:scale-95
                          ${isActive
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                            : isToday
                              ? 'bg-slate-800 border border-emerald-500/50 text-emerald-400'
                              : 'bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:bg-slate-800'
                          }`}
            >
              <span className="text-[10px] font-semibold uppercase leading-none">
                {DAYS_ID[date.getDay()]}
              </span>
              <span className="text-base font-extrabold leading-tight mt-0.5">
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Summary cards
// ---------------------------------------------------------------------------

const WeeklySummary = ({ totalSpending, transactionCount, selectedDate }) => (
  <div className="px-5">
    <h2 className="text-base font-bold text-slate-200 mb-3">
      {selectedDate
        ? `Summary · ${selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
        : 'Summary · All Time'}
    </h2>
    <div className="flex gap-3">
      <div className="flex-1 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
        <p className="text-xs text-slate-400 font-medium mb-1">Total Spending</p>
        <p className="text-base font-extrabold text-white">{formatRupiah(totalSpending)}</p>
        <p className="text-[11px] text-slate-500 font-medium mt-1">
          {transactionCount} expense{transactionCount !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex-1 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
        <p className="text-xs text-slate-400 font-medium mb-1">Daily Average</p>
        <p className="text-base font-extrabold text-white">
          {formatRupiah(transactionCount > 0 ? Math.round(totalSpending / 7) : 0)}
        </p>
        <p className="text-[11px] text-slate-500 font-medium mt-1">over 7 days</p>
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Donut chart
// ---------------------------------------------------------------------------

const CategoryChart = ({ segments, totalSpending }) => (
  <div className="px-5 mt-5">
    <h2 className="text-base font-bold text-slate-200 mb-4">Largest Categories</h2>
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
      {!segments.length ? (
        <p className="text-sm text-slate-500 text-center py-6 font-medium">No expense data yet</p>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative shrink-0 w-32 h-32">
            <div className="w-full h-full rounded-full" style={{ background: buildConicGradient(segments) }} />
            <div className="absolute inset-5 rounded-full bg-slate-800 shadow-inner flex flex-col items-center justify-center">
              <span className="text-[9px] text-slate-500 font-medium">Total</span>
              <span className="text-[11px] font-extrabold text-slate-100 text-center leading-tight">
                {formatRupiah(totalSpending)}
              </span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            {segments.map(({ label, percentage, amount, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-300 leading-tight truncate">{label}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">{formatRupiah(amount)}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400 ml-2 shrink-0">{percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Transaction list
// ---------------------------------------------------------------------------

const TransactionRow = ({ transaction }) => {
  const meta = getCategoryByLabel(transaction.category);
  const Icon = meta.icon;
  const isIncome = transaction.type === 'income';
  const displayTitle = transaction.title || transaction.note || transaction.category;
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${meta.color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-100 truncate">{displayTitle}</p>
        <p className="text-xs text-slate-500 truncate">{transaction.category}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
          {isIncome ? '+' : '-'}{formatRupiah(transaction.amount)}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">{fmtTime(transaction.created_at)}</p>
      </div>
    </div>
  );
};

const TransactionList = ({ transactions, selectedDate }) => (
  <div className="mt-5 px-5 mb-6">
    <h2 className="text-base font-bold text-slate-200 mb-3">Transaction List</h2>
    {transactions.length === 0 ? (
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center mb-3">
          <span className="text-2xl">💸</span>
        </div>
        <p className="text-sm font-semibold text-slate-400">
          {selectedDate ? 'No transactions on this day' : 'No transactions yet'}
        </p>
        <p className="text-xs text-slate-600 mt-1">Tap the + button to add your first one</p>
      </div>
    ) : (
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl divide-y divide-slate-700/40">
        {transactions.map((tx) => <TransactionRow key={tx.id} transaction={tx} />)}
      </div>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const Transactions = () => {
  const { transactions } = useTransactions();
  // Period tab state — default Weekly matches the reference image
  const [period, setPeriod] = useState('Weekly');
  // null = show all days; Date = filter to that specific day (only active when period === 'Daily')
  const [selectedDate, setSelectedDate] = useState(null);

  // When switching period, clear the date selection unless going to Daily
  const handlePeriodChange = (p) => {
    setPeriod(p);
    if (p !== 'Daily') setSelectedDate(null);
  };

  // Filter transactions by period + optional selected date
  const filtered = useMemo(() => {
    if (period === 'Daily' && selectedDate) {
      // Exact day filter
      return transactions.filter((t) => {
        if (!t.created_at) return false;
        return isSameDay(new Date(t.created_at), selectedDate);
      });
    }
    if (period === 'Daily' && !selectedDate) {
      // Daily tab but no specific day chosen → show today
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      return transactions.filter((t) => {
        if (!t.created_at) return false;
        return isSameDay(new Date(t.created_at), todayStart);
      });
    }
    // Weekly / Monthly / Yearly
    const periodStart = getPeriodStart(period);
    if (!periodStart) return transactions;
    return transactions.filter((t) => {
      if (!t.created_at) return false;
      return new Date(t.created_at) >= periodStart;
    });
  }, [transactions, period, selectedDate]);

  const expenses = useMemo(() => filtered.filter((t) => t.type === 'expense'), [filtered]);
  const totalSpending = useMemo(() => expenses.reduce((s, t) => s + (t.amount ?? 0), 0), [expenses]);

  const chartSegments = useMemo(() => {
    if (!totalSpending) return [];
    const grouped = {};
    for (const tx of expenses) {
      const c = tx.category || 'Others';
      grouped[c] = (grouped[c] ?? 0) + (tx.amount ?? 0);
    }
    return Object.entries(grouped)
      .map(([label, amount]) => ({
        label, amount,
        percentage: Math.round((amount / totalSpending) * 100),
        color: CATEGORY_CHART_COLORS[label] ?? CATEGORY_CHART_COLORS.Others,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, totalSpending]);

  return (
    <div className="flex flex-col pb-24 bg-slate-900 min-h-full">
      {/* Page title */}
      <div className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-extrabold text-emerald-400">Transactions</h1>
      </div>

      {/* Period tab pills */}
      <PeriodTabs active={period} onChange={handlePeriodChange} />

      {/* Horizontal date picker — only shown when Daily is active */}
      {period === 'Daily' && (
        <DatePicker selectedDate={selectedDate} onSelect={setSelectedDate} />
      )}

      <WeeklySummary totalSpending={totalSpending} transactionCount={expenses.length} selectedDate={selectedDate} />
      <CategoryChart segments={chartSegments} totalSpending={totalSpending} />
      <TransactionList transactions={filtered} selectedDate={selectedDate} />
    </div>
  );
};

export default Transactions;
