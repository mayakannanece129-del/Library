import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Book, Member, IssuedBook, ReturnedBook, Fine, ActivityLog, User, DashboardStats } from '../src/types.js';

// Fine rate: $1.00 or 10 currency units per day overdue
export const FINE_RATE_PER_DAY = 1.0;

// Initialize Supabase Client if credentials are provided in env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export let supabase: SupabaseClient | null = null;
export let isUsingSupabase = false;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    isUsingSupabase = true;
    console.log('✅ Supabase Client initialized with URL:', supabaseUrl);
  } catch (err) {
    console.warn('⚠️ Failed to initialize Supabase client, falling back to local store:', err);
  }
} else {
  console.log('ℹ️ Supabase credentials not detected in .env. Using in-memory persistent academic store with full schema compatibility.');
}

// In-Memory / Local Seed Data Store
export interface DBStore {
  users: User[];
  books: Book[];
  members: Member[];
  issued_books: IssuedBook[];
  returned_books: ReturnedBook[];
  fines: Fine[];
  activity_logs: ActivityLog[];
}

const initialDate = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const subDays = (d: Date, days: number) => {
  const result = new Date(d);
  result.setDate(result.getDate() - days);
  return formatDate(result);
};
const addDays = (d: Date, days: number) => {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return formatDate(result);
};

