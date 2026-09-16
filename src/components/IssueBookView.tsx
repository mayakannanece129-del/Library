import React, { useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Search,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Book, Member, IssuedBook, User } from '../types';

interface IssueBookViewProps {
  books: Book[];
  members: Member[];
  issuedBooks: IssuedBook[];
  currentUser: User;
  onIssueBook: (payload: {
    book_id: string;
    member_id: string;
    issue_date: string;
    due_date: string;
    notes?: string;
    issued_by?: string;
  }) => Promise<void>;
  onNavigateToReturns: () => void;
  preSelectedBookId?: string | null;
  preSelectedMemberId?: string | null;
}

export const IssueBookView: React.FC<IssueBookViewProps> = ({
  books,
  members,
  issuedBooks,
  currentUser,
  onIssueBook,
  onNavigateToReturns,
  preSelectedBookId,
  preSelectedMemberId,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDue = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  const [selectedBookId, setSelectedBookId] = useState(preSelectedBookId || (books.length > 0 ? books[0].id : ''));
  const [selectedMemberId, setSelectedMemberId] = useState(preSelectedMemberId || (members.length > 0 ? members[0].id : ''));
  const [issueDate, setIssueDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(defaultDue);
  const [notes, setNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'issued' | 'overdue'>('all');
  const [searchTable, setSearchTable] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Selected entities
  const selectedBook = books.find((b) => b.id === selectedBookId);
  const selectedMember = members.find((m) => m.id === selectedMemberId);

  // Set preset due date days
  const handleSetDueDays = (days: number) => {
    const start = new Date(issueDate);
    start.setDate(start.getDate() + days);
    setDueDate(start.toISOString().split('T')[0]);
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedBookId || !selectedMemberId || !dueDate) {
      setErrorMsg('Please select a book, a member, and specify the due date.');
      return;
    }

    if (selectedBook && selectedBook.available_quantity <= 0) {
      setErrorMsg(`"${selectedBook.title}" is currently out of stock. All copies are issued.`);
      return;
    }

    if (selectedMember && selectedMember.status !== 'active') {
      setErrorMsg(`Member account is currently ${selectedMember.status}. Cannot issue books.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onIssueBook({
        book_id: selectedBookId,
        member_id: selectedMemberId,
        issue_date: issueDate,
        due_date: dueDate,
        notes,
        issued_by: currentUser.name,
      });

      setSuccessMsg(`Successfully issued "${selectedBook?.title}" to ${selectedMember?.member_name}!`);
      setNotes('');
      // reset due date to 14 days later
      setDueDate(defaultDue);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to issue book');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Active Issued list
  const activeIssued = issuedBooks.filter((iss) => iss.status !== 'returned');
  const filteredIssues = activeIssued.filter((iss) => {
    const matchesStatus = statusFilter === 'all' || iss.status === statusFilter;
    const matchesSearch =
      (iss.book?.title || '').toLowerCase().includes(searchTable.toLowerCase()) ||
      (iss.book?.isbn || '').toLowerCase().includes(searchTable.toLowerCase()) ||
      (iss.member?.member_name || '').toLowerCase().includes(searchTable.toLowerCase()) ||
      (iss.member?.member_code || '').toLowerCase().includes(searchTable.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div id="issue-book-view" className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <ArrowUpRight className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Book Circulation & Checkout Module
        </h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Check out library volumes to registered students and faculty with automated due date tracking.
        </p>
      </div>

      {/* Main Issue Layout: Left Form + Right Stock/Member Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Issue Form (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Issue Book to Member
            </h3>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 text-xs rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200 border border-rose-200 dark:border-rose-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 mb-4 text-xs rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleIssueSubmit} className="space-y-4">
            {/* Member Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Member / Student *
              </label>
              <select
                id="issue-member-select"
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-medium"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.member_name} ({m.member_code}) — {m.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Book Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Catalog Book Title *
              </label>
              <select
                id="issue-book-select"
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-medium"
              >
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} [{b.available_quantity > 0 ? `${b.available_quantity} available` : 'OUT OF STOCK'}] — {b.isbn}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Date *
                </label>
                <input
                  id="issue-date-input"
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Due Date *
                  </label>
                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleSetDueDays(7)}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      +7d
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => handleSetDueDays(14)}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      +14d
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => handleSetDueDays(30)}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      +30d
                    </button>
                  </div>
                </div>
                <input
                  id="issue-due-date-input"
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Circulation Remarks / Course Reference
              </label>
              <input
                id="issue-notes-input"
                type="text"
                placeholder="e.g. Final year dissertation research or special lab borrowing"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <button
              id="submit-issue-btn"
              type="submit"
              disabled={isSubmitting || !selectedBook || selectedBook.available_quantity <= 0}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing Issue...' : 'Confirm Book Checkout'}</span>
            </button>
          </form>
        </div>

        {/* Live Validation & Status Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Book Availability Card */}
          {selectedBook && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Book Real-Time Availability Check
              </span>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedBook.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedBook.author}</p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedBook.available_quantity > 0
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                  }`}
                >
                  {selectedBook.available_quantity > 0
                    ? `${selectedBook.available_quantity} In Stock`
                    : 'Out of Stock'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">ISBN</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {selectedBook.isbn}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Shelf Location</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {selectedBook.shelf_location || 'General Stacks'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Member Card Check */}
          {selectedMember && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Member Circulation Eligibility
              </span>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedMember.member_name}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">{selectedMember.member_code}</p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedMember.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedMember.status.toUpperCase()}
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p><strong>Department:</strong> {selectedMember.department}</p>
                <p><strong>Email:</strong> {selectedMember.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Borrowed Books Registry */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Currently Circulating Books ({activeIssued.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active loan records requiring eventual return or renewal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                id="search-issues-input"
                type="text"
                placeholder="Filter active issues..."
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Filter */}
            <select
              id="filter-issues-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
            >
              <option value="all">All Status</option>
              <option value="issued">On Schedule</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="pb-3 px-2 font-semibold">Book Title</th>
                <th className="pb-3 px-2 font-semibold">Member</th>
                <th className="pb-3 px-2 font-semibold">Issue Date</th>
                <th className="pb-3 px-2 font-semibold">Due Date</th>
                <th className="pb-3 px-2 font-semibold text-center">Status</th>
                <th className="pb-3 px-2 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    No active issued books matching this filter.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((iss) => (
                  <tr key={iss.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-2">
                      <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                        {iss.book?.title || 'Unknown Title'}
                      </p>
                      <span className="font-mono text-[11px] text-slate-400">
                        {iss.book?.isbn}
                      </span>
                    </td>

                    <td className="py-3 px-2">
                      <p className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                        {iss.member?.member_name || 'Member'}
                      </p>
                      <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                        {iss.member?.member_code}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-xs text-slate-500">
                      {iss.issue_date}
                    </td>

                    <td className="py-3 px-2 text-xs">
                      <span className={iss.status === 'overdue' ? 'font-bold text-rose-600' : 'text-slate-700 dark:text-slate-300'}>
                        {iss.due_date}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          iss.status === 'overdue'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                        }`}
                      >
                        {iss.status === 'overdue'
                          ? `OVERDUE (${iss.overdue_days || 1}d)`
                          : 'ON LOAN'}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={onNavigateToReturns}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Return
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
