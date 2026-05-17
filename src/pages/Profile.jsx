import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ChevronLeft, User, ShieldCheck, Settings, HelpCircle, LogOut,
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'edit',     icon: User,        label: 'Edit Profile' },
  { id: 'security', icon: ShieldCheck, label: 'Security'     },
  { id: 'settings', icon: Settings,    label: 'Setting'      },
  { id: 'help',     icon: HelpCircle,  label: 'Help'         },
];

const Header = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center px-4 pt-6 pb-4">
      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-slate-800 transition-colors"
        aria-label="Go back"
      >
        <ChevronLeft className="w-6 h-6 text-slate-300" strokeWidth={2.5} />
      </button>
      <h1 className="flex-1 text-lg font-bold text-center pr-8 text-white">Profile</h1>
    </div>
  );
};

const UserCard = ({ displayName, email }) => (
  <div className="mx-5 mt-2 rounded-[24px] bg-emerald-600 py-8 flex flex-col items-center justify-center shadow-lg shadow-emerald-900/40 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8 pointer-events-none" />

    <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center mb-4 shadow-md relative z-10">
      <User className="w-12 h-12 text-white" strokeWidth={2} />
    </div>

    <h2 className="text-white text-xl font-bold tracking-tight mb-1 relative z-10">{displayName}</h2>
    <p className="text-emerald-100 text-sm font-medium relative z-10">{email}</p>
  </div>
);

const MenuItem = ({ icon: Icon, label }) => (
  <button className="flex items-center gap-5 px-5 py-3 w-full hover:bg-slate-800/60 active:bg-slate-800 transition-colors group">
    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-sm group-active:scale-95 transition-transform">
      <Icon className="w-6 h-6 text-emerald-400" strokeWidth={2} />
    </div>
    <span className="text-[15px] font-bold text-slate-200">{label}</span>
  </button>
);

const MenuList = ({ onLogout }) => (
  <div className="mt-6 flex flex-col gap-1 pb-6">
    {MENU_ITEMS.map((item) => (
      <MenuItem key={item.id} icon={item.icon} label={item.label} />
    ))}

    {/* Divider */}
    <div className="mx-5 my-2 h-px bg-slate-800" />

    <button
      id="logout-btn"
      onClick={onLogout}
      className="flex items-center gap-5 px-5 py-3 w-full hover:bg-red-500/10 active:bg-red-500/20 transition-colors group"
    >
      <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0 shadow-sm group-active:scale-95 transition-transform">
        <LogOut className="w-6 h-6 text-red-400" strokeWidth={2} />
      </div>
      <span className="text-[15px] font-bold text-red-400">Log Out</span>
    </button>
  </div>
);

const Profile = () => {
  const { user, signOut } = useAuth();

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split('@')[0] ??
    'User';

  const email = user?.email ?? '';

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('[Profile] Logout failed:', err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-900 pb-6">
      <Header />
      <UserCard displayName={displayName} email={email} />
      <MenuList onLogout={handleLogout} />
    </div>
  );
};

export default Profile;
