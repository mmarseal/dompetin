import { NavLink } from 'react-router-dom';
import { Home, ArrowRightLeft, Flag, User, Plus } from 'lucide-react';

/**
 * Left and right tab definitions (2 each, flanking the centre FAB).
 */
const LEFT_TABS = [
  { to: '/', icon: Home, label: 'Home', id: 'nav-home' },
  { to: '/transactions', icon: ArrowRightLeft, label: 'Transactions', id: 'nav-transactions' },
];

const RIGHT_TABS = [
  { to: '/goals', icon: Flag, label: 'Goals', id: 'nav-goals' },
  { to: '/profile', icon: User, label: 'Profile', id: 'nav-profile' },
];

/**
 * BottomNavigation – Dark navy bottom bar with emerald active states.
 *
 * 5-item mobile bottom bar:
 *   Home | Transactions | [FAB +] | Goals | Profile
 *
 * The centre FAB is absolutely positioned to "float" above the bar edge.
 */
const BottomNavigation = () => {
  return (
    <div className="fixed bottom-0 w-full max-w-md z-50 bg-slate-900">
      {/* Bar */}
      <nav className="relative bg-slate-900 border-t border-slate-800 shadow-2xl h-16">
        <div className="flex items-center h-full">
          {/* Left: Home + Transactions */}
          <div className="flex flex-1 items-center justify-around">
            {LEFT_TABS.map(({ to, icon: Icon, label, id }) => (
              <NavItem key={id} to={to} icon={Icon} label={label} id={id} />
            ))}
          </div>

          {/* Centre spacer – room for the FAB that overlaps the bar */}
          <div className="w-20 flex-shrink-0" />

          {/* Right: Goals + Profile */}
          <div className="flex flex-1 items-center justify-around">
            {RIGHT_TABS.map(({ to, icon: Icon, label, id }) => (
              <NavItem key={id} to={to} icon={Icon} label={label} id={id} />
            ))}
          </div>
        </div>

        {/* Centre FAB – floats above the bar */}
        <NavLink
          to="/add"
          id="nav-add-transaction"
          aria-label="Add Transaction"
          className={({ isActive }) =>
            `absolute -top-6 left-1/2 -translate-x-1/2
             flex items-center justify-center
             w-14 h-14 rounded-full shadow-xl shadow-emerald-900/50
             transition-transform active:scale-90
             ${isActive
               ? 'bg-emerald-600 ring-4 ring-emerald-500/30'
               : 'bg-emerald-500 hover:bg-emerald-400'
             }`
          }
        >
          <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
        </NavLink>
      </nav>
    </div>
  );
};

/**
 * NavItem – a single tab with icon + label.
 * Route-aware via React Router's NavLink.
 */
const NavItem = ({ to, icon: Icon, label, id }) => (
  <NavLink
    to={to}
    id={id}
    end={to === '/'}
    className={({ isActive }) =>
      `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors
       ${isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`
    }
  >
    {({ isActive }) => (
      <>
        <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
        <span className="text-[10px] font-medium">{label}</span>
      </>
    )}
  </NavLink>
);

export default BottomNavigation;
