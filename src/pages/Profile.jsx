import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import {
  ChevronRight, ShieldCheck, Settings,
  AlertCircle, LogOut, Wallet, X, Check, Eye, EyeOff,
} from 'lucide-react';
import { formatRupiah } from '../utils/currency';
import { supabase } from '../supabase.js';

const BottomSheet = ({ onClose, children }) => (
  <div
    className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-t-3xl
                 shadow-2xl px-6 pt-4 pb-10 animate-slide-up"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drag handle */}
      <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto mb-5" />
      {children}
    </div>
  </div>
);

const Toggle = ({ on, onChange, id }) => (
  <button
    id={id}
    role="switch"
    aria-checked={on}
    onClick={() => onChange(!on)}
    className={`relative inline-flex w-12 h-6 rounded-full transition-colors duration-200 shrink-0
                ${on ? 'bg-[#1fba7e]' : 'bg-slate-700'}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md
                  transition-transform duration-200 ${on ? 'translate-x-6' : 'translate-x-0'}`}
    />
  </button>
);

const ToggleRow = ({ id, label, desc, on, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-800 last:border-0">
    <div className="flex-1 min-w-0 pr-4">
      <p className="text-sm font-semibold text-slate-200">{label}</p>
      {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
    </div>
    <Toggle id={id} on={on} onChange={onChange} />
  </div>
);

const SecurityModal = ({ onClose }) => {
  const [appPin, setAppPin] = useState(false);

  return (
    <BottomSheet onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-extrabold text-white">Security</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700
                     flex items-center justify-center hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">
        Privacy &amp; Access
      </p>
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl px-4">
        <ToggleRow
          id="toggle-app-pin"
          label="Enable App PIN"
          desc="Require a PIN to open Dompetin"
          on={appPin}
          onChange={setAppPin}
        />
      </div>

      <p className="text-xs text-slate-600 text-center mt-5">
        Changes are saved automatically
      </p>
    </BottomSheet>
  );
};

const SettingsModal = ({ onClose }) => {
  const [pushNotifs, setPushNotifs] = useState(true);
  const [monthlyEmail, setMonthlyEmail] = useState(false);

  return (
    <BottomSheet onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-extrabold text-white">Settings</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700
                     flex items-center justify-center hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">
        Notifications
      </p>
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl px-4">
        <ToggleRow
          id="toggle-push-notifs"
          label="Push Notifications"
          desc="Transaction alerts &amp; reminders"
          on={pushNotifs}
          onChange={setPushNotifs}
        />
        <ToggleRow
          id="toggle-monthly-email"
          label="Monthly Report Emails"
          desc="Receive your spending summary via email"
          on={monthlyEmail}
          onChange={setMonthlyEmail}
        />
      </div>

      <p className="text-xs text-slate-600 text-center mt-5">
        Changes are saved automatically
      </p>
    </BottomSheet>
  );
};

const ReportModal = ({ onClose }) => {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('feedbacks')
        .insert([{ user_id: user.id, message: text.trim() }]);
      if (error) {
        console.error('[ReportModal] Supabase insert error:', error);
      } else {
        setText('');
        setSubmitted(true);
        setTimeout(onClose, 1800);
      }
    } catch (err) {
      console.error('[ReportModal] Unexpected error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-extrabold text-white">Report a Problem</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700
                     flex items-center justify-center hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {submitted ? (
        /* Success state */
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30
                          flex items-center justify-center">
            <Check className="w-7 h-7 text-emerald-400" strokeWidth={2.5} />
          </div>
          <p className="text-sm font-bold text-slate-200">Report Sent!</p>
          <p className="text-xs text-slate-500 text-center">
            Thanks for the feedback. We'll look into it shortly.
          </p>
        </div>
      ) : (
        <>
          <label
            htmlFor="report-textarea"
            className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2"
          >
            Describe your issue
          </label>
          <textarea
            id="report-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What went wrong? Be as detailed as possible…"
            rows={5}
            className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl px-4 py-3
                       text-sm text-slate-100 placeholder-slate-600 font-medium resize-none
                       focus:outline-none focus:ring-2 focus:ring-emerald-500/60
                       focus:border-emerald-500/60 transition-all"
          />

          <button
            id="submit-report-btn"
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            className="mt-4 w-full bg-emerald-500 text-white font-bold py-3.5 rounded-xl
                       flex items-center justify-center gap-2 text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed
                       active:scale-[0.98] hover:bg-emerald-400 transition-all
                       shadow-lg shadow-emerald-900/50"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" strokeWidth={2.5} />
            )}
            {submitting ? 'Sending…' : 'Submit Report'}
          </button>
        </>
      )}
    </BottomSheet>
  );
};

// Sub-components
const TopSection = ({ displayName, email, balance, showBalance, onToggle }) => {
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
          <div className="flex-1 min-w-0">
            {/* Label + eye toggle */}
            <div className="flex items-center gap-1.5">
              <p className="text-emerald-100 text-xs font-medium">Total Balance</p>
              <button
                onClick={onToggle}
                aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                className="w-5 h-5 rounded-full flex items-center justify-center
                           text-emerald-200/70 hover:text-white transition-colors active:scale-90"
              >
                {showBalance
                  ? <Eye className="w-3 h-3" strokeWidth={2} />
                  : <EyeOff className="w-3 h-3" strokeWidth={2} />}
              </button>
            </div>
            <p className="text-white text-xl font-extrabold tracking-tight">
              {showBalance ? formatRupiah(balance) : 'Rp •••••••'}
            </p>
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
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                     transition-transform group-active:scale-95
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

const Profile = () => {
  const { user, signOut } = useAuth();
  const { currentBalance, goalState, showBalance, toggleBalance } = useTransactions();

  const [showSecurity, setShowSecurity] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReport, setShowReport] = useState(false);

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
      <TopSection displayName={displayName} email={email} balance={currentBalance} showBalance={showBalance} onToggle={toggleBalance} />

      {/* Goal progress card */}
      <GoalProgressCard goalState={goalState} />

      {/* Divider */}
      <div className="mx-5 mb-2 h-px bg-slate-800" />

      {/* Menu rows */}
      <div className="flex flex-col">
        <MenuRow
          icon={ShieldCheck}
          label="Security"
          desc="Password &amp; 2FA"
          onClick={() => setShowSecurity(true)}
        />
        <MenuRow
          icon={Settings}
          label="Settings"
          desc="App preferences"
          onClick={() => setShowSettings(true)}
        />
        <MenuRow
          icon={AlertCircle}
          label="Report Problem"
          desc="Send feedback to us"
          onClick={() => setShowReport(true)}
        />

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

      {/* Modals */}
      {showSecurity && <SecurityModal onClose={() => setShowSecurity(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showReport && <ReportModal onClose={() => setShowReport(false)} />}
    </div>
  );
};

export default Profile;
