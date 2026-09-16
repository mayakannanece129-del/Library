/**
 * Library Management System - Types & Data Models
 * Matching Supabase Database Schema
 */

export type UserRole = 'admin' | 'librarian' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  quantity: number;
  available_quantity: number;
  shelf_location?: string;
  description?: string;
  created_at: string;
}

export interface Member {
  id: string;
  member_code: string;
  member_name: string;
  department: string;
  phone: string;
  email: string;
  membership_date: string;
  status: 'active' | 'suspended' | 'expired';
  created_at: string;
  active_issues_count?: number;
  total_fine_due?: number;
}

export interface IssuedBook {
  id: string;
  book_id: string;
  member_id: string;
  issue_date: string;
  due_date: string;
  status: 'issued' | 'returned' | 'overdue';
  issued_by?: string;
  notes?: string;
  created_at: string;
  book?: Book;
  member?: Member;
  overdue_days?: number;
  calculated_fine?: number;
}

export interface ReturnedBook {
  id: string;
  issue_id: string;
  return_date: string;
  fine_amount: number;
  received_by?: string;
  created_at: string;
  issue?: IssuedBook;
}

export interface Fine {
  id: string;
  member_id: string;
  issue_id?: string;
  amount: number;
  payment_status: 'pending' | 'paid' | 'waived';
  paid_date?: string;
  created_at: string;
  member?: Member;
  issue?: IssuedBook;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  user_name: string;
  created_at: string;
}

export interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  issuedBooks: number;
  returnedBooks: number;
  totalMembers: number;
  overdueBooks: number;
  totalFineCollected: number;
  pendingFines: number;
  recentTransactions: Array<{
    id: string;
    type: 'issue' | 'return' | 'fine' | 'member' | 'book';
    title: string;
    member: string;
    date: string;
    status: string;
    amount?: number;
  }>;
  categoryStats: Array<{ category: string; count: number }>;
  departmentStats: Array<{ department: string; count: number }>;
}

export interface ReportFilter {
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all';
  type: 'issued' | 'returned' | 'overdue' | 'fines';
  startDate?: string;
  endDate?: string;
}
