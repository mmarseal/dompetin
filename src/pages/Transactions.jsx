import { useState, useMemo, useRef, useEffect } from 'react';
import { Trash2, Sparkles } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useTransactions } from '../context/TransactionContext';
import { getCategoryByLabel } from '../constants/categories';
import { formatRupiah } from '../utils/currency';

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
  if (period === 'Daily') { /* today only – handled by selectedDate */ return d; }
  if (period === 'Weekly') { d.setDate(d.getDate() - 6); return d; }
  if (period === 'Monthly') { d.setDate(1); return d; }
  if (period === 'Yearly') { d.setMonth(0, 1); return d; }
  return null;
};

const PERIODS = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

const PeriodTabs = ({ active, onChange }) => (
  <div className="flex gap-2 px-5 pb-2">
    {PERIODS.map((p) => (
      <button
        key={p}
        onClick={() => onChange(p)}
        className={`flex-1 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95
                    ${active === p
            ? 'bg-[#189C63] text-white shadow-md shadow-emerald-900/40'
            : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
          }`}
      >
        {p}
      </button>
    ))}
  </div>
);

const AIInsightWidget = ({ transactions, period }) => {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset insight whenever the filtered transactions change (period/date switched)
  useEffect(() => { setInsight(''); }, [transactions]);

  const handleGenerateInsight = async () => {
    if (loading) return;

    if (!transactions || transactions.length === 0) {
      setInsight('Belum ada transaksi bro, aman!');
      return;
    }

    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount ?? 0), 0);
      const totalExpense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount ?? 0), 0);

      const prompt = `Ini data keuanganku periode ini. Pemasukan: Rp${totalIncome}, Pengeluaran: Rp${totalExpense}. Rincian transaksi: ${JSON.stringify(transactions.map((t) => ({ kategori: t.category, nominal: t.amount, tipe: t.type })))}. Berikan 1 atau 2 kalimat singkat insight atau roasting keuangan yang asik, pakai bahasa gaul Gen Z Indonesia (pakai lu/gua, bro). Jangan pakai format markdown/bold/asterisk, langsung teks aja.`;

      const result = await model.generateContent(prompt);
      setInsight(result.response.text());
    } catch (err) {
      console.error('[AIInsightWidget] Gemini error:', err);
      setInsight('Waduh, AI-nya lagi pusing mikirin keuangan lu. Coba lagi nanti ya!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#161a22] to-[#1a202c] border border-[#2a2d35]
                    rounded-xl p-4 my-4 mx-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Sparkles
          className={`w-3.5 h-3.5 ${loading ? 'animate-pulse' : ''}`}
          style={{ color: '#1fba7e' }}
          strokeWidth={2}
        />
        <span className="text-xs font-semibold tracking-wider" style={{ color: '#1fba7e' }}>
          AI INSIGHT
        </span>
        <span className="ml-auto text-[10px] text-slate-600 font-medium uppercase tracking-wide">
          {period}
        </span>
      </div>
      {/* Body */}
      {loading ? (
        <p className="text-sm leading-relaxed italic animate-pulse" style={{ color: '#4a5568' }}>
          AI lagi nerawang dompet lu…
        </p>
      ) : insight ? (
        <p className="text-sm leading-relaxed italic" style={{ color: '#8a9bb0' }}>
          {insight}
        </p>
      ) : (
        <button
          onClick={handleGenerateInsight}
          className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold
                     transition-all duration-200 active:scale-95 hover:bg-[#1fba7e]/10"
          style={{ borderColor: '#1fba7e33', color: '#1fba7e' }}
        >
          <Sparkles className="w-3 h-3" strokeWidth={2} />
          Minta Nasihat AI
        </button>
      )}
    </div>
  );
};

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

const TransactionRow = ({ transaction, onDelete }) => {
  const meta = getCategoryByLabel(transaction.category);
  const Icon = meta.icon;
  const isIncome = transaction.type === 'income';
  const displayTitle = transaction.title || transaction.note || transaction.category;

  const handleDelete = () => {
    if (window.confirm('Delete this transaction?')) {
      onDelete(transaction.id);
    }
  };

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
      <button
        onClick={handleDelete}
        aria-label="Delete transaction"
        className="ml-1 w-7 h-7 rounded-full flex items-center justify-center
                   text-slate-600 hover:text-red-400 hover:bg-red-400/10
                   transition-colors active:scale-90 shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
    </div>
  );
};

const TransactionList = ({ transactions, selectedDate, onDelete }) => (
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
        {transactions.map((tx) => <TransactionRow key={tx.id} transaction={tx} onDelete={onDelete} />)}
      </div>
    )}
  </div>
);

const Transactions = () => {
  const { transactions, deleteTransaction } = useTransactions();
  const [period, setPeriod] = useState('Weekly');
  // null = show all days
  const [selectedDate, setSelectedDate] = useState(null);

  const handlePeriodChange = (p) => {
    setPeriod(p);
    if (p !== 'Daily') setSelectedDate(null);
  };

  const filtered = useMemo(() => {
    if (period === 'Daily' && selectedDate) {
      return transactions.filter((t) => {
        if (!t.created_at) return false;
        return isSameDay(new Date(t.created_at), selectedDate);
      });
    }
    if (period === 'Daily' && !selectedDate) {
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
      <AIInsightWidget transactions={filtered} period={period} />
      <CategoryChart segments={chartSegments} totalSpending={totalSpending} />
      <TransactionList transactions={filtered} selectedDate={selectedDate} onDelete={deleteTransaction} />
    </div>
  );
};

export default Transactions;
