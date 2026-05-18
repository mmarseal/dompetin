import { useState } from 'react';
import { Wallet, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const InputField = ({ id, label, type, value, onChange, placeholder, icon: Icon, rightElement }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
          <Icon className="w-4 h-4" />
        </span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={type === 'password' ? 'current-password' : 'email'}
        className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600
                   focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/60
                   transition-all duration-200 pl-10 pr-10"
      />
      {rightElement && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</span>
      )}
    </div>
  </div>
);


const Login = () => {
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetFeedback = () => { setError(''); setSuccess(''); };

  /* Email/Password submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    resetFeedback();

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await signUp({ email, password });
        setSuccess('Account created! Please check your email to confirm your address.');
      } else {
        await signIn({ email, password });
      }
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* Google OAuth */
  const handleGoogle = async () => {
    resetFeedback();
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Redirect is handled by Supabase
    } catch (err) {
      setError(err.message ?? 'Google sign-in failed.');
      setGoogleLoading(false);
    }
  };

  const toggleMode = () => {
    resetFeedback();
    setEmail('');
    setPassword('');
    setIsRegister((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-start justify-center">
      {/* Phone shell container */}
      <div className="relative w-full max-w-md min-h-screen bg-slate-900 shadow-2xl overflow-hidden flex flex-col">

        {/* Decorative gradient blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
        />

        <div className="flex flex-col items-center pt-16 pb-8 px-8 select-none">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/10">
            <Wallet className="w-8 h-8 text-emerald-400" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dompetin</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Track your money. Control your life.</p>
        </div>

        <div className="flex-1 px-6 pb-10">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-sm shadow-xl">

            <h2 className="text-lg font-bold text-white mb-1">
              {isRegister ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-slate-500 text-xs mb-6">
              {isRegister
                ? 'Start tracking your finances for free.'
                : 'Sign in to continue to Dompetin.'}
            </p>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-xs mb-4 leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div
                role="status"
                className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-4 py-3 text-xs mb-4 leading-relaxed"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <InputField
                id="auth-email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={Mail}
              />
              <InputField
                id="auth-password"
                label="Password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={Lock}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-3 rounded-xl font-bold text-sm text-white
                           bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]
                           disabled:opacity-60 disabled:cursor-not-allowed
                           transition-all duration-200 shadow-lg shadow-emerald-600/20"
              >
                {loading
                  ? (isRegister ? 'Creating account…' : 'Signing in…')
                  : (isRegister ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5" aria-hidden="true">
              <div className="flex-1 h-px bg-slate-700/80" />
              <span className="text-slate-600 text-xs font-semibold tracking-widest uppercase">or</span>
              <div className="flex-1 h-px bg-slate-700/80" />
            </div>

            {/* Google button */}
            <button
              id="google-signin-btn"
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl
                         bg-white/5 border border-slate-700/80 hover:bg-white/10 hover:border-slate-600
                         text-sm font-semibold text-slate-200 active:scale-[0.98]
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-all duration-200"
            >
              {googleLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  <span>Redirecting…</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Toggle register/login */}
            <p className="text-center text-slate-500 text-xs mt-6">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                id="auth-toggle-btn"
                type="button"
                onClick={toggleMode}
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              >
                {isRegister ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
