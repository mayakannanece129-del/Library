import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { BooksView } from './components/BooksView';
import { MembersView } from './components/MembersView';
import { IssueBookView } from './components/IssueBookView';
import { ReturnBookView } from './components/ReturnBookView';
import { FinesView } from './components/FinesView';
import { ReportsView } from './components/ReportsView';
import { ActivityLogsView } from './components/ActivityLogsView';
import { SupabaseDocsView } from './components/SupabaseDocsView';
import { QRCodeModal } from './components/QRCodeModal';
import { AuthModal } from './components/AuthModal';
import { Toast, ToastType } from './components/Toast';
import { api } from './services/api';
import {
  Book,
  Member,
  IssuedBook,
  ReturnedBook,
  Fine,
  ActivityLog,
  DashboardStats,
  User,
  UserRole,
} from './types';

export default function App() {
  // Navigation & Layout State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Theme (Dark / Light mode)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('library_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('library_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('library_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr_admin',
    name: 'Dr. Evelyn Vance',
    email: 'admin@library.edu',
    role: 'admin',
    department: 'Central Administration',
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toast Notifications
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  // Core Data State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([]);
  const [returnedBooks, setReturnedBooks] = useState<ReturnedBook[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingSupabase, setIsUsingSupabase] = useState(false);

  // Cross-view shortcuts (e.g. issue this specific book or member)
  const [preSelectedBookId, setPreSelectedBookId] = useState<string | null>(null);
  const [preSelectedMemberId, setPreSelectedMemberId] = useState<string | null>(null);

  // QR Code Modal State
  const [qrModalBook, setQrModalBook] = useState<Book | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Fetch all initial data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [
        statsData,
        booksData,
        membersData,
        issuesData,
        returnsData,
        finesData,
        logsData,
        health,
      ] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getBooks().catch(() => []),
        api.getMembers().catch(() => []),
        api.getIssuedBooks().catch(() => []),
        api.getReturnedBooks().catch(() => []),
        api.getFines().catch(() => []),
        api.getActivityLogs().catch(() => []),
        api.checkHealth().catch(() => ({ usingSupabase: false })),
      ]);

      if (statsData) setStats(statsData);
      setBooks(booksData);
      setMembers(membersData);
      setIssuedBooks(issuesData);
      setReturnedBooks(returnsData);
      setFines(finesData);
      setActivityLogs(logsData);
      setIsUsingSupabase(health.usingSupabase || false);
    } catch (err: any) {
      console.error('Failed to load library data:', err);
      showToast('Error syncing with database server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Role Switching
  const handleSwitchRole = (role: UserRole) => {
    if (role === 'admin') {
      setCurrentUser({
        id: 'usr_admin',
        name: 'Dr. Evelyn Vance',
        email: 'admin@library.edu',
        role: 'admin',
        department: 'Central Administration',
      });
      showToast('Switched to Admin privileges: full catalog and circulation control', 'info');
    } else if (role === 'librarian') {
      setCurrentUser({
        id: 'usr_librarian',
        name: 'Marcus Bell',
        email: 'librarian@library.edu',
        role: 'librarian',
        department: 'Circulation & Archives',
      });
      showToast('Switched to Librarian privileges: circulation desk & cataloging', 'info');
    } else {
      setCurrentUser({
        id: 'usr_student',
        name: 'Alex Rivera',
        email: 'alex.rivera@student.edu',
        role: 'student',
        department: 'Computer Science',
      });
      showToast('Switched to Student mode: read catalog, view fines & loan statements', 'info');
    }
  };

  // Auth Modal Handler
  const handleLogin = async (email: string, role?: UserRole) => {
    const userRole = role || 'admin';
    handleSwitchRole(userRole);
    showToast(`Welcome back, ${email}!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser({
      id: 'guest',
      name: 'Guest Patron',
      email: '',
      role: 'student',
    });
    showToast('Signed out of campus session.', 'info');
  };

  // QR Code Action
  const handleShowQRCode = async (book: Book) => {
    try {
      const res = await api.getBookQRCode(book.id);
      setQrModalBook(book);
      setQrDataUrl(res.qrDataUrl);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate QR code', 'error');
    }
  };

  // Book CRUD Handlers
  const handleAddBook = async (bookData: Partial<Book>) => {
    const newBook = await api.addBook(bookData);
    setBooks((prev) => [newBook, ...prev]);
    showToast(`"${newBook.title}" added to library catalog!`, 'success');
    api.getDashboardStats().then((s) => setStats(s));
  };

  const handleEditBook = async (id: string, bookData: Partial<Book>) => {
    const updated = await api.updateBook(id, bookData);
    setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)));
    showToast(`Updated "${updated.title}" catalog entry.`, 'success');
  };

  const handleDeleteBook = async (id: string) => {
    await api.deleteBook(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
    showToast('Book removed from library catalog.', 'info');
    api.getDashboardStats().then((s) => setStats(s));
  };

  // Member CRUD Handlers
  const handleAddMember = async (memberData: Partial<Member>) => {
    const newMember = await api.addMember(memberData);
    setMembers((prev) => [newMember, ...prev]);
    showToast(`Registered member ${newMember.member_name} (${newMember.member_code})`, 'success');
    api.getDashboardStats().then((s) => setStats(s));
  };

  const handleEditMember = async (id: string, memberData: Partial<Member>) => {
    const updated = await api.updateMember(id, memberData);
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
    showToast(`Updated profile for ${updated.member_name}.`, 'success');
  };

  const handleDeleteMember = async (id: string) => {
    await api.deleteMember(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    showToast('Member removed from library registry.', 'info');
    api.getDashboardStats().then((s) => setStats(s));
  };

  // Issue Book Handler
  const handleIssueBook = async (payload: {
    book_id: string;
    member_id: string;
    issue_date: string;
    due_date: string;
    notes?: string;
    issued_by?: string;
  }) => {
    const issued = await api.issueBook(payload);
    // Reload state to ensure accurate inventory & active counts
    await loadData();
    showToast(`Book successfully checked out! Due date: ${payload.due_date}`, 'success');
  };

  // Return Book Handler
  const handleReturnBook = async (payload: {
    issue_id: string;
    return_date?: string;
    received_by?: string;
  }) => {
    const result = await api.returnBook(payload);
    await loadData();
    if (result.fineAmount > 0) {
      showToast(`Book checked in. Late fee assessed: $${result.fineAmount.toFixed(2)}`, 'warning');
    } else {
      showToast('Book checked in on time! Inventory restored.', 'success');
    }
    return result;
  };

  // Fine Handler
  const handleUpdateFineStatus = async (id: string, status: 'pending' | 'paid' | 'waived') => {
    const updated = await api.updateFineStatus(id, status);
    setFines((prev) => prev.map((f) => (f.id === id ? updated : f)));
    showToast(`Fine #${id.slice(-6).toUpperCase()} marked as ${status.toUpperCase()}.`, 'success');
    api.getDashboardStats().then((s) => setStats(s));
  };

  // Cross-view shortcuts
  const handleIssueBookDirect = (book: Book) => {
    setPreSelectedBookId(book.id);
    setCurrentTab('issue');
  };

  const handleIssueToMemberDirect = (member: Member) => {
    setPreSelectedMemberId(member.id);
    setCurrentTab('issue');
  };

  // Calculate Overdue & Pending Fines count for badges
  const overdueCount = issuedBooks.filter((i) => i.status === 'overdue').length;
  const pendingFinesCount = fines.filter((f) => f.payment_status === 'pending').length;

  return (
    <div id="lms-application" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Toast Notification Container */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* QR Code Printable Modal */}
      <QRCodeModal
        book={qrModalBook}
        qrDataUrl={qrDataUrl}
        onClose={() => {
          setQrModalBook(null);
          setQrDataUrl(null);
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        overdueCount={overdueCount}
        pendingFinesCount={pendingFinesCount}
        isUsingSupabase={isUsingSupabase}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onQuickIssue={() => setCurrentTab('issue')}
          overdueCount={overdueCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectNav={setCurrentTab}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-500">
                Synchronizing Athena Library database...
              </p>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  currentUser={currentUser}
                  onNavigate={setCurrentTab}
                />
              )}

              {currentTab === 'books' && (
                <BooksView
                  books={books}
                  currentUser={currentUser}
                  onAddBook={handleAddBook}
                  onEditBook={handleEditBook}
                  onDeleteBook={handleDeleteBook}
                  onShowQRCode={handleShowQRCode}
                  onIssueBookDirect={handleIssueBookDirect}
                />
              )}

              {currentTab === 'members' && (
                <MembersView
                  members={members}
                  currentUser={currentUser}
                  onAddMember={handleAddMember}
                  onEditMember={handleEditMember}
                  onDeleteMember={handleDeleteMember}
                  onIssueToMember={handleIssueToMemberDirect}
                  onNavigateToReturns={() => setCurrentTab('return')}
                />
              )}

              {currentTab === 'issue' && (
                <IssueBookView
                  books={books}
                  members={members}
                  issuedBooks={issuedBooks}
                  currentUser={currentUser}
                  onIssueBook={handleIssueBook}
                  onNavigateToReturns={() => setCurrentTab('return')}
                  preSelectedBookId={preSelectedBookId}
                  preSelectedMemberId={preSelectedMemberId}
                />
              )}

              {currentTab === 'return' && (
                <ReturnBookView
                  issuedBooks={issuedBooks}
                  returnedBooks={returnedBooks}
                  currentUser={currentUser}
                  onReturnBook={handleReturnBook}
                  onNavigateToFines={() => setCurrentTab('fines')}
                />
              )}

              {currentTab === 'fines' && (
                <FinesView
                  fines={fines}
                  currentUser={currentUser}
                  onUpdateFineStatus={handleUpdateFineStatus}
                />
              )}

              {currentTab === 'reports' && (
                <ReportsView
                  books={books}
                  members={members}
                  issuedBooks={issuedBooks}
                  returnedBooks={returnedBooks}
                  fines={fines}
                />
              )}

              {currentTab === 'activity' && (
                <ActivityLogsView logs={activityLogs} />
              )}

              {currentTab === 'docs' && (
                <SupabaseDocsView isUsingSupabase={isUsingSupabase} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
