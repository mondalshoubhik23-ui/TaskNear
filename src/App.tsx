import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { TopBar } from './components/layout/TopBar.tsx';
import { BottomNav } from './components/layout/BottomNav.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { ToastContainer } from './components/ui/ToastContainer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { TasksPage } from './pages/TasksPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { VerificationPage } from './pages/VerificationPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';

export type AppView = 'home' | 'tasks' | 'profile' | 'verification' | 'admin';

function MainApp() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const { isLoading } = useAuth();

  const handleNavigate = (view: string) => {
    setCurrentView(view as AppView);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 animate-pulse flex items-center justify-center text-white font-black text-lg">
            T
          </div>
          <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
            Loading TaskHop...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      <TopBar currentView={currentView} setCurrentView={handleNavigate} />

      <main className="flex-1 pb-16 md:pb-0">
        {currentView === 'home' && <HomePage setCurrentView={handleNavigate} />}
        {currentView === 'tasks' && <TasksPage setCurrentView={handleNavigate} />}
        {currentView === 'profile' && <ProfilePage setCurrentView={handleNavigate} />}
        {currentView === 'verification' && <VerificationPage setCurrentView={handleNavigate} />}
        {currentView === 'admin' && <AdminPage setCurrentView={handleNavigate} />}
      </main>

      <Footer />
      <BottomNav currentView={currentView} setCurrentView={handleNavigate} />
      <AuthModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
