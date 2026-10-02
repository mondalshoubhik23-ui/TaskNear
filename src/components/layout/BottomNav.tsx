import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Home, Compass, PlusCircle, ShieldCheck, User as UserIcon, ShieldAlert } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  const { user, openAuthModal, persona, setPersona } = useAuth();

  const handleTabClick = (view: string) => {
    if (!user && (view === 'verification' || view === 'profile')) {
      openAuthModal('login');
      return;
    }
    setCurrentView(view);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
        {/* Home */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors ${
            currentView === 'home'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Home</span>
        </button>

        {/* Tasks */}
        <button
          onClick={() => handleTabClick('tasks')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors ${
            currentView === 'tasks'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Tasks</span>
        </button>

        {/* Persona Quick Action */}
        <button
          onClick={() => {
            if (!user) {
              openAuthModal('register');
            } else {
              setPersona(persona === 'customer' ? 'worker' : 'customer');
            }
          }}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 text-emerald-600 dark:text-emerald-400"
          title="Switch mode"
        >
          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">
            {user ? (persona === 'customer' ? 'Need Help' : 'Earn') : 'Join'}
          </span>
        </button>

        {/* Verification */}
        <button
          onClick={() => handleTabClick('verification')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors ${
            currentView === 'verification'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Verify</span>
        </button>

        {/* Profile / Admin */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors ${
            currentView === 'profile'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
};
