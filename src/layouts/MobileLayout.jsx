import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

/**
 * MobileLayout
 *
 * Creates a centered "phone shell" on desktop browsers while filling the screen on
 * actual mobile devices. All pages are rendered inside the <Outlet /> slot.
 *
 * Layout constraints:
 *  - max-w-md   → caps width at 448 px (phone-width simulation)
 *  - mx-auto    → centers the shell horizontally
 *  - min-h-screen → always fills the viewport height
 *  - relative   → establishes a stacking context for the fixed BottomNavigation
 *  - overflow-x-hidden → prevents horizontal scroll bleed
 *  - shadow-xl  → visible phone-edge shadow on desktop
 */
const MobileLayout = () => {
  return (
    /* Outer centering wrapper – visible as the "desk" background on wide screens */
    <div className="min-h-screen bg-gray-100 flex items-start justify-center">
      {/* Phone shell */}
      <div className="relative w-full max-w-md min-h-screen bg-gray-50 shadow-xl overflow-x-hidden flex flex-col">
        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto pb-24">
          <Outlet />
        </main>

        {/* Fixed bottom navigation anchored inside the phone shell */}
        <BottomNavigation />
      </div>
    </div>
  );
};

export default MobileLayout;
