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


const AppShell = () => {
  const { user, authLoading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), 2900);
    return () => clearTimeout(timer);
  }, []);

  if (!splashDone || authLoading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <Login />;
  }

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

const App = () => (
  <AuthProvider>
    <TransactionProvider>
      <AppShell />
    </TransactionProvider>
  </AuthProvider>
);

export default App;
