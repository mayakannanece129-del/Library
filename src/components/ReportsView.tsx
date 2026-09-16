import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Book, Member, IssuedBook, ReturnedBook, Fine } from '../types';

interface ReportsViewProps {
  books: Book[];
  members: Member[];
  issuedBooks: IssuedBook[];
  returnedBooks: ReturnedBook[];
  fines: Fine[];
}

type ReportType = 'inventory' | 'issued' | 'overdue' | 'fines' | 'members';

export const ReportsView: React.FC<ReportsViewProps> = ({
  books,
  members,
  issuedBooks,
  returnedBooks,
  fines,
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('inventory');
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days'>('all');

  // Export to CSV Function
  const handleExportCSV = () => {
    let filename = `Library_${selectedReport}_report_${new Date().toISOString().split('T')[0]}.csv`;
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (selectedReport === 'inventory') {
      headers = ['Title', 'Author', 'ISBN', 'Category', 'Publisher', 'Total Qty', 'Available Qty', 'Shelf Location'];
      rows = books.map((b) => [
        `"${b.title.replace(/"/g, '""')}"`,
        `"${b.author.replace(/"/g, '""')}"`,
        b.isbn,
        b.category,
        `"${b.publisher.replace(/"/g, '""')}"`,
        b.quantity,
        b.available_quantity,
        `"${b.shelf_location || ''}"`,
      ]);
    } else if (selectedReport === 'issued') {
      headers = ['Book Title', 'ISBN', 'Member Name', 'Member Code', 'Issue Date', 'Due Date', 'Status'];
      rows = issuedBooks
        .filter((i) => i.status !== 'returned')
        .map((i) => [
          `"${(i.book?.title || '').replace(/"/g, '""')}"`,
          i.book?.isbn || '',
          `"${(i.member?.member_name || '').replace(/"/g, '""')}"`,
          i.member?.member_code || '',
          i.issue_date,
          i.due_date,
          i.status,
        ]);
    } else if (selectedReport === 'overdue') {
      headers = ['Book Title', 'ISBN', 'Member Name', 'Department', 'Due Date', 'Days Overdue', 'Estimated Fine'];
      rows = issuedBooks
        .filter((i) => i.status === 'overdue')
        .map((i) => [
          `"${(i.book?.title || '').replace(/"/g, '""')}"`,
          i.book?.isbn || '',
          `"${(i.member?.member_name || '').replace(/"/g, '""')}"`,
          i.member?.department || '',
          i.due_date,
          i.overdue_days || 1,
          `$${(i.calculated_fine || 0).toFixed(2)}`,
        ]);
    } else if (selectedReport === 'fines') {
      headers = ['Fine ID', 'Member Name', 'Member Code', 'Amount', 'Payment Status', 'Assessed Date'];
      rows = fines.map((f) => [
        f.id,
        `"${(f.member?.member_name || '').replace(/"/g, '""')}"`,
        f.member?.member_code || '',
        `$${Number(f.amount).toFixed(2)}`,
        f.payment_status,
        f.created_at.split('T')[0],
      ]);
    } else if (selectedReport === 'members') {
      headers = ['Member Code', 'Name', 'Department', 'Email', 'Phone', 'Join Date', 'Status', 'Active Checkouts'];
      rows = members.map((m) => [
        m.member_code,
        `"${m.member_name.replace(/"/g, '""')}"`,
        m.department,
        m.email,
        m.phone,
        m.membership_date,
        m.status,
        m.active_issues_count || 0,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const overdueList = issuedBooks.filter((i) => i.status === 'overdue');
  const activeIssuedList = issuedBooks.filter((i) => i.status !== 'returned');

  return (
    <div id="reports-view" className="space-y-6">
      {/* Title & Print/Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Institutional Library Reports & Audits
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Generate formal circulation audits, inventory balances, fine collection reports, and export spreadsheets.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export to Excel / CSV
          </button>
          <button
            id="print-report-btn"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {[
          { id: 'inventory', label: 'Book Inventory Report', count: books.length },
          { id: 'issued', label: 'Active Issued Books', count: activeIssuedList.length },
          { id: 'overdue', label: 'Overdue Books Audit', count: overdueList.length },
          { id: 'fines', label: 'Fine Collection Summary', count: fines.length },
          { id: 'members', label: 'Member Activity Log', count: members.length },
        ].map((item) => (
          <button
            key={item.id}
            id={`report-tab-${item.id}`}
            onClick={() => setSelectedReport(item.id as ReportType)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedReport === item.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{item.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                selectedReport === item.id
                  ? 'bg-indigo-800 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Report Content Container */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        {/* Printable Formal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400">
              Athena Central College Library • Official System Audit
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
              {selectedReport === 'inventory' && 'Complete Book Inventory & Catalog Balance'}
              {selectedReport === 'issued' && 'Active Circulation & Borrowed Titles Report'}
              {selectedReport === 'overdue' && 'Overdue Loans & Fine Liability Audit'}
              {selectedReport === 'fines' && 'Fine Collections & Penalty Revenue Statement'}
              {selectedReport === 'members' && 'Member Directory & Patron Activity Report'}
            </h3>
          </div>
          <div className="text-xs text-slate-500 mt-2 sm:mt-0 sm:text-right">
            <p>Generated: <strong>{new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</strong></p>
            <p>Report Status: <strong className="text-emerald-600">Verified System Data</strong></p>
          </div>
        </div>

        {/* Report 1: Book Inventory */}
        {selectedReport === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                <tr>
                  <th className="pb-3 px-2">Book Title & Author</th>
                  <th className="pb-3 px-2">ISBN</th>
                  <th className="pb-3 px-2">Category</th>
                  <th className="pb-3 px-2">Publisher</th>
                  <th className="pb-3 px-2 text-center">Total Copies</th>
                  <th className="pb-3 px-2 text-center">Available</th>
                  <th className="pb-3 px-2 text-right">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {books.map((b) => (
                  <tr key={b.id}>
                    <td className="py-2.5 px-2 font-semibold text-slate-900 dark:text-white">
                      {b.title}
                      <span className="block font-normal text-xs text-slate-500">{b.author}</span>
                    </td>
                    <td className="py-2.5 px-2 font-mono text-xs text-slate-600 dark:text-slate-300">{b.isbn}</td>
                    <td className="py-2.5 px-2 text-xs">{b.category}</td>
                    <td className="py-2.5 px-2 text-xs text-slate-500">{b.publisher}</td>
                    <td className="py-2.5 px-2 text-center text-xs font-bold">{b.quantity}</td>
                    <td className="py-2.5 px-2 text-center text-xs font-bold text-emerald-600">
                      {b.available_quantity}
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-xs text-indigo-600">
                      {b.shelf_location || 'General Stacks'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Report 2: Active Issued Books */}
        {selectedReport === 'issued' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                <tr>
                  <th className="pb-3 px-2">Book Title</th>
                  <th className="pb-3 px-2">Borrower</th>
                  <th className="pb-3 px-2">Department</th>
                  <th className="pb-3 px-2">Issue Date</th>
                  <th className="pb-3 px-2">Due Date</th>
                  <th className="pb-3 px-2 text-right">Circulation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeIssuedList.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2.5 px-2 font-semibold text-slate-900 dark:text-white">
                      {i.book?.title}
                      <span className="block font-mono text-[10px] text-slate-400">{i.book?.isbn}</span>
                    </td>
                    <td className="py-2.5 px-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                      {i.member?.member_name} ({i.member?.member_code})
                    </td>
                    <td className="py-2.5 px-2 text-xs text-slate-500">{i.member?.department}</td>
                    <td className="py-2.5 px-2 text-xs text-slate-500">{i.issue_date}</td>
                    <td className="py-2.5 px-2 text-xs font-semibold">{i.due_date}</td>
                    <td className="py-2.5 px-2 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          i.status === 'overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {i.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Report 3: Overdue Books Audit */}
        {selectedReport === 'overdue' && (
          <div className="overflow-x-auto">
            {overdueList.length === 0 ? (
              <p className="text-center py-10 text-xs text-slate-400">
                Excellent! Zero books are currently overdue.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <tr>
                    <th className="pb-3 px-2">Book Title</th>
                    <th className="pb-3 px-2">Borrower</th>
                    <th className="pb-3 px-2">Due Date</th>
                    <th className="pb-3 px-2 text-center">Days Overdue</th>
                    <th className="pb-3 px-2 text-right">Calculated Late Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {overdueList.map((i) => (
                    <tr key={i.id}>
                      <td className="py-2.5 px-2 font-semibold text-slate-900 dark:text-white">
                        {i.book?.title}
                      </td>
                      <td className="py-2.5 px-2 text-xs">
                        {i.member?.member_name} ({i.member?.member_code})
                      </td>
                      <td className="py-2.5 px-2 text-xs font-bold text-rose-600">{i.due_date}</td>
                      <td className="py-2.5 px-2 text-center text-xs font-bold text-rose-600">
                        {i.overdue_days || 1} Days
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-rose-600">
                        ${(i.calculated_fine || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Report 4: Fine Collections */}
        {selectedReport === 'fines' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                <tr>
                  <th className="pb-3 px-2">Fine Ref</th>
                  <th className="pb-3 px-2">Member</th>
                  <th className="pb-3 px-2">Amount</th>
                  <th className="pb-3 px-2">Payment Status</th>
                  <th className="pb-3 px-2 text-right">Assessment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {fines.map((f) => (
                  <tr key={f.id}>
                    <td className="py-2.5 px-2 font-mono text-xs text-slate-500">#{f.id.slice(-6).toUpperCase()}</td>
                    <td className="py-2.5 px-2 text-xs font-medium">
                      {f.member?.member_name} ({f.member?.member_code})
                    </td>
                    <td className="py-2.5 px-2 font-mono font-bold">${Number(f.amount).toFixed(2)}</td>
                    <td className="py-2.5 px-2 text-xs capitalize font-semibold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${
                          f.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : f.payment_status === 'waived'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {f.payment_status}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right text-xs text-slate-500">{f.created_at.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Report 5: Member Activity */}
        {selectedReport === 'members' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                <tr>
                  <th className="pb-3 px-2">Member ID</th>
                  <th className="pb-3 px-2">Name</th>
                  <th className="pb-3 px-2">Department</th>
                  <th className="pb-3 px-2">Contact</th>
                  <th className="pb-3 px-2 text-center">Active Loans</th>
                  <th className="pb-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="py-2.5 px-2 font-mono text-xs text-indigo-600 font-semibold">{m.member_code}</td>
                    <td className="py-2.5 px-2 font-medium text-slate-900 dark:text-white">{m.member_name}</td>
                    <td className="py-2.5 px-2 text-xs text-slate-500">{m.department}</td>
                    <td className="py-2.5 px-2 text-xs text-slate-500">{m.email}</td>
                    <td className="py-2.5 px-2 text-center text-xs font-bold">{m.active_issues_count || 0}</td>
                    <td className="py-2.5 px-2 text-right text-xs capitalize font-bold text-emerald-600">{m.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
