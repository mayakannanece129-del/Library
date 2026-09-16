import React, { useState } from 'react';
import {
  Receipt,
  DollarSign,
  CheckCircle,
  Clock,
  Ban,
  Printer,
  Search,
  Filter,
  CreditCard,
  X,
  FileCheck,
} from 'lucide-react';
import { Fine, User } from '../types';

interface FinesViewProps {
  fines: Fine[];
  currentUser: User;
  onUpdateFineStatus: (id: string, status: 'pending' | 'paid' | 'waived') => Promise<void>;
}

export const FinesView: React.FC<FinesViewProps> = ({ fines, currentUser, onUpdateFineStatus }) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'waived'>('all');
  const [search, setSearch] = useState('');
  const [receiptFine, setReceiptFine] = useState<Fine | null>(null);

  // Totals
  const totalAssessed = fines.reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
  const totalPaid = fines
    .filter((f) => f.payment_status === 'paid')
    .reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
  const totalPending = fines
    .filter((f) => f.payment_status === 'pending')
    .reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
  const totalWaived = fines
    .filter((f) => f.payment_status === 'waived')
    .reduce((acc, f) => acc + (Number(f.amount) || 0), 0);

  const filteredFines = fines.filter((f) => {
    const matchesStatus = statusFilter === 'all' || f.payment_status === statusFilter;
    const q = search.toLowerCase();
    const memberName = (f.member?.member_name || '').toLowerCase();
    const memberCode = (f.member?.member_code || '').toLowerCase();
    const bookTitle = (f.book?.title || f.issue?.book?.title || '').toLowerCase();

    const matchesSearch = memberName.includes(q) || memberCode.includes(q) || bookTitle.includes(q);
    return matchesStatus && matchesSearch;
  });

  const handlePrintReceipt = (fine: Fine) => {
    setReceiptFine(fine);
  };

  return (
    <div id="fines-view" className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Receipt className="w-6 h-6 text-amber-500" />
          Fine & Penalty Management Desk
        </h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Track overdue assessments, register cash/card fee collections, waive exemptions, and issue student receipts.
        </p>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Collected Fines</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${totalPaid.toFixed(2)}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Settled & deposited</p>
        </div>

        {/* Total Pending */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Pending Dues</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            ${totalPending.toFixed(2)}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting member settlement</p>
        </div>

        {/* Total Waived */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Waived / Exempted</span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">
            ${totalWaived.toFixed(2)}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Authorized exemptions</p>
        </div>

        {/* Total Assessed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Lifetime Assessed</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            ${totalAssessed.toFixed(2)}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Total penalty assessments</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="fines-search-input"
            type="text"
            placeholder="Search by student name, ID, or book..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-stretch sm:self-auto text-xs font-semibold">
          {(['all', 'pending', 'paid', 'waived'] as const).map((st) => (
            <button
              key={st}
              id={`fine-tab-${st}`}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Fines Table */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Fine Ref</th>
                <th className="py-3.5 px-4 font-semibold">Member</th>
                <th className="py-3.5 px-4 font-semibold">Book / Reason</th>
                <th className="py-3.5 px-4 font-semibold">Amount</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold">Assessed Date</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredFines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    No fine records found matching filter.
                  </td>
                </tr>
              ) : (
                filteredFines.map((f) => {
                  const bookTitle = f.book?.title || f.issue?.book?.title || 'Circulation Overdue Fine';
                  return (
                    <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        #{f.id.slice(-6).toUpperCase()}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                          {f.member?.member_name || 'Member'}
                        </p>
                        <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                          {f.member?.member_code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {bookTitle}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-900 dark:text-white">
                        ${Number(f.amount).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            f.payment_status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : f.payment_status === 'waived'
                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                          }`}
                        >
                          {f.payment_status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {f.created_at.split('T')[0]}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Receipt */}
                          <button
                            id={`fine-receipt-${f.id}`}
                            onClick={() => handlePrintReceipt(f)}
                            title="Print Official Library Receipt"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Collect / Mark Paid */}
                          {currentUser.role !== 'student' && f.payment_status === 'pending' && (
                            <>
                              <button
                                id={`fine-pay-${f.id}`}
                                onClick={() => onUpdateFineStatus(f.id, 'paid')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                              >
                                Collect
                              </button>
                              <button
                                id={`fine-waive-${f.id}`}
                                onClick={() => onUpdateFineStatus(f.id, 'waived')}
                                className="px-2 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              >
                                Waive
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Fine Receipt Modal */}
      {receiptFine && (
        <div
          id="fine-receipt-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Library Fine Receipt
              </h3>
              <button
                onClick={() => setReceiptFine(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Printable Slip */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-3 font-mono">
              <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700 font-sans">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">ATHENA CENTRAL LIBRARY</h4>
                <p className="text-[11px] text-slate-500">Official Campus Cashier Receipt</p>
                <p className="text-[10px] text-slate-400">Receipt Ref: #{receiptFine.id.slice(-8).toUpperCase()}</p>
              </div>

              <div className="space-y-1 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Student Name:</span>
                  <span className="font-bold">{receiptFine.member?.member_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Member ID:</span>
                  <span>{receiptFine.member?.member_code}</span>
                </div>
                <div className="flex justify-between">
                  <span>Department:</span>
                  <span>{receiptFine.member?.department}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reason:</span>
                  <span>Late Book Circulation</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{receiptFine.created_at.split('T')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className="font-bold uppercase text-emerald-600">{receiptFine.payment_status}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
                <span>TOTAL AMOUNT:</span>
                <span>${Number(receiptFine.amount).toFixed(2)}</span>
              </div>

              <div className="pt-4 text-center text-[10px] text-slate-400 font-sans">
                <p>Thank you for keeping our library catalog circulating!</p>
                <p className="mt-1">Authorized Signature: _________________________</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setReceiptFine(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
