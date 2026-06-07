import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

const MobileLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-start justify-center">
      <div className="relative w-full max-w-md min-h-screen bg-slate-900 shadow-2xl overflow-x-hidden flex flex-col">
        <main className="flex-1 overflow-y-auto pb-24">
          <Outlet />
        </main>

        <BottomNavigation />
      </div>
    </div>
  );
};

export default MobileLayout;
