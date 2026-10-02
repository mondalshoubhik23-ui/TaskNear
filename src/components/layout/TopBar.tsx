import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { ShieldCheck, UserCheck, ShieldAlert, LogOut, ArrowRightLeft, Sparkles, User, Settings } from 'lucide-react';

interface TopBarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ currentView, setCurrentView }) => {
  const { user, persona, setPersona, toggleAvailability, openAuthModal, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text wordmark brand */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-base font-extrabold shadow-sm group-hover:scale-105 transition-transform">
                T
              </span>
              TaskHop
            </span>
          </button>

          {/* Quick Dual Persona Switcher */}
          {user && (
            <div className="hidden sm:flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setPersona('customer')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  persona === 'customer'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                I Need Help
              </button>
              <button
                onClick={() => setPersona('worker')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  persona === 'worker'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                I Want to Earn
              </button>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setCurrentView('home')}
            className={`transition-colors cursor-pointer ${
              currentView === 'home' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setCurrentView('tasks')}
            className={`transition-colors cursor-pointer ${
              currentView === 'tasks' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Nearby Tasks
          </button>
          {user && (
            <button
              onClick={() => setCurrentView('verification')}
              className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'verification' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Verification
            </button>
          )}
          {user?.role === 'admin' && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer flex items-center gap-1 ${
                currentView === 'admin' ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Admin Portal
            </button>
          )}
        </nav>

        {/* Zone 3: Actions & User Menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Worker Availability quick toggle */}
              <button
                onClick={toggleAvailability}
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  user.profile?.is_available
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                }`}
                title="Toggle your availability to accept nearby tasks"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    user.profile?.is_available ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span>{user.profile?.is_available ? 'Available to Earn' : 'Offline'}</span>
              </button>

              {/* Profile button */}
              <button
                onClick={() => setCurrentView('profile')}
                className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all cursor-pointer ${
                  currentView === 'profile'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs overflow-hidden">
                  {user.profile?.avatar_url ? (
                    <img
                      src={user.profile.avatar_url}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <div className="hidden lg:block text-left pr-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {user.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {user.profile?.verification_status === 'VERIFIED' ? (
                      <span className="text-emerald-600 font-medium">Verified ID</span>
                    ) : (
                      <span>Unverified</span>
                    )}
                  </div>
                </div>
              </button>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