export const store: DBStore = {
  users: [
    {
      id: 'usr-001',
      name: 'Dr. Alistair Vance',
      email: 'admin@library.edu',
      password: 'admin',
      role: 'admin',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'usr-002',
      name: 'Eleanor Wright, MLIS',
      email: 'librarian@library.edu',
      password: 'lib',
      role: 'librarian',
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
      id: 'usr-003',
      name: 'Alex Rivera',
      email: 'student@library.edu',
      password: 'student',
      role: 'student',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
  ],
  books: [
    {
      id: 'bk-101',
      title: 'Introduction to Algorithms (4th Edition)',
      author: 'Thomas H. Cormen, Charles E. Leiserson',
      isbn: '978-0262046305',
      category: 'Computer Science',
      publisher: 'MIT Press',
      quantity: 8,
      available_quantity: 6,
      shelf_location: 'CS-A1-04',
      description: 'The standard comprehensive algorithmic textbook covering graph theory, dynamic programming, and complexity.',
      created_at: subDays(initialDate, 60),
    },
    {
      id: 'bk-102',
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      isbn: '978-1449373320',
      category: 'Computer Science',
      publisher: "O'Reilly Media",
      quantity: 5,
      available_quantity: 4,
      shelf_location: 'CS-B2-12',
      description: 'The big ideas behind reliable, scalable, and maintainable systems.',
      created_at: subDays(initialDate, 55),
    },
    {
      id: 'bk-103',
      title: 'Artificial Intelligence: A Modern Approach',
      author: 'Stuart Russell, Peter Norvig',
      isbn: '978-0134610993',
      category: 'Artificial Intelligence',
      publisher: 'Pearson',
      quantity: 6,
      available_quantity: 3,
      shelf_location: 'AI-C3-01',
      description: 'The definitive textbook for contemporary AI and machine learning foundations.',
      created_at: subDays(initialDate, 50),
    },
    {
      id: 'bk-104',
      title: 'Linear Algebra and Its Applications',
      author: 'Gilbert Strang',
      isbn: '978-0030105678',
      category: 'Mathematics',
      publisher: 'Cengage Learning',
      quantity: 10,
      available_quantity: 8,
      shelf_location: 'MATH-A3-15',
      description: 'Renowned introduction to matrices, vector spaces, and eigenvalues.',
      created_at: subDays(initialDate, 48),
    },
    {
      id: 'bk-105',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      category: 'Computer Science',
      publisher: 'Prentice Hall',
      quantity: 7,
      available_quantity: 5,
      shelf_location: 'CS-A2-08',
      description: 'Best practices for software engineering, refactoring, and code readability.',
      created_at: subDays(initialDate, 45),
    },
    {
      id: 'bk-106',
      title: 'Principles of Neural Science (6th Edition)',
      author: 'Eric R. Kandel, John D. Koester',
      isbn: '978-1259642234',
      category: 'Medicine',
      publisher: 'McGraw-Hill Medical',
      quantity: 4,
      available_quantity: 3,
      shelf_location: 'MED-B1-02',
      description: 'Comprehensive authority on cellular neuroscience and neurological systems.',
      created_at: subDays(initialDate, 40),
    },
    {
      id: 'bk-107',
      title: 'University Physics with Modern Physics',
      author: 'Hugh D. Young, Roger A. Freedman',
      isbn: '978-0135159553',
      category: 'Physics',
      publisher: 'Pearson',
      quantity: 12,
      available_quantity: 11,
      shelf_location: 'PHY-A2-22',
      description: 'Classic calculus-based college physics textbook.',
      created_at: subDays(initialDate, 38),
    },
    {
      id: 'bk-108',
      title: 'Corporate Finance (12th Edition)',
      author: 'Stephen A. Ross, Randolph W. Westerfield',
      isbn: '978-1259918940',
      category: 'Business',
      publisher: 'McGraw-Hill Education',
      quantity: 5,
      available_quantity: 4,
      shelf_location: 'BIZ-D1-19',
      description: 'Valuation, financial strategy, and capital budgeting fundamentals.',
      created_at: subDays(initialDate, 35),
    },
    {
      id: 'bk-109',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '978-0060935467',
      category: 'Literature',
      publisher: 'Harper Perennial',
      quantity: 9,
      available_quantity: 9,
      shelf_location: 'LIT-C2-05',
      description: 'Classic Pulitzer Prize-winning novel exploring racial justice and humanity.',
      created_at: subDays(initialDate, 30),
    },
    {
      id: 'bk-110',
      title: 'Microelectronic Circuits (8th Edition)',
      author: 'Adel S. Sedra, Kenneth C. Smith',
      isbn: '978-0190853464',
      category: 'Engineering',
      publisher: 'Oxford University Press',
      quantity: 6,
      available_quantity: 4,
      shelf_location: 'ENG-E1-09',
      description: 'Gold standard for electrical and electronic circuits analysis.',
      created_at: subDays(initialDate, 25),
    },
  ],
  members: [
    {
      id: 'mem-001',
      member_code: 'STU-CS-2024-001',
      member_name: 'Alex Rivera',
      department: 'Computer Science',
      phone: '+1 (555) 234-5678',
      email: 'student@library.edu',
      membership_date: subDays(initialDate, 120),
      status: 'active',
      created_at: subDays(initialDate, 120),
    },
    {
      id: 'mem-002',
      member_code: 'STU-EE-2023-014',
      member_name: 'Sophia Chen',
      department: 'Electrical Engineering',
      phone: '+1 (555) 345-6789',
      email: 'sophia.chen@college.edu',
      membership_date: subDays(initialDate, 200),
      status: 'active',
      created_at: subDays(initialDate, 200),
    },
    {
      id: 'mem-003',
      member_code: 'STU-BA-2024-055',
      member_name: 'Marcus Brody',
      department: 'Business Administration',
      phone: '+1 (555) 456-7890',
      email: 'marcus.brody@college.edu',
      membership_date: subDays(initialDate, 90),
      status: 'active',
      created_at: subDays(initialDate, 90),
    },
    {
      id: 'mem-004',
      member_code: 'FAC-MED-2021-003',
      member_name: 'Dr. Samantha Hayes',
      department: 'Medical Sciences',
      phone: '+1 (555) 567-8901',
      email: 'dr.hayes@med.college.edu',
      membership_date: subDays(initialDate, 400),
      status: 'active',
      created_at: subDays(initialDate, 400),
    },
    {
      id: 'mem-005',
      member_code: 'STU-PHY-2024-022',
      member_name: 'Liam O’Connor',
      department: 'Physics',
      phone: '+1 (555) 678-9012',
      email: 'liam.oconnor@college.edu',
      membership_date: subDays(initialDate, 45),
      status: 'active',
      created_at: subDays(initialDate, 45),
    },
    {
      id: 'mem-006',
      member_code: 'STU-ENG-2023-088',
      member_name: 'Priya Sharma',
      department: 'Mechanical Engineering',
      phone: '+1 (555) 789-0123',
      email: 'priya.sharma@college.edu',
      membership_date: subDays(initialDate, 180),
      status: 'active',
      created_at: subDays(initialDate, 180),
    },
  ],
  issued_books: [
    {
      id: 'iss-001',
      book_id: 'bk-101',
      member_id: 'mem-001',
      issue_date: subDays(initialDate, 18),
      due_date: subDays(initialDate, 4), // 4 days overdue!
      status: 'overdue',
      issued_by: 'Eleanor Wright, MLIS',
      notes: 'Term project reading.',
      created_at: subDays(initialDate, 18),
    },
    {
      id: 'iss-002',
      book_id: 'bk-103',
      member_id: 'mem-002',
      issue_date: subDays(initialDate, 5),
      due_date: addDays(initialDate, 9),
      status: 'issued',
      issued_by: 'Eleanor Wright, MLIS',
      notes: 'Standard 14-day checkout.',
      created_at: subDays(initialDate, 5),
    },
    {
      id: 'iss-003',
      book_id: 'bk-105',
      member_id: 'mem-003',
      issue_date: subDays(initialDate, 10),
      due_date: addDays(initialDate, 4),
      status: 'issued',
      issued_by: 'Dr. Alistair Vance',
      notes: 'Agile lab assignment.',
      created_at: subDays(initialDate, 10),
    },
    {
      id: 'iss-004',
      book_id: 'bk-110',
      member_id: 'mem-006',
      issue_date: subDays(initialDate, 20),
      due_date: subDays(initialDate, 6), // 6 days overdue!
      status: 'overdue',
      issued_by: 'Eleanor Wright, MLIS',
      notes: 'Circuits midterm prep.',
      created_at: subDays(initialDate, 20),
    },
    {
      id: 'iss-005',
      book_id: 'bk-102',
      member_id: 'mem-001',
      issue_date: subDays(initialDate, 3),
      due_date: addDays(initialDate, 11),
      status: 'issued',
      issued_by: 'Eleanor Wright, MLIS',
      notes: 'Distributed systems thesis.',
      created_at: subDays(initialDate, 3),
    },
  ],
  returned_books: [
    {
      id: 'ret-001',
      issue_id: 'iss-historical-01',
      return_date: subDays(initialDate, 2),
      fine_amount: 3.0,
      received_by: 'Eleanor Wright, MLIS',
      created_at: subDays(initialDate, 2),
    },
    {
      id: 'ret-002',
      issue_id: 'iss-historical-02',
      return_date: subDays(initialDate, 7),
      fine_amount: 0.0,
      received_by: 'Eleanor Wright, MLIS',
      created_at: subDays(initialDate, 7),
    },
    {
      id: 'ret-003',
      issue_id: 'iss-historical-03',
      return_date: subDays(initialDate, 12),
      fine_amount: 5.0,
      received_by: 'Dr. Alistair Vance',
      created_at: subDays(initialDate, 12),
    },
  ],
  fines: [
    {
      id: 'fine-001',
      member_id: 'mem-001',
      issue_id: 'iss-001',
      amount: 4.0, // 4 days * $1
      payment_status: 'pending',
      created_at: subDays(initialDate, 1),
    },
    {
      id: 'fine-002',
      member_id: 'mem-006',
      issue_id: 'iss-004',
      amount: 6.0, // 6 days * $1
      payment_status: 'pending',
      created_at: subDays(initialDate, 2),
    },
    {
      id: 'fine-003',
      member_id: 'mem-003',
      issue_id: undefined,
      amount: 5.0,
      payment_status: 'paid',
      paid_date: subDays(initialDate, 12),
      created_at: subDays(initialDate, 14),
    },
    {
      id: 'fine-004',
      member_id: 'mem-005',
      issue_id: undefined,
      amount: 3.0,
      payment_status: 'paid',
      paid_date: subDays(initialDate, 2),
      created_at: subDays(initialDate, 4),
    },
  ],
  activity_logs: [
    {
      id: 'log-001',
      action: 'BOOK_ISSUED',
      details: 'Issued "Introduction to Algorithms" to Alex Rivera (STU-CS-2024-001)',
      user_name: 'Eleanor Wright, MLIS',
      created_at: subDays(initialDate, 18),
    },
    {
      id: 'log-002',
      action: 'BOOK_RETURNED',
      details: 'Returned "University Physics" by Liam O’Connor. Late fine: $3.00.',
      user_name: 'Eleanor Wright, MLIS',
      created_at: subDays(initialDate, 2),
    },
    {
      id: 'log-003',
      action: 'FINE_PAID',
      details: 'Marked $3.00 fine as Paid for Liam O’Connor',
      user_name: 'Dr. Alistair Vance',
      created_at: subDays(initialDate, 2),
    },
    {
      id: 'log-004',
      action: 'BOOK_ADDED',
      details: 'Added new book title: "Designing Data-Intensive Applications" (5 copies)',
      user_name: 'Eleanor Wright, MLIS',
      created_at: subDays(initialDate, 1),
    },
    {
      id: 'log-005',
      action: 'MEMBER_REGISTERED',
      details: 'Registered new student Priya Sharma (STU-ENG-2023-088)',
      user_name: 'Dr. Alistair Vance',
      created_at: subDays(initialDate, 1),
    },
  ],
};

// Helper: Calculate overdue days and fine for an issue
export function calculateIssueFine(issue: IssuedBook): { overdueDays: number; fineAmount: number } {
  const today = new Date();
  const due = new Date(issue.due_date);
  // Reset hours to compare calendar days
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - due.getTime();
  const overdueDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const fineAmount = overdueDays * FINE_RATE_PER_DAY;

  return { overdueDays, fineAmount };
}

// Log an activity
export function recordActivity(action: string, details: string, user_name: string = 'System') {
  const log: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    action,
    details,
    user_name,
    created_at: new Date().toISOString(),
  };
  store.activity_logs.unshift(log);
  if (store.activity_logs.length > 200) {
    store.activity_logs.pop();
  }
  return log;
}

