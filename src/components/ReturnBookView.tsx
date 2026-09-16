import React, { useState } from 'react';
import {
  ArrowDownLeft,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  Search,
  BookOpen,
  UserCheck,
  Receipt,
  Clock,
} from 'lucide-react';
import { IssuedBook, ReturnedBook, User } from '../types';

interface ReturnBookViewProps {
  issuedBooks: IssuedBook[];
  returnedBooks: ReturnedBook[];
  currentUser: User;
  onReturnBook: (payload: {
    issue_id: string;
    return_date?: string;
    received_by?: string;
  }) => Promise<any>;
  onNavigateToFines: () => void;
}

export const ReturnBookView: React.FC<ReturnBookViewProps> = ({
  issuedBooks,
  returnedBooks,
  currentUser,
  onReturnBook,
  onNavigateToFines,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const activeIssues = issuedBooks.filter((i) => i.status !== 'returned');
  const [selectedIssueId, setSelectedIssueId] = useState(activeIssues.length > 0 ? activeIssues[0].id : '');
  const [returnDate, setReturnDate] = useState(todayStr);
  const [searchHistory, setSearchHistory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastReturnResult, setLastReturnResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedIssue = activeIssues.find((i) => i.id === selectedIssueId);

  // Dynamic Fine Calculation Preview
  const calculatePreviewFine = (issue: IssuedBook | undefined, retDateStr: string) => {
    if (!issue) return { overdueDays: 0, fine: 0 };
    const due = new Date(issue.due_date);
    const ret = new Date(retDateStr);
    due.setHours(0, 0, 0, 0);
    ret.setHours(0, 0, 0, 0);

    const diff = ret.getTime() - due.getTime();
    const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    return { overdueDays: days, fine: days * 1.0 };
  };

  const preview = calculatePreviewFine(selectedIssue, returnDate);

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLastReturnResult(null);

    if (!selectedIssueId) {
      setErrorMsg('Please select an active checkout to process return.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onReturnBook({
        issue_id: selectedIssueId,
        return_date: returnDate,
        received_by: currentUser.name,
      });

      setLastReturnResult(res);
      // Select next active issue if available
      const remaining = activeIssues.filter((i) => i.id !== selectedIssueId);
      if (remaining.length > 0) {
        setSelectedIssueId(remaining[0].id);
      } else {
        setSelectedIssueId('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process return');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredHistory = returnedBooks.filter((r) => {
    const q = searchHistory.toLowerCase();
    const bookTitle = (r.book?.title || (r.issue?.book?.title) || '').toLowerCase();
    const memberName = (r.member?.member_name || (r.issue?.member?.member_name) || '').toLowerCase();
    const received = (r.received_by || '').toLowerCase();
    return bookTitle.includes(q) || memberName.includes(q) || received.includes(q);
  });

  return (
    <div id="return-book-view" className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <ArrowDownLeft className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Book Return & Fine Assessment Desk
        </h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Check in borrowed items back into circulation with automated date auditing and late penalty calculation.
        </p>
      </div>

      {/* Return Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Return Form (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-emerald-600" />
            Process Book Check-In
          </h3>

          {errorMsg && (
            <div className="p-3 mb-4 text-xs rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200 border border-rose-200 dark:border-rose-900">
              {errorMsg}
            </div>
          )}

          {lastReturnResult && (
            <div className="p-4 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Return Accepted & Verified!
              </div>
              <p>
                <strong>Book:</strong> {lastReturnResult.bookTitle} | <strong>Member:</strong> {lastReturnResult.memberName}
              </p>
              {lastReturnResult.fineAmount > 0 ? (
                <p className="text-rose-600 dark:text-rose-300 font-bold">
                  ⚠️ Overdue by {lastReturnResult.overdueDays} days. A late fee of ${lastReturnResult.fineAmount.toFixed(2)} was generated.
                </p>
              ) : (
                <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                  ✅ Returned on time with $0.00 fine. Available stock restored.
                </p>
              )}
            </div>
          )}

          {activeIssues.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">All books are currently returned!</p>
              <p className="text-xs text-slate-500 mt-1">There are no active outstanding loans at this time.</p>
            </div>
          ) : (
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Active Issue Record *
                </label>
                <select
                  id="return-issue-select"
                  value={selectedIssueId}
                  onChange={(e) => setSelectedIssueId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                >
                  {activeIssues.map((iss) => (
                    <option key={iss.id} value={iss.id}>
                      {iss.book?.title} — Borrowed by {iss.member?.member_name} ({iss.member?.member_code}) [Due: {iss.due_date}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Actual Return Date *
                </label>
                <input
                  id="return-date-input"
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Dynamic Fine Calculator Summary Banner */}
              <div
                id="fine-calculator-preview"
                className={`p-4 rounded-xl border transition-all ${
                  preview.fine > 0
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className={`w-5 h-5 ${preview.fine > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider">
                        Automated Late Fine Assessment
                      </span>
                      <p className="text-sm font-semibold">
                        {preview.overdueDays > 0
                          ? `${preview.overdueDays} Day${preview.overdueDays > 1 ? 's' : ''} Overdue ($1.00 / day)`
                          : 'Returned Within Loan Period'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono">
                      ${preview.fine.toFixed(2)}
                    </span>
                    <span className="text-[10px] block opacity-80">
                      {preview.fine > 0 ? 'Penalty Due' : 'No Fine'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                id="submit-return-btn"
                type="submit"
                disabled={isSubmitting || !selectedIssueId}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying & Updating...' : 'Confirm Return & Restore Stock'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: Selected Issue Details Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedIssue ? (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Loan Verification Details
              </span>

              {/* Book Info */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {selectedIssue.book?.title}
                </span>
                <p className="text-xs text-slate-500">
                  By {selectedIssue.book?.author} • ISBN: <span className="font-mono">{selectedIssue.book?.isbn}</span>
                </p>
              </div>

              {/* Member Info */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <p>
                  <strong>Borrower:</strong> {selectedIssue.member?.member_name} ({selectedIssue.member?.member_code})
                </p>
                <p>
                  <strong>Department:</strong> {selectedIssue.member?.department}
                </p>
                <p>
                  <strong>Issued On:</strong> {selectedIssue.issue_date}
                </p>
                <p>
                  <strong>Due Date:</strong> <span className={preview.overdueDays > 0 ? 'text-rose-600 font-bold' : ''}>{selectedIssue.due_date}</span>
                </p>
              </div>

              {/* Fine Policy note */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Campus Fine Policy:</p>
                <p>
                  Late book returns accrue penalties at <strong>$1.00 per day</strong> beyond the scheduled due date. Fines can be settled immediately at desk or viewed under the Fine Management tab.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center text-xs text-slate-400 py-12">
              Select an active issue to view borrowing specifics.
            </div>
          )}
        </div>
      </div>

      {/* Return History Table */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Processed Return History ({returnedBooks.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Historical circulation check-ins and completed book returns.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              id="search-returns-input"
              type="text"
              placeholder="Search return log..."
              value={searchHistory}
              onChange={(e) => setSearchHistory(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="pb-3 px-2 font-semibold">Return Date</th>
                <th className="pb-3 px-2 font-semibold">Book Title</th>
                <th className="pb-3 px-2 font-semibold">Member</th>
                <th className="pb-3 px-2 font-semibold">Desk Officer</th>
                <th className="pb-3 px-2 font-semibold text-right">Fine Assessed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                    No return history records matching search.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((ret) => {
                  const title = ret.book?.title || ret.issue?.book?.title || 'Returned Volume';
                  const member = ret.member?.member_name || ret.issue?.member?.member_name || 'Member';
                  return (
                    <tr key={ret.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {ret.return_date}
                      </td>
                      <td className="py-3 px-2 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                        {title}
                      </td>
                      <td className="py-3 px-2 text-xs text-slate-600 dark:text-slate-300">
                        {member}
                      </td>
                      <td className="py-3 px-2 text-xs text-slate-500">
                        {ret.received_by || 'Library Desk'}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                            Number(ret.fine_amount) > 0
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          }`}
                        >
                          {Number(ret.fine_amount) > 0 ? `$${Number(ret.fine_amount).toFixed(2)}` : 'On Time ($0.00)'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
