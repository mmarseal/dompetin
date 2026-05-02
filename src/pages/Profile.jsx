import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  User,
  ShieldCheck,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Static Menu Data
// ---------------------------------------------------------------------------

const MENU_ITEMS = [
  { id: 'edit', icon: User, label: 'Edit Profile' },
  { id: 'security', icon: ShieldCheck, label: 'Security' },
  { id: 'settings', icon: Settings, label: 'Setting' },
  { id: 'help', icon: HelpCircle, label: 'Help' },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Top Header
 */
const Header = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center px-4 pt-6 pb-4">
      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Go back"
      >
        <ChevronLeft className="w-6 h-6 text-gray-800" strokeWidth={2.5} />
      </button>
      <h1 className="flex-1 text-lg font-bold text-center pr-8 text-gray-800">
        Profile
      </h1>
    </div>
  );
};

/**
 * User Information Banner
 */
const UserCard = () => (
  <div className="mx-5 mt-2 rounded-[24px] bg-[#189C63] py-8 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
    {/* Subtle background decoration */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8 pointer-events-none" />

    {/* Avatar placeholder */}
    <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-4 shadow-md overflow-hidden relative z-10 border-4 border-emerald-400/30">
      <User className="w-12 h-12 text-[#189C63]" strokeWidth={2} />
    </div>

    <h2 className="text-white text-xl font-bold tracking-tight mb-1 relative z-10">
      John Smith
    </h2>
    <p className="text-emerald-100 text-sm font-medium relative z-10">
      johnsmith911@student.unpam.ac.id
    </p>
  </div>
);

/**
 * Individual List Item
 */
const MenuItem = ({ icon: Icon, label }) => (
  <button className="flex items-center gap-5 px-5 py-3 w-full hover:bg-gray-50 active:bg-gray-100 transition-colors group">
    <div className="w-14 h-14 rounded-2xl bg-[#189C63] flex items-center justify-center shrink-0 shadow-sm group-active:scale-95 transition-transform">
      <Icon className="w-6 h-6 text-white" strokeWidth={2} />
    </div>
    <span className="text-[15px] font-bold text-gray-800">{label}</span>
  </button>
);

/**
 * Menu List including the distinct Logout button
 */
const MenuList = () => (
  <div className="mt-8 flex flex-col gap-2 pb-6">
    {MENU_ITEMS.map((item) => (
      <MenuItem key={item.id} icon={item.icon} label={item.label} />
    ))}

    {/* Explicitly red/prominent Log Out per requirements */}
    <button className="flex items-center gap-5 px-5 py-3 w-full hover:bg-red-50 active:bg-red-100 transition-colors group mt-2">
      <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center shrink-0 shadow-sm group-active:scale-95 transition-transform">
        <LogOut className="w-6 h-6 text-white" strokeWidth={2} />
      </div>
      <span className="text-[15px] font-bold text-red-600">Log Out</span>
    </button>
  </div>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const Profile = () => {
  return (
    <div className="flex flex-col min-h-full bg-white pb-6">
      <Header />
      <UserCard />
      <MenuList />
    </div>
  );
};

export default Profile;
