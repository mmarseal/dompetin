import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Pencil, Plus, X, Check } from 'lucide-react';
import { formatRupiah } from '../utils/currency';
import { useTransactions } from '../context/TransactionContext';

const formatDepositDate = (isoTimestamp) => {
  if (!isoTimestamp) return '—';
  const date = new Date(isoTimestamp);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ---------------------------------------------------------------------------
// Edit Goal Modal (dark themed bottom sheet)
// ---------------------------------------------------------------------------

const EditGoalModal = ({ currentTarget, currentTitle, onSave, onClose }) => {
  const [title, setTitle] = useState(currentTitle ?? 'Savings Goal');
  const [target, setTarget] = useState(currentTarget ? String(currentTarget) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const val = parseInt(target, 10);
    if (!val || val <= 0) { setError('Masukkan nominal target yang valid.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ target: val, title: title.trim() || 'Savings Goal' });
      onClose();
    } catch {
      setError('Gagal menyimpan, coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-t-3xl p-6 pb-20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto mb-6" />

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-extrabold text-white">Edit Savings Goal</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
          Nama Goal
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="mis. Dana Darurat"
          className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl px-4 py-3 text-sm font-semibold
                     text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 mb-4"
        />

        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
          Target Amount
        </label>
        <div className="relative mb-2">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">Rp</span>
          <input
            id="edit-goal-target-input"
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="0"
            min={1}
            className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl py-3 pl-10 pr-4 text-sm
                       font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
          />
        </div>

        {error && <p className="text-xs text-red-400 font-medium mt-1 mb-2">{error}</p>}

        <button
          id="save-goal-target-btn"
          onClick={handleSave}
          disabled={saving}
          className="mt-4 w-full bg-emerald-500 text-white font-bold py-3.5 rounded-xl
                     flex items-center justify-center gap-2 text-sm
                     disabled:opacity-60 disabled:cursor-not-allowed
                     active:scale-[0.98] hover:bg-emerald-400 transition-all
                     shadow-lg shadow-emerald-900/50"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {saving ? 'Menyimpan…' : 'Simpan Goal'}
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------

const Header = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center px-4 pt-6 pb-4">
      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-slate-800 transition-colors"
        aria-label="Go back"
      >
        <ChevronLeft className="w-6 h-6 text-slate-300" strokeWidth={2.5} />
      </button>
      <h1 className="flex-1 text-lg font-bold text-center pr-8 text-white">Savings Goal</h1>
    </div>
  );
};

const GoalCard = ({ goal, onEditClick }) => {
  const percentage = goal.target > 0
    ? Math.min(100, Math.round((goal.current / goal.target) * 100))
    : 0;

  return (
    <div className="mx-5 mt-2 rounded-2xl bg-emerald-600 p-5 shadow-lg shadow-emerald-900/40 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-8 -right-2 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />

      {/* Title & Edit */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-white font-bold text-lg tracking-tight flex-1">{goal.title}</h2>
        <button
          id="edit-goal-btn"
          onClick={onEditClick}
          aria-label="Edit goal target"
          className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center
                     hover:bg-white/30 active:scale-90 transition-all"
        >
          <Pencil className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      {/* Amounts */}
      <div className="flex items-baseline gap-1.5 mb-5">
        <span className="text-white text-2xl font-extrabold tracking-tight">{formatRupiah(goal.current)}</span>
        <span className="text-emerald-100 text-sm font-medium">/ {formatRupiah(goal.target)}</span>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-3 bg-emerald-800/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-white font-bold text-base">{percentage}%</span>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-yellow-300 text-xs font-semibold">Target reached {percentage}%</p>
        <p className="text-emerald-100 text-xs font-medium">
          {goal.estimatedDays
            ? `Estimated to reach in ${goal.estimatedDays} days`
            : 'keep saving to reach your goal broh!'}
        </p>
      </div>
    </div>
  );
};

const DepositInput = ({ onDeposit }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    const val = parseInt(amount, 10);
    if (!isNaN(val) && val > 0) {
      setLoading(true);
      await onDeposit(val);
      setAmount('');
      setLoading(false);
    }
  };

  return (
    <div className="mx-5 mt-6 bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl">
      <p className="text-sm font-bold text-slate-200 mb-3">Add to Savings</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">Rp</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            disabled={loading}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3
                       text-sm font-semibold text-slate-100 placeholder-slate-600
                       focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-60"
          />
        </div>
        <button
          onClick={handleDeposit}
          disabled={loading || !amount || parseInt(amount, 10) <= 0}
          className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed transition-opacity
                     active:scale-95 hover:bg-emerald-400 min-w-[88px]"
        >
          {loading ? 'Saving…' : 'Deposit'}
        </button>
      </div>
    </div>
  );
};

const DepositHistoryList = ({ history = [] }) => (
  <div className="mt-8 px-5">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-bold text-slate-200">Deposit History</h2>
      <button className="text-xs text-emerald-400 font-semibold hover:underline">View All</button>
    </div>
    <div className="flex flex-col divide-y divide-slate-800">
      {history.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center font-medium">No deposits yet</p>
      ) : (
        history.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold text-slate-100">+ {formatRupiah(item.amount)}</span>
            </div>
            <span className="text-sm text-slate-500 font-medium">{formatDepositDate(item.created_at)}</span>
          </div>
        ))
      )}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const Goals = () => {
  const { goalState, addGoalDeposit, updateGoalTarget } = useTransactions();
  const [showEditModal, setShowEditModal] = useState(false);

  const safeGoal = goalState || {
    title: 'Belum ada Target',
    current: 0,
    target: 0,
    history: [],
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-900 pb-6">
      <Header />
      <GoalCard goal={safeGoal} onEditClick={() => setShowEditModal(true)} />
      <DepositInput onDeposit={addGoalDeposit} />
      <DepositHistoryList history={safeGoal.history} />

      {showEditModal && (
        <EditGoalModal
          currentTarget={goalState?.target}
          currentTitle={goalState?.title}
          onSave={updateGoalTarget}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default Goals;
