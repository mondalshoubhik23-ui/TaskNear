import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 mt-16 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
              T
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-white">TaskHop</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm text-center md:text-left">
            The open hyperlocal micro-errand and task marketplace. Initially piloted with SRM University and open to surrounding residential communities.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <span>Public Marketplace</span>
          <span aria-hidden="true">·</span>
          <span>Pay-After-Delivery Escrow</span>
          <span aria-hidden="true">·</span>
          <span>Verified Student &amp; Resident Helpers</span>
          <span aria-hidden="true">·</span>
          <span>Zero User Limit</span>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400">
          &copy; {new Date().getFullYear()} TaskHop Technologies.
        </div>
      </div>
    </footer>
  );
};
