import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import {
  ChevronRight, ShieldCheck, Settings,
  AlertCircle, LogOut, Wallet, User,
} from 'lucide-react';
import { formatRupiah } from '../utils/currency';

// ---------------------------------------------------------------------------
// Static menu rows
// ---------------------------------------------------------------------------

const MENU_ITEMS = [
  { id: 'security', icon: ShieldCheck, label: 'Security',       desc: 'Password & 2FA'          },
  { id: 'settings', icon: Settings,    label: 'Settings',       desc: 'App preferences'          },
  { id: 'report',   icon: AlertCircle, label: 'Report Problem', desc: 'Send feedback to us'      },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const TopSection = ({ displayName, email, balance }) => {
  const letter = (displayName?.[0] ?? '?').toUpperCase();
  return (
    <div className="px-5 pt-8 pb-6">
      {/* Avatar + name row */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30
                        flex items-center justify-center shrink-0 shadow-lg">
          <span className="text-2xl font-extrabold text-emerald-400 select-none">{letter}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold text-white truncate">{displayName}</h1>
          <p className="text-sm text-slate-500 truncate">{email}</p>
        </div>
      </div>

      {/* Balance summary card */}
      <div className="rounded-2xl bg-emerald-600 p-4 shadow-lg shadow-emerald-900/40 relative overflow-hidden">
        <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-6 -left-2 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-emerald-100 text-xs font-medium">Total Balance</p>
            <p className="text-white text-xl font-extrabold tracking-tight">{formatRupiah(balance)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const GoalProgressCard = ({ goalState }) => {
  if (!goalState) return null;
  const pct = goalState.target > 0
    ? Math.min(100, Math.round((goalState.current / goalState.target) * 100))
    : 0;

  return (
    <div className="mx-5 mb-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Savings Goal</p>
        <span className="text-xs font-bold text-emerald-400">{pct}%</span>
      </div>
      <p className="text-sm font-bold text-slate-100 mb-1">{goalState.title ?? 'Savings Goal'}</p>
      <p className="text-xs text-slate-400 mb-3">
        Nabung{' '}
        <span className="text-white font-semibold">{formatRupiah(goalState.current)}</span>
        {' / '}
        {formatRupiah(goalState.target)}
      </p>
      <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const MenuRow = ({ icon: Icon, label, desc, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-4 px-5 py-4 w-full transition-colors group
                ${danger
                  ? 'hover:bg-red-500/10 active:bg-red-500/20'
                  : 'hover:bg-slate-800/60 active:bg-slate-800'}`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-active:scale-95
                     ${danger
                       ? 'bg-red-500/20 border border-red-500/30'
                       : 'bg-slate-800 border border-slate-700'}`}>
      <Icon className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-emerald-400'}`} strokeWidth={2} />
    </div>
    <div className="flex-1 text-left min-w-0">
      <p className={`text-sm font-bold ${danger ? 'text-red-400' : 'text-slate-200'}`}>{label}</p>
      {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
    </div>
    <ChevronRight className={`w-4 h-4 shrink-0 ${danger ? 'text-red-400/60' : 'text-slate-600'}`} />
  </button>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const Profile = () => {
  const { user, signOut } = useAuth();
  const { currentBalance, goalState } = useTransactions();

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split('@')[0] ??
    'User';

  const email = user?.email ?? '';

  const handleLogout = async () => {
    try { await signOut(); }
    catch (err) { console.error('[Profile] Logout failed:', err.message); }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-900 pb-6">
      {/* Top: Avatar + name + balance card */}
      <TopSection displayName={displayName} email={email} balance={currentBalance} />

      {/* Goal progress card */}
      <GoalProgressCard goalState={goalState} />

      {/* Divider */}
      <div className="mx-5 mb-2 h-px bg-slate-800" />

      {/* Menu rows */}
      <div className="flex flex-col">
        {MENU_ITEMS.map((item) => (
          <MenuRow key={item.id} icon={item.icon} label={item.label} desc={item.desc} />
        ))}

        {/* Logout — red, wired to signOut */}
        <div className="mx-5 my-2 h-px bg-slate-800" />
        <MenuRow
          icon={LogOut}
          label="Log Out"
          desc="Sign out of your account"
          onClick={handleLogout}
          danger
        />
      </div>
    </div>
  );
};

export default Profile;
