import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  FileText,
  History,
  Database,
  Shield,
  BookMarked,
  GraduationCap,
  X,
  Server,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User;
  onSwitchRole: (role: UserRole) => void;
  isOpen: boolean;
  onClose: () => void;
  overdueCount: number;
  pendingFinesCount: number;
  isUsingSupabase: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onSwitchRole,
  isOpen,
  onClose,
  overdueCount,
  pendingFinesCount,
  isUsingSupabase,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'librarian', 'student'],
    },
    {
      id: 'books',
      label: 'Book Management',
      icon: BookOpen,
      roles: ['admin', 'librarian', 'student'],
    },
    {
      id: 'members',
      label: 'Member Management',
      icon: Users,
      roles: ['admin', 'librarian'],
    },
    {
      id: 'issue',
      label: 'Issue Books',
      icon: ArrowUpRight,
      roles: ['admin', 'librarian'],
    },
    {
      id: 'return',
      label: 'Return Books',
      icon: ArrowDownLeft,
      badge: overdueCount > 0 ? `${overdueCount} Overdue` : undefined,
      badgeColor: 'bg-rose-500 text-white',
      roles: ['admin', 'librarian'],
    },
    {
      id: 'fines',
      label: 'Fine Management',
      icon: Receipt,
      badge: pendingFinesCount > 0 ? `${pendingFinesCount} Due` : undefined,
      badgeColor: 'bg-amber-500 text-white',
      roles: ['admin', 'librarian', 'student'],
    },
    {
      id: 'reports',
      label: 'Reports & Exports',
      icon: FileText,
      roles: ['admin', 'librarian'],
    },
    {
      id: 'activity',
      label: 'Activity Logs',
      icon: History,
      roles: ['admin', 'librarian'],
    },
    {
      id: 'docs',
      label: 'Supabase & API Specs',
      icon: Database,
      badge: 'Deliverables',
      badgeColor: 'bg-indigo-600 text-white',
      roles: ['admin', 'librarian', 'student'],
    },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(currentUser.role));

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'librarian':
        return <BookMarked className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'student':
        return <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'librarian':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'student':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Athena Library
              </h1>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Central Campus System
              </p>
            </div>
          </div>
          <button
            id="close-sidebar-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card & Role Switcher */}
        <div className="p-4 mx-4 mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-semibold text-xs text-slate-700 dark:text-slate-300">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/50">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${getRoleBadgeClass(
                currentUser.role
              )}`}
            >
              {getRoleIcon(currentUser.role)}
              <span className="capitalize">{currentUser.role}</span>
            </span>

            {/* Quick Role Switcher for seamless testing */}
            <div className="flex items-center gap-1">
              <button
                id="role-switch-admin"
                onClick={() => onSwitchRole('admin')}
                title="Switch to Admin role"
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Admin
              </button>
              <button
                id="role-switch-librarian"
                onClick={() => onSwitchRole('librarian')}
                title="Switch to Librarian role"
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors ${
                  currentUser.role === 'librarian'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Librarian
              </button>
              <button
                id="role-switch-student"
                onClick={() => onSwitchRole('student')}
                title="Switch to Student role"
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors ${
                  currentUser.role === 'student'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Student
              </button>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Main Modules
          </div>
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  setCurrentTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Database Status */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                isUsingSupabase ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-slate-400" />
                {isUsingSupabase ? 'Supabase Database' : 'Supabase-Ready Schema'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {isUsingSupabase ? 'Live Cloud PostgreSQL' : 'Academic Store (Full API)'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
