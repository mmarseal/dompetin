import { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { getCategoryByLabel } from '../constants/categories';
import { formatRupiah } from '../utils/currency';
import { formatRelativeDate } from '../utils/date';

const CATEGORY_CHART_COLORS = {
  Food: '#F97316', Transport: '#3B82F6', Shopping: '#EC4899',
  Entertainment: '#A855F7', Bills: '#EAB308', Health: '#EF4444',
  Salary: '#10B981', Others: '#6B7280',
};

const buildConicGradient = (segments) => {
  if (!segments.length) return 'conic-gradient(#1e293b 0% 100%)';
  let cum = 0;
  return `conic-gradient(${segments.map(({ color, percentage }) => {
    const s = cum; cum += percentage; return `${color} ${s}% ${cum}%`;
  }).join(', ')})`;
};

const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const rel = formatRelativeDate(iso);
  const t = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${rel}, ${t}`;
};

const Header = ({ period, onPeriodToggle }) => (
  <div className="flex items-center justify-between px-5 pt-6 pb-3">
    <h1 className="text-2xl font-extrabold text-emerald-400">Transactions</h1>
    <button
      id="period-selector"
      onClick={onPeriodToggle}
      className="flex items-center gap-1 text-sm font-semibold text-slate-300
                 bg-slate-800 border border-slate-700 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
    >
      {period}<ChevronDown className="w-4 h-4" />
    </button>
  </div>
);

const WeeklySummary = ({ totalSpending, transactionCount }) => (
  <div className="px-5">
    <h2 className="text-base font-bold text-slate-200 mb-3">Summary</h2>
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
        <p className="text-[10px] text-slate-500 mt-0.5">{fmtDate(transaction.created_at)}</p>
      </div>
    </div>
  );
};

const TransactionList = ({ transactions }) => (
  <div className="mt-5 px-5 mb-6">
    <h2 className="text-base font-bold text-slate-200 mb-3">Transaction List</h2>
    {transactions.length === 0 ? (
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center mb-3">
          <span className="text-2xl">💸</span>
        </div>
        <p className="text-sm font-semibold text-slate-400">No transactions yet</p>
        <p className="text-xs text-slate-600 mt-1">Tap the + button to add your first one</p>
      </div>
    ) : (
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl divide-y divide-slate-700/40">
        {transactions.map((tx) => <TransactionRow key={tx.id} transaction={tx} />)}
      </div>
    )}
  </div>
);

const Transactions = () => {
  const { transactions } = useTransactions();
  const [period, setPeriod] = useState('Weekly');
  const periods = ['Weekly', 'Monthly', 'Yearly'];
  const cyclePeriod = () => setPeriod((p) => periods[(periods.indexOf(p) + 1) % periods.length]);

  const expenses = useMemo(() => transactions.filter((t) => t.type === 'expense'), [transactions]);
  const totalSpending = useMemo(() => expenses.reduce((s, t) => s + (t.amount ?? 0), 0), [expenses]);

  const chartSegments = useMemo(() => {
    if (!totalSpending) return [];
    const grouped = {};
    for (const tx of expenses) { const c = tx.category || 'Others'; grouped[c] = (grouped[c] ?? 0) + (tx.amount ?? 0); }
    return Object.entries(grouped)
      .map(([label, amount]) => ({ label, amount, percentage: Math.round((amount / totalSpending) * 100), color: CATEGORY_CHART_COLORS[label] ?? CATEGORY_CHART_COLORS.Others }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, totalSpending]);

  return (
    <div className="flex flex-col pb-24 bg-slate-900 min-h-full">
      <Header period={period} onPeriodToggle={cyclePeriod} />
      <WeeklySummary totalSpending={totalSpending} transactionCount={expenses.length} />
      <CategoryChart segments={chartSegments} totalSpending={totalSpending} />
      <TransactionList transactions={transactions} />
    </div>
  );
};

export default Transactions;
