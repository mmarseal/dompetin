import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MobileLayout from './layouts/MobileLayout';
import SplashScreen from './components/SplashScreen';
import Home from './pages/Home';
import AddTransaction from './pages/AddTransaction';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Profile from './pages/Profile';

/**
 * App – Root routing configuration.
 *
 * All routes are nested under MobileLayout so every page shares
 * the phone shell and BottomNavigation automatically.
 *
 * Route map:
 *  /             → Home
 *  /transactions → Transactions
 *  /add          → AddTransaction
 *  /goals        → Goals
 *  /profile      → Profile
 *  *             → Redirect to /
 */
const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
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

export default App;
