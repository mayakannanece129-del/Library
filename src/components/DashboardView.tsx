import React from 'react';
import {
  BookOpen,
  CheckCircle,
  Clock,
  RotateCcw,
  Users,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  UserPlus,
  BookMarked,
  Layers,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import { DashboardStats, User } from '../types';

interface DashboardViewProps {
  stats?: DashboardStats | null;
  currentUser: User;
  onNavigate: (tab: string) => void;
  onOpenAddBook?: () => void;
  onOpenAddMember?: () => void;
  onQuickIssue?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats: incomingStats,
  currentUser,
  onNavigate,
  onOpenAddBook,
  onOpenAddMember,
  onQuickIssue,
}) => {
  const defaultStats: DashboardStats = {
    totalBooks: 0,
    availableBooks: 0,
    issuedBooks: 0,
    returnedBooks: 0,
    totalMembers: 0,
    overdueBooks: 0,
    totalFineCollected: 0,
    pendingFines: 0,
    recentTransactions: [],
    categoryStats: [],
    departmentStats: [],
  };

  const stats = incomingStats || defaultStats;
  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Fall Semester Academic Term
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {currentUser.name}
            </h2>
            <p className="text-slate-300 text-sm max-w-xl">
              Central Library catalog, circulation management, student registrations, automated fine audits, and real-time Supabase analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentUser.role !== 'student' && (
              <>
                <button
                  id="dashboard-action-issue"
                  onClick={onQuickIssue}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Issue Book
                </button>
                <button
                  id="dashboard-action-return"
                  onClick={() => onNavigate('return')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold backdrop-blur-md border border-white/15 transition-all"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  Return Book
                </button>
              </>
            )}
            <button
              id="dashboard-action-catalog"
              onClick={() => onNavigate('books')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold border border-slate-700 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Browse Books
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-8 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* Overdue Warning Alert if Overdue Books Exist */}
      {stats.overdueBooks > 0 && currentUser.role !== 'student' && (
        <div
          id="overdue-alert-banner"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                Attention Required: {stats.overdueBooks} Book{stats.overdueBooks > 1 ? 's are' : ' is'} Currently Overdue
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Automated late fees are accumulating at $1.00 per day. Review borrowing history to initiate return notices.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('return')}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs shrink-0 transition-colors"
          >
            Review & Return
          </button>
        </div>
      )}

      {/* 8 Primary Dashboard Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Total Books */}
        <div
          id="card-total-books"
          onClick={() => onNavigate('books')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Catalog Stock</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {stats.totalBooks}
            </span>
            <span className="text-xs font-medium text-slate-500">Copies</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
            <span>Across multiple academic disciplines</span>
          </p>
        </div>

        {/* Available Books */}
        <div
          id="card-available-books"
          onClick={() => onNavigate('books')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Available on Shelves</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.availableBooks}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {stats.totalBooks > 0 ? `${Math.round((stats.availableBooks / stats.totalBooks) * 100)}% Ready` : '0%'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Ready for immediate student checkout
          </p>
        </div>

        {/* Issued Books */}
        <div
          id="card-issued-books"
          onClick={() => onNavigate('issue')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Currently Issued</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.issuedBooks}
            </span>
            <span className="text-xs font-medium text-slate-500">Active</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Circulating among registered students
          </p>
        </div>

        {/* Overdue Books */}
        <div
          id="card-overdue-books"
          onClick={() => onNavigate('return')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-300 dark:hover:border-rose-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overdue Returns</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-bold text-rose-600 dark:text-rose-400">
              {stats.overdueBooks}
            </span>
            <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Past Due</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Subject to daily late fee calculation
          </p>
        </div>

        {/* Total Members */}
        <div
          id="card-total-members"
          onClick={() => onNavigate('members')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Registered Members</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {stats.totalMembers}
            </span>
            <span className="text-xs font-medium text-slate-500">Students & Faculty</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Active institutional library cards
          </p>
        </div>

        {/* Returned Books Count */}
        <div
          id="card-returned-books"
          onClick={() => onNavigate('return')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-300 dark:hover:border-teal-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Processed Returns</span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {stats.returnedBooks}
            </span>
            <span className="text-xs font-medium text-slate-500">Historical</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Checked back into circulation
          </p>
        </div>

        {/* Fine Collection */}
        <div
          id="card-fine-collection"
          onClick={() => onNavigate('fines')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Fine Collected</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              ${stats.totalFineCollected.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-emerald-600">Settled</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Remitted into campus library fund
          </p>
        </div>

        {/* Pending Fines */}
        <div
          id="card-pending-fines"
          onClick={() => onNavigate('fines')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Fines</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400">
              ${stats.pendingFines.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-amber-600">Outstanding</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Awaiting student payment at desk
          </p>
        </div>
      </div>

      {/* Secondary Section: Category Breakdown & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Category Stock Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Book Categories
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inventory distribution across disciplines
              </p>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3.5">
            {stats.categoryStats.map((cat) => {
              const percentage = stats.totalBooks > 0 ? Math.round((cat.count / stats.totalBooks) * 100) : 0;
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {cat.category}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {cat.count} copies ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${Math.max(5, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onNavigate('books')}
            className="w-full mt-6 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <span>Explore Full Catalog</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right 2 Columns: Recent Circulation Transactions */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Circulation Transactions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest book checkout, return, and payment activities
              </p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All Reports</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Action</th>
                  <th className="pb-3 font-semibold">Book Title</th>
                  <th className="pb-3 font-semibold">Member</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      No recent circulation transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  stats.recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3">
                        {tx.type === 'issue' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                            <ArrowUpRight className="w-3 h-3" /> Issue
                          </span>
                        ) : tx.type === 'return' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <ArrowDownLeft className="w-3 h-3" /> Return
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            <DollarSign className="w-3 h-3" /> Fine
                          </span>
                        )}
                      </td>
                      <td className="py-3 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                        {tx.title}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-300 text-xs">
                        {tx.member}
                      </td>
                      <td className="py-3 text-slate-500 text-xs">
                        {tx.date}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.status === 'overdue'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                              : tx.status === 'issued'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Access Action Bar for Staff */}
      {currentUser.role !== 'student' && (
        <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Quick Administrative Workflows
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={onQuickIssue}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 text-left transition-all hover:shadow-sm"
            >
              <ArrowUpRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Issue Book</p>
              <p className="text-[11px] text-slate-500">Checkout to member</p>
            </button>

            <button
              onClick={() => onNavigate('return')}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 text-left transition-all hover:shadow-sm"
            >
              <ArrowDownLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Return Book</p>
              <p className="text-[11px] text-slate-500">Checkin & fine audit</p>
            </button>

            <button
              onClick={onOpenAddBook}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 text-left transition-all hover:shadow-sm"
            >
              <PlusCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Add New Book</p>
              <p className="text-[11px] text-slate-500">New accession & ISBN</p>
            </button>

            <button
              onClick={onOpenAddMember}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 text-left transition-all hover:shadow-sm"
            >
              <UserPlus className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Register Member</p>
              <p className="text-[11px] text-slate-500">New student card</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
