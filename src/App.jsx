import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import MobileLayout from './layouts/MobileLayout';
import SplashScreen from './components/SplashScreen';
import Login from './components/Login';
import Home from './pages/Home';
import AddTransaction from './pages/AddTransaction';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Profile from './pages/Profile';

/**
 * AppShell – Rendered inside AuthProvider so it can read the auth state.
 *
 * Flow:
 *  1. Show SplashScreen for 2.5 s on first load.
 *  2. While Supabase hydrates the session → keep showing splash (authLoading).
 *  3. If no user → show <Login />.
 *  4. If user exists → show the full routed dashboard.
 *
 * Route map:
 *  /             → Home
 *  /transactions → Transactions
 *  /add          → AddTransaction
 *  /goals        → Goals
 *  /profile      → Profile
 *  *             → Redirect to /
 */
const AppShell = () => {
  const { user, authLoading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), 2900);
    return () => clearTimeout(timer);
  }, []);

  // Show splash while the initial timer is running OR while Supabase hydrates
  if (!splashDone || authLoading) {
    return <SplashScreen />;
  }

  // Not authenticated → show login screen
  if (!user) {
    return <Login />;
  }

  // Authenticated → show the full app
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MobileLayout />}>
          <Route index element={<Home />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="add" element={<AddTransaction />} />
          <Route path="goals" element={<Goals />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

/**
 * App – Root component. Wraps everything with AuthProvider so auth state
 * is available everywhere in the tree (including TransactionContext, which
 * lives in main.jsx).
 */
const App = () => (
  <AuthProvider>
    <TransactionProvider>
      <AppShell />
    </TransactionProvider>
  </AuthProvider>
);

export default App;
