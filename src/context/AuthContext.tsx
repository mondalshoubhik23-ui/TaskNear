import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getStoredToken } from '../api/client.ts';
import type { User, College, TaskCategory } from '../types/index.ts';

export type UserPersona = 'customer' | 'worker';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  persona: UserPersona;
  setPersona: (persona: UserPersona) => void;
  colleges: College[];
  categories: TaskCategory[];
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    collegeId?: string;
    department?: string;
    yearOfStudy?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  toggleAvailability: () => Promise<void>;
  authModalOpen: boolean;
  authModalInitialTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [persona, setPersona] = useState<UserPersona>('customer');
  const [colleges, setColleges] = useState<College[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'register'>('login');
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const openAuthModal = useCallback((tab: 'login' | 'register' = 'login') => {
    setAuthModalInitialTab(tab);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        setUser(null);
        return;
      }
      const data = await api.auth.getMe();
      setUser(data.user);
    } catch (err) {
      console.warn('Session refresh error:', err);
      setUser(null);
    }
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        const [collegesRes, catRes] = await Promise.allSettled([
          api.users.getColleges(),
          api.users.getCategories(),
        ]);

        if (collegesRes.status === 'fulfilled') {
          setColleges(collegesRes.value.colleges);
        }
        if (catRes.status === 'fulfilled') {
          setCategories(catRes.value.categories);
        }

        const token = getStoredToken();
        if (token) {
          try {
            const meRes = await api.auth.getMe();
            setUser(meRes.user);
          } catch {
            setUser(null);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const data = await api.auth.login(credentials);
      setUser(data.user);
      closeAuthModal();
      showToast(`Welcome back, ${data.user.name.split(' ')[0]}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
      throw err;
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    collegeId?: string;
    department?: string;
    yearOfStudy?: string;
  }) => {
    try {
      const data = await api.auth.register(payload);
      setUser(data.user);
      closeAuthModal();
      showToast('Registration successful! Welcome to TaskHop.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Registration failed.', 'error');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
      setUser(null);
      showToast('You have been logged out.', 'info');
    } catch (err: any) {
      showToast('Error during logout', 'error');
    }
  };

  const toggleAvailability = async () => {
    if (!user || !user.profile) return;
    const nextVal = !user.profile.is_available;
    try {
      const res = await api.users.toggleAvailability(nextVal);
      setUser(res.user);
      showToast(
        nextVal ? 'Availability turned ON. You can now receive nearby gigs!' : 'Availability turned OFF.',
        nextVal ? 'success' : 'info'
      );
    } catch (err: any) {
      showToast('Failed to toggle availability.', 'error');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        persona,
        setPersona,
        colleges,
        categories,
        login,
        register,
        logout,
        refreshUser,
        toggleAvailability,
        authModalOpen,
        authModalInitialTab,
        openAuthModal,
        closeAuthModal,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