// Calculate Dashboard Stats
export function getDashboardStats(): DashboardStats {
  const todayStr = formatDate(new Date());

  // Update overdue statuses dynamically
  store.issued_books.forEach((iss) => {
    if (iss.status !== 'returned' && iss.due_date < todayStr) {
      iss.status = 'overdue';
    }
  });

  const totalBooks = store.books.reduce((acc, b) => acc + (Number(b.quantity) || 0), 0);
  const availableBooks = store.books.reduce((acc, b) => acc + (Number(b.available_quantity) || 0), 0);
  const activeIssues = store.issued_books.filter((b) => b.status === 'issued' || b.status === 'overdue');
  const issuedBooks = activeIssues.length;
  const returnedBooks = store.returned_books.length;
  const totalMembers = store.members.length;
  const overdueBooks = store.issued_books.filter((b) => b.status === 'overdue').length;

  const totalFineCollected = store.fines
    .filter((f) => f.payment_status === 'paid')
    .reduce((acc, f) => acc + (Number(f.amount) || 0), 0);

  const pendingFines = store.fines
    .filter((f) => f.payment_status === 'pending')
    .reduce((acc, f) => acc + (Number(f.amount) || 0), 0);

  // Group books by category
  const catMap: Record<string, number> = {};
  store.books.forEach((b) => {
    catMap[b.category] = (catMap[b.category] || 0) + b.quantity;
  });
  const categoryStats = Object.entries(catMap).map(([category, count]) => ({ category, count }));

  // Group members by department
  const deptMap: Record<string, number> = {};
  store.members.forEach((m) => {
    deptMap[m.department] = (deptMap[m.department] || 0) + 1;
  });
  const departmentStats = Object.entries(deptMap).map(([department, count]) => ({ department, count }));

  // Recent transactions list
  const recentTransactions: DashboardStats['recentTransactions'] = [];

  // Add recent issues
  store.issued_books.slice(-5).reverse().forEach((iss) => {
    const bk = store.books.find((b) => b.id === iss.book_id);
    const mem = store.members.find((m) => m.id === iss.member_id);
    recentTransactions.push({
      id: iss.id,
      type: 'issue',
      title: bk ? bk.title : 'Book Checkout',
      member: mem ? mem.member_name : 'Member',
      date: iss.issue_date,
      status: iss.status,
    });
  });

  // Add recent returns
  store.returned_books.slice(-5).reverse().forEach((ret) => {
    recentTransactions.push({
      id: ret.id,
      type: 'return',
      title: 'Book Returned',
      member: ret.received_by || 'Library Desk',
      date: ret.return_date,
      status: ret.fine_amount > 0 ? `Fine: $${ret.fine_amount}` : 'On Time',
      amount: ret.fine_amount,
    });
  });

  return {
    totalBooks,
    availableBooks,
    issuedBooks,
    returnedBooks,
    totalMembers,
    overdueBooks,
    totalFineCollected,
    pendingFines,
    recentTransactions: recentTransactions.slice(0, 10),
    categoryStats,
    departmentStats,
  };
}
