import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  Search,
  Bell,
  PlusCircle,
  LogOut,
  LogIn,
  AlertTriangle,
} from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser: User;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onQuickIssue: () => void;
  overdueCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectNav: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  darkMode,
  onToggleDarkMode,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onQuickIssue,
  overdueCount,
  searchQuery,
  onSearchChange,
  onSelectNav,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors"
    >
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-xl">
        <button
          id="open-sidebar-btn"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Catalog Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search catalog by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl focus:outline-hidden text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Issue Button for Staff */}
        {currentUser.role !== 'student' && (
          <button
            id="quick-issue-btn"
            onClick={onQuickIssue}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Issue Book</span>
          </button>
        )}

        {/* Overdue Notification Bell */}
        <button
          id="overdue-alerts-btn"
          onClick={() => onSelectNav('return')}
          title={overdueCount > 0 ? `${overdueCount} books are overdue!` : 'No overdue books'}
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {overdueCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          )}
        </button>

        {/* Dark/Light Mode Switcher */}
        <button
          id="theme-toggle-btn"
          onClick={onToggleDarkMode}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Identity & Logout */}
        <div className="flex items-center pl-2 border-l border-slate-200 dark:border-slate-800">
          <button
            id="auth-action-btn"
            onClick={currentUser.email ? onLogout : onOpenAuthModal}
            className="flex items-center gap-2 p-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
              {currentUser.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <span className="hidden md:inline font-semibold">{currentUser.name.split(' ')[0]}</span>
            <LogOut className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
          </button>
        </div>
      </div>
    </header>
  );
};
