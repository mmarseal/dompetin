import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Pencil, Plus } from 'lucide-react';
import { formatRupiah } from '../utils/currency';
import { useTransactions } from '../context/TransactionContext';

/**
 * Format a Supabase ISO timestamp (created_at) into a localised Indonesian date.
 * Falls back gracefully if the value is null / invalid.
 */
const formatDepositDate = (isoTimestamp) => {
  if (!isoTimestamp) return '—';
  const date = new Date(isoTimestamp);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const Header = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center px-4 pt-6 pb-4">
      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Go back"
      >
        <ChevronLeft className="w-6 h-6 text-gray-800" strokeWidth={2.5} />
      </button>
      <h1 className="flex-1 text-lg font-bold text-center pr-8 text-gray-800">
        Savings Goal
      </h1>
    </div>
  );
};

const GoalCard = ({ goal }) => {
  const percentage = Math.min(
    100,
    Math.round((goal.current / goal.target) * 100)
  );

  return (
    <div className="mx-5 mt-2 rounded-2xl bg-[#189C63] p-5 shadow-lg relative overflow-hidden">
      {/* Title & Edit Icon */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-white font-bold text-lg tracking-tight">
          {goal.title}
        </h2>
        <Pencil className="w-4 h-4 text-emerald-100" />
      </div>

      {/* Amounts */}
      <div className="flex items-baseline gap-1.5 mb-5">
        <span className="text-white text-2xl font-extrabold tracking-tight">
          {formatRupiah(goal.current)}
        </span>
        <span className="text-emerald-100 text-sm font-medium">
          / {formatRupiah(goal.target)}
        </span>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-3 bg-emerald-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-white font-bold text-base">{percentage}%</span>
      </div>

      {/* Footer info */}
      <div className="flex flex-col gap-1">
        <p className="text-yellow-400 text-xs font-semibold">
          Target reached {percentage}%
        </p>
        <p className="text-emerald-50 text-xs font-medium">
          {goal.estimatedDays
            ? `Estimated to reach in ${goal.estimatedDays} days`
            : 'Keep saving to reach your goal!'}
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
    <div className="mx-5 mt-6 bg-gray-50 border border-gray-100 p-4 rounded-2xl">
      <p className="text-sm font-bold text-gray-800 mb-3">Add to Savings</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">
            Rp
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            disabled={loading}
            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-3
                       text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2
                       focus:ring-[#189C63]/50 disabled:opacity-60"
          />
        </div>
        <button
          onClick={handleDeposit}
          disabled={loading || !amount || parseInt(amount, 10) <= 0}
          className="bg-[#189C63] text-white px-5 py-2.5 rounded-xl font-bold text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed transition-opacity
                     active:scale-95 hover:bg-emerald-700 min-w-[88px]"
        >
          {loading ? 'Saving…' : 'Deposit'}
        </button>
      </div>
    </div>
  );
};

const DepositHistoryList = ({ history }) => {
  return (
    <div className="mt-8 px-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-800">Deposit History</h2>
        <button className="text-xs text-[#189C63] font-semibold hover:underline">
          View All
        </button>
      </div>

      <div className="flex flex-col divide-y divide-gray-100">
        {history.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center font-medium">
            No deposits yet
          </p>
        ) : (
          history.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-100 bg-emerald-50 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 text-[#189C63]" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  + {formatRupiah(item.amount)}
                </span>
              </div>
              <span className="text-sm text-gray-400 font-medium">
                {formatDepositDate(item.created_at)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const Goals = () => {
  const { goalState, addGoalDeposit } = useTransactions();

  return (
    <div className="flex flex-col min-h-full bg-white pb-6">
      <Header />
      <GoalCard goal={goalState} />
      <DepositInput onDeposit={addGoalDeposit} />
      <DepositHistoryList history={goalState.history} />
    </div>
  );
};

export default Goals;
