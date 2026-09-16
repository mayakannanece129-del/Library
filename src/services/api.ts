import { Book, Member, IssuedBook, ReturnedBook, Fine, ActivityLog, DashboardStats, User } from '../types';

export const api = {
  // System & Status
  async getSystemStatus() {
    const res = await fetch('/api/system/status');
    if (!res.ok) throw new Error('Failed to fetch system status');
    return res.json();
  },

  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Password reset request failed');
    return data;
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/auth/users');
    if (!res.ok) throw new Error('Failed to load users');
    return res.json();
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch('/api/dashboard/stats');
    if (!res.ok) throw new Error('Failed to load dashboard stats');
    return res.json();
  },

  // Books
  async getBooks(params?: { search?: string; category?: string; availability?: string }): Promise<Book[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.availability) query.set('availability', params.availability);
    const res = await fetch(`/api/books?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load books');
    return res.json();
  },

  async getBook(id: string): Promise<Book> {
    const res = await fetch(`/api/books/${id}`);
    if (!res.ok) throw new Error('Failed to fetch book');
    return res.json();
  },

  async createBook(book: Partial<Book>): Promise<Book> {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create book');
    return data;
  },

  async updateBook(id: string, book: Partial<Book>): Promise<Book> {
    const res = await fetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update book');
    return data;
  },

  async deleteBook(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/books/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete book');
    return data;
  },

  async getBookQRCode(id: string): Promise<{ qrDataUrl: string; book: Book }> {
    const res = await fetch(`/api/books/${id}/qrcode`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate QR Code');
    return data;
  },

  // Members
  async getMembers(params?: { search?: string; department?: string; status?: string }): Promise<Member[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.department) query.set('department', params.department);
    if (params?.status) query.set('status', params.status);
    const res = await fetch(`/api/members?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load members');
    return res.json();
  },

  async getMember(id: string): Promise<{ member: Member; activeIssues: any[]; history: any[]; fines: Fine[] }> {
    const res = await fetch(`/api/members/${id}`);
    if (!res.ok) throw new Error('Failed to fetch member details');
    return res.json();
  },

  async generateMemberId(dept?: string): Promise<{ member_code: string }> {
    const res = await fetch(`/api/members/generate-id?dept=${dept || ''}`);
    if (!res.ok) throw new Error('Failed to generate member code');
    return res.json();
  },

  async createMember(member: Partial<Member>): Promise<Member> {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create member');
    return data;
  },

  async updateMember(id: string, member: Partial<Member>): Promise<Member> {
    const res = await fetch(`/api/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update member');
    return data;
  },

  async deleteMember(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/members/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete member');
    return data;
  },

  // Issued Books
  async getIssuedBooks(params?: { status?: string; member_id?: string; book_id?: string }): Promise<IssuedBook[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.member_id) query.set('member_id', params.member_id);
    if (params?.book_id) query.set('book_id', params.book_id);
    const res = await fetch(`/api/issued-books?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load issued books');
    return res.json();
  },

  async issueBook(payload: {
    book_id: string;
    member_id: string;
    issue_date: string;
    due_date: string;
    notes?: string;
    issued_by?: string;
  }): Promise<IssuedBook> {
    const res = await fetch('/api/issued-books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to issue book');
    return data;
  },

  async checkBookAvailability(bookId: string) {
    const res = await fetch(`/api/issued-books/check-availability/${bookId}`);
    if (!res.ok) throw new Error('Failed to check availability');
    return res.json();
  },

  // Returned Books
  async getReturnedBooks(): Promise<ReturnedBook[]> {
    const res = await fetch('/api/returned-books');
    if (!res.ok) throw new Error('Failed to load returned books');
    return res.json();
  },

  async returnBook(payload: {
    issue_id: string;
    return_date?: string;
    received_by?: string;
  }): Promise<{
    success: boolean;
    returnRecord: ReturnedBook;
    fineAmount: number;
    overdueDays: number;
    fineRecord?: Fine;
    bookTitle?: string;
    memberName?: string;
  }> {
    const res = await fetch('/api/returned-books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to process return');
    return data;
  },

  // Fines
  async getFines(params?: { payment_status?: string; member_id?: string }): Promise<Fine[]> {
    const query = new URLSearchParams();
    if (params?.payment_status) query.set('payment_status', params.payment_status);
    if (params?.member_id) query.set('member_id', params.member_id);
    const res = await fetch(`/api/fines?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load fines');
    return res.json();
  },

  async updateFineStatus(id: string, status: 'pending' | 'paid' | 'waived', operator?: string): Promise<Fine> {
    const res = await fetch(`/api/fines/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, operator }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update fine status');
    return data;
  },

  // Reports
  async getReports(timeframe: 'daily' | 'weekly' | 'monthly' | 'all'): Promise<any> {
    const res = await fetch(`/api/reports?timeframe=${timeframe}`);
    if (!res.ok) throw new Error('Failed to load reports');
    return res.json();
  },

  // Activity Logs
  async getActivityLogs(): Promise<ActivityLog[]> {
    const res = await fetch('/api/activity-logs');
    if (!res.ok) throw new Error('Failed to load activity logs');
    return res.json();
  },

  // Aliases for convenient caller ergonomics
  async addBook(book: Partial<Book>): Promise<Book> {
    return this.createBook(book);
  },

  async addMember(member: Partial<Member>): Promise<Member> {
    return this.createMember(member);
  },

  async checkHealth(): Promise<{ status: string; usingSupabase: boolean }> {
    return this.getSystemStatus();
  },
};
