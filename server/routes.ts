import { Router, Request, Response } from 'express';
import QRCode from 'qrcode';
import {
  store,
  isUsingSupabase,
  recordActivity,
  getDashboardStats,
  calculateIssueFine,
  FINE_RATE_PER_DAY,
} from './db.js';
import { Book, Member, IssuedBook, ReturnedBook, Fine } from '../src/types.js';

const router = Router();

// ==========================================
// 1. SYSTEM & AUTH ROUTES
// ==========================================

router.get('/system/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    isUsingSupabase,
    database: isUsingSupabase ? 'Supabase Cloud PostgreSQL' : 'Academic In-Memory Store (Supabase Schema Compatible)',
    counts: {
      books: store.books.length,
      members: store.members.length,
      issued: store.issued_books.filter((i) => i.status !== 'returned').length,
      fines: store.fines.length,
    },
    version: '2.5.0-college-edition',
    fineRatePerDay: FINE_RATE_PER_DAY,
  });
});

router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = store.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
  }

  recordActivity('USER_LOGIN', `User ${user.name} logged in as [${user.role.toUpperCase()}]`, user.name);

  // Exclude password in response
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, token: `demo-jwt-${user.id}-${Date.now()}` });
});

router.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Please enter your registered institutional email.' });
  }

  const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    recordActivity('PASSWORD_RESET_REQUEST', `Password reset token dispatched for ${email}`, 'Auth System');
  }

  // Always return friendly message for security
  res.json({
    message: 'If an account exists with this email, a secure password reset link has been dispatched to your inbox.',
  });
});

router.get('/auth/users', (req: Request, res: Response) => {
  const safeUsers = store.users.map(({ password: _, ...u }) => u);
  res.json(safeUsers);
});

// ==========================================
// 2. DASHBOARD STATS
// ==========================================

router.get('/dashboard/stats', (req: Request, res: Response) => {
  const stats = getDashboardStats();
  res.json(stats);
});

// ==========================================
// 3. BOOK MANAGEMENT ROUTES (CRUD)
// ==========================================

// GET all books with search and filter
router.get('/books', (req: Request, res: Response) => {
  const { search, category, availability } = req.query;
  let books = [...store.books];

  if (category && category !== 'All') {
    books = books.filter((b) => b.category.toLowerCase() === String(category).toLowerCase());
  }

  if (availability) {
    if (availability === 'available') {
      books = books.filter((b) => b.available_quantity > 0);
    } else if (availability === 'out_of_stock') {
      books = books.filter((b) => b.available_quantity === 0);
    }
  }

  if (search) {
    const q = String(search).toLowerCase();
    books = books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        (b.publisher && b.publisher.toLowerCase().includes(q))
    );
  }

  res.json(books);
});

// GET single book
router.get('/books/:id', (req: Request, res: Response) => {
  const book = store.books.find((b) => b.id === req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

// POST Add Book
router.post('/books', (req: Request, res: Response) => {
  const { title, author, isbn, category, publisher, quantity, shelf_location, description } = req.body;

  if (!title || !author || !isbn || !category || !publisher) {
    return res.status(400).json({ error: 'Title, Author, ISBN, Category, and Publisher are required.' });
  }

  const existingIsbn = store.books.find((b) => b.isbn.trim() === isbn.trim());
  if (existingIsbn) {
    return res.status(400).json({ error: `A book with ISBN ${isbn} already exists in the catalog.` });
  }

  const numQty = parseInt(quantity, 10) || 1;
  const newBook: Book = {
    id: `bk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title: title.trim(),
    author: author.trim(),
    isbn: isbn.trim(),
    category: category.trim(),
    publisher: publisher.trim(),
    quantity: numQty,
    available_quantity: numQty,
    shelf_location: shelf_location ? shelf_location.trim() : 'General Stacks',
    description: description ? description.trim() : '',
    created_at: new Date().toISOString(),
  };

  store.books.unshift(newBook);
  recordActivity('BOOK_ADDED', `Added "${newBook.title}" by ${newBook.author} (${numQty} copies)`, req.body.operator || 'Librarian');

  res.status(201).json(newBook);
});

// PUT Update Book
router.put('/books/:id', (req: Request, res: Response) => {
  const index = store.books.findIndex((b) => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Book not found' });

  const existing = store.books[index];
  const { title, author, isbn, category, publisher, quantity, shelf_location, description } = req.body;

  if (isbn && isbn.trim() !== existing.isbn) {
    const duplicate = store.books.find((b) => b.isbn.trim() === isbn.trim() && b.id !== req.params.id);
    if (duplicate) {
      return res.status(400).json({ error: `ISBN ${isbn} is already registered to another book.` });
    }
  }

  const newQty = quantity !== undefined ? parseInt(quantity, 10) : existing.quantity;
  const issuedCount = existing.quantity - existing.available_quantity;
  if (newQty < issuedCount) {
    return res.status(400).json({
      error: `Cannot reduce total quantity to ${newQty} because ${issuedCount} copies are currently issued to members.`,
    });
  }

  const updated: Book = {
    ...existing,
    title: title ? title.trim() : existing.title,
    author: author ? author.trim() : existing.author,
    isbn: isbn ? isbn.trim() : existing.isbn,
    category: category ? category.trim() : existing.category,
    publisher: publisher ? publisher.trim() : existing.publisher,
    quantity: newQty,
    available_quantity: newQty - issuedCount,
    shelf_location: shelf_location !== undefined ? shelf_location.trim() : existing.shelf_location,
    description: description !== undefined ? description.trim() : existing.description,
  };

  store.books[index] = updated;
  recordActivity('BOOK_UPDATED', `Updated catalog details for "${updated.title}"`, req.body.operator || 'Librarian');

  res.json(updated);
});

// DELETE Book
router.delete('/books/:id', (req: Request, res: Response) => {
  const index = store.books.findIndex((b) => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Book not found' });

  const book = store.books[index];
  const activeIssues = store.issued_books.filter(
    (i) => i.book_id === book.id && (i.status === 'issued' || i.status === 'overdue')
  );

  if (activeIssues.length > 0) {
    return res.status(400).json({
      error: `Cannot delete book while ${activeIssues.length} copy is currently checked out to students. Please return all copies first.`,
    });
  }

  store.books.splice(index, 1);
  recordActivity('BOOK_DELETED', `Deleted book "${book.title}" (ISBN: ${book.isbn})`, req.body.operator || 'Admin');
  res.json({ success: true, message: 'Book deleted from catalog' });
});

// GET Book QR Code
router.get('/books/:id/qrcode', async (req: Request, res: Response) => {
  const book = store.books.find((b) => b.id === req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  try {
    const payload = JSON.stringify({
      id: book.id,
      title: book.title,
      isbn: book.isbn,
      author: book.author,
      shelf: book.shelf_location,
      url: `/books/${book.id}`,
    });

    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    });

    res.json({ qrDataUrl, book });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate QR Code', details: err.message });
  }
});

// ==========================================
// 4. MEMBER MANAGEMENT ROUTES (CRUD)
// ==========================================

// GET all members
router.get('/members', (req: Request, res: Response) => {
  const { search, department, status } = req.query;
  let members = store.members.map((m) => {
    const activeCount = store.issued_books.filter(
      (iss) => iss.member_id === m.id && (iss.status === 'issued' || iss.status === 'overdue')
    ).length;

    const memberFines = store.fines
      .filter((f) => f.member_id === m.id && f.payment_status === 'pending')
      .reduce((acc, f) => acc + (Number(f.amount) || 0), 0);

    return {
      ...m,
      active_issues_count: activeCount,
      total_fine_due: memberFines,
    };
  });

  if (department && department !== 'All') {
    members = members.filter((m) => m.department.toLowerCase() === String(department).toLowerCase());
  }

  if (status && status !== 'All') {
    members = members.filter((m) => m.status === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    members = members.filter(
      (m) =>
        m.member_name.toLowerCase().includes(q) ||
        m.member_code.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.includes(q)
    );
  }

  res.json(members);
});

// Generate next Member Code
router.get('/members/generate-id', (req: Request, res: Response) => {
  const dept = String(req.query.dept || 'GEN').substring(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const count = store.members.length + 1;
  const code = `MEM-${dept}-${year}-${String(count).padStart(3, '0')}`;
  res.json({ member_code: code });
});

// GET single member with borrowing history
router.get('/members/:id', (req: Request, res: Response) => {
  const member = store.members.find((m) => m.id === req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  const activeIssues = store.issued_books
    .filter((i) => i.member_id === member.id && (i.status === 'issued' || i.status === 'overdue'))
    .map((i) => ({
      ...i,
      book: store.books.find((b) => b.id === i.book_id),
      ...calculateIssueFine(i),
    }));

  const history = store.issued_books
    .filter((i) => i.member_id === member.id && i.status === 'returned')
    .map((i) => ({
      ...i,
      book: store.books.find((b) => b.id === i.book_id),
      returnRecord: store.returned_books.find((r) => r.issue_id === i.id),
    }));

  const fines = store.fines.filter((f) => f.member_id === member.id);

  res.json({
    member,
    activeIssues,
    history,
    fines,
  });
});

// POST Add Member
router.post('/members', (req: Request, res: Response) => {
  const { member_name, department, phone, email, member_code, status } = req.body;

  if (!member_name || !department || !phone || !email) {
    return res.status(400).json({ error: 'Member Name, Department, Phone, and Email are required.' });
  }

  const existingEmail = store.members.find((m) => m.email.toLowerCase() === email.toLowerCase());
  if (existingEmail) {
    return res.status(400).json({ error: `Member with email ${email} is already registered.` });
  }

  const generatedCode =
    member_code ||
    `STU-${department.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${String(
      store.members.length + 1
    ).padStart(3, '0')}`;

  const newMember: Member = {
    id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    member_code: generatedCode,
    member_name: member_name.trim(),
    department: department.trim(),
    phone: phone.trim(),
    email: email.trim(),
    membership_date: new Date().toISOString().split('T')[0],
    status: status || 'active',
    created_at: new Date().toISOString(),
  };

  store.members.unshift(newMember);
  recordActivity(
    'MEMBER_REGISTERED',
    `Registered new member ${newMember.member_name} (${newMember.member_code}) in ${newMember.department}`,
    req.body.operator || 'Librarian'
  );

  res.status(201).json(newMember);
});

// PUT Update Member
router.put('/members/:id', (req: Request, res: Response) => {
  const index = store.members.findIndex((m) => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Member not found' });

  const existing = store.members[index];
  const { member_name, department, phone, email, status } = req.body;

  if (email && email.toLowerCase() !== existing.email.toLowerCase()) {
    const dup = store.members.find(
      (m) => m.email.toLowerCase() === email.toLowerCase() && m.id !== req.params.id
    );
    if (dup) {
      return res.status(400).json({ error: `Email ${email} is already used by another member.` });
    }
  }

  const updated: Member = {
    ...existing,
    member_name: member_name ? member_name.trim() : existing.member_name,
    department: department ? department.trim() : existing.department,
    phone: phone ? phone.trim() : existing.phone,
    email: email ? email.trim() : existing.email,
    status: status || existing.status,
  };

  store.members[index] = updated;
  recordActivity('MEMBER_UPDATED', `Updated details for ${updated.member_name}`, req.body.operator || 'Librarian');

  res.json(updated);
});

// DELETE Member
router.delete('/members/:id', (req: Request, res: Response) => {
  const index = store.members.findIndex((m) => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Member not found' });

  const member = store.members[index];
  const activeIssues = store.issued_books.filter(
    (i) => i.member_id === member.id && (i.status === 'issued' || i.status === 'overdue')
  );

  if (activeIssues.length > 0) {
    return res.status(400).json({
      error: `Cannot remove member with ${activeIssues.length} unreturned book(s). All borrowed books must be returned first.`,
    });
  }

  store.members.splice(index, 1);
  recordActivity('MEMBER_DELETED', `Removed member ${member.member_name} (${member.member_code})`, req.body.operator || 'Admin');
  res.json({ success: true, message: 'Member deleted successfully' });
});

// ==========================================
// 5. ISSUE BOOK MODULE
// ==========================================

// GET issued books
router.get('/issued-books', (req: Request, res: Response) => {
  const { status, member_id, book_id } = req.query;
  const todayStr = new Date().toISOString().split('T')[0];

  let list = store.issued_books.map((iss) => {
    // Dynamically flag overdue
    let currentStatus = iss.status;
    if (currentStatus !== 'returned' && iss.due_date < todayStr) {
      currentStatus = 'overdue';
    }

    const book = store.books.find((b) => b.id === iss.book_id);
    const member = store.members.find((m) => m.id === iss.member_id);
    const fineInfo = calculateIssueFine(iss);

    return {
      ...iss,
      status: currentStatus,
      book,
      member,
      overdue_days: fineInfo.overdueDays,
      calculated_fine: fineInfo.fineAmount,
    };
  });

  if (status && status !== 'all') {
    list = list.filter((i) => i.status === status);
  }

  if (member_id) {
    list = list.filter((i) => i.member_id === member_id);
  }

  if (book_id) {
    list = list.filter((i) => i.book_id === book_id);
  }

  res.json(list);
});

// POST Issue a book
router.post('/issued-books', (req: Request, res: Response) => {
  const { book_id, member_id, issue_date, due_date, notes, issued_by } = req.body;

  if (!book_id || !member_id || !due_date) {
    return res.status(400).json({ error: 'Book, Member, and Due Date are required.' });
  }

  const book = store.books.find((b) => b.id === book_id);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  if (book.available_quantity <= 0) {
    return res.status(400).json({
      error: `"${book.title}" is currently out of stock (0 available copies). All copies are currently issued.`,
    });
  }

  const member = store.members.find((m) => m.id === member_id);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  if (member.status !== 'active') {
    return res.status(400).json({
      error: `Member account is currently ${member.status}. Cannot issue books to non-active accounts.`,
    });
  }

  // Check if member already has overdue books
  const overdueCount = store.issued_books.filter(
    (i) => i.member_id === member_id && i.status === 'overdue'
  ).length;

  if (overdueCount > 0) {
    return res.status(400).json({
      error: `Member has ${overdueCount} overdue book(s) pending return. Overdue items must be returned and settled before new checkouts.`,
    });
  }

  const now = new Date();
  const issDate = issue_date || now.toISOString().split('T')[0];

  const newIssue: IssuedBook = {
    id: `iss-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    book_id,
    member_id,
    issue_date: issDate,
    due_date,
    status: 'issued',
    issued_by: issued_by || 'Eleanor Wright, MLIS',
    notes: notes || '',
    created_at: new Date().toISOString(),
  };

  // Decrement book available count
  book.available_quantity -= 1;
  store.issued_books.unshift(newIssue);

  recordActivity(
    'BOOK_ISSUED',
    `Issued "${book.title}" to ${member.member_name} (${member.member_code}). Due on ${due_date}.`,
    issued_by || 'Librarian'
  );

  res.status(201).json({
    ...newIssue,
    book,
    member,
  });
});

// Check Book Stock / Availability
router.get('/issued-books/check-availability/:bookId', (req: Request, res: Response) => {
  const book = store.books.find((b) => b.id === req.params.bookId);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json({
    available: book.available_quantity > 0,
    available_quantity: book.available_quantity,
    total_quantity: book.quantity,
    shelf_location: book.shelf_location,
  });
});

// ==========================================
// 6. RETURN BOOK MODULE (WITH FINE CALCULATION)
// ==========================================

// GET return history
router.get('/returned-books', (req: Request, res: Response) => {
  const returnsWithDetails = store.returned_books.map((ret) => {
    const issue = store.issued_books.find((i) => i.id === ret.issue_id);
    const book = issue ? store.books.find((b) => b.id === issue.book_id) : undefined;
    const member = issue ? store.members.find((m) => m.id === issue.member_id) : undefined;

    return {
      ...ret,
      issue,
      book,
      member,
    };
  });

  res.json(returnsWithDetails);
});

// POST Return a book
router.post('/returned-books', (req: Request, res: Response) => {
  const { issue_id, return_date, received_by } = req.body;

  if (!issue_id) {
    return res.status(400).json({ error: 'Issue record ID is required.' });
  }

  const issue = store.issued_books.find((i) => i.id === issue_id);
  if (!issue) return res.status(404).json({ error: 'Issue record not found' });

  if (issue.status === 'returned') {
    return res.status(400).json({ error: 'This book has already been marked as returned.' });
  }

  const book = store.books.find((b) => b.id === issue.book_id);
  const member = store.members.find((m) => m.id === issue.member_id);

  const retDate = return_date || new Date().toISOString().split('T')[0];
  const { overdueDays, fineAmount } = calculateIssueFine(issue);

  // Mark issue as returned
  issue.status = 'returned';

  // Increment available quantity
  if (book) {
    book.available_quantity = Math.min(book.quantity, book.available_quantity + 1);
  }

  // Record into returned_books table
  const newReturn: ReturnedBook = {
    id: `ret-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    issue_id,
    return_date: retDate,
    fine_amount: fineAmount,
    received_by: received_by || 'Eleanor Wright, MLIS',
    created_at: new Date().toISOString(),
  };
  store.returned_books.unshift(newReturn);

  // If late, generate fine record in fines table
  let fineRecord: Fine | undefined;
  if (fineAmount > 0 && member) {
    fineRecord = {
      id: `fine-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      member_id: member.id,
      issue_id: issue.id,
      amount: fineAmount,
      payment_status: 'pending',
      created_at: new Date().toISOString(),
    };
    store.fines.unshift(fineRecord);
  }

  recordActivity(
    'BOOK_RETURNED',
    `Returned "${book?.title || 'Book'}" from ${member?.member_name || 'Member'}.${
      fineAmount > 0 ? ` Overdue fine: $${fineAmount.toFixed(2)} (${overdueDays} days late).` : ' On schedule (No fine).'
    }`,
    received_by || 'Librarian'
  );

  res.status(201).json({
    success: true,
    returnRecord: newReturn,
    fineAmount,
    overdueDays,
    fineRecord,
    bookTitle: book?.title,
    memberName: member?.member_name,
  });
});

// ==========================================
// 7. FINE MANAGEMENT
// ==========================================

// GET all fines
router.get('/fines', (req: Request, res: Response) => {
  const { payment_status, member_id } = req.query;

  let list = store.fines.map((f) => {
    const member = store.members.find((m) => m.id === f.member_id);
    const issue = f.issue_id ? store.issued_books.find((i) => i.id === f.issue_id) : undefined;
    const book = issue ? store.books.find((b) => b.id === issue.book_id) : undefined;

    return {
      ...f,
      member,
      issue,
      book,
    };
  });

  if (payment_status && payment_status !== 'all') {
    list = list.filter((f) => f.payment_status === payment_status);
  }

  if (member_id) {
    list = list.filter((f) => f.member_id === member_id);
  }

  res.json(list);
});

// PUT update fine payment status (Pay or Waive)
router.put('/fines/:id/status', (req: Request, res: Response) => {
  const { status, operator } = req.body;
  if (!status || !['pending', 'paid', 'waived'].includes(status)) {
    return res.status(400).json({ error: 'Status must be "pending", "paid", or "waived".' });
  }

  const fine = store.fines.find((f) => f.id === req.params.id);
  if (!fine) return res.status(404).json({ error: 'Fine record not found' });

  fine.payment_status = status;
  if (status === 'paid') {
    fine.paid_date = new Date().toISOString().split('T')[0];
  }

  const member = store.members.find((m) => m.id === fine.member_id);
  recordActivity(
    'FINE_STATUS_UPDATED',
    `Updated fine #${fine.id.slice(-6)} ($${fine.amount}) to "${status.toUpperCase()}" for ${member?.member_name || 'Member'}`,
    operator || 'Librarian'
  );

  res.json(fine);
});

// ==========================================
// 8. REPORTS MODULE
// ==========================================

router.get('/reports', (req: Request, res: Response) => {
  const { timeframe, type } = req.query;
  const now = new Date();

  let daysBack = 365;
  if (timeframe === 'daily') daysBack = 1;
  else if (timeframe === 'weekly') daysBack = 7;
  else if (timeframe === 'monthly') daysBack = 30;

  const cutoff = new Date(now.getTime() - daysBack * 86400000).toISOString().split('T')[0];

  const filteredIssues = store.issued_books
    .filter((i) => i.issue_date >= cutoff)
    .map((i) => ({
      ...i,
      book: store.books.find((b) => b.id === i.book_id),
      member: store.members.find((m) => m.id === i.member_id),
    }));

  const filteredReturns = store.returned_books
    .filter((r) => r.return_date >= cutoff)
    .map((r) => {
      const issue = store.issued_books.find((i) => i.id === r.issue_id);
      return {
        ...r,
        book: issue ? store.books.find((b) => b.id === issue.book_id) : undefined,
        member: issue ? store.members.find((m) => m.id === issue.member_id) : undefined,
      };
    });

  const filteredOverdue = store.issued_books
    .filter((i) => (i.status === 'overdue' || (i.status === 'issued' && i.due_date < now.toISOString().split('T')[0])))
    .map((i) => ({
      ...i,
      book: store.books.find((b) => b.id === i.book_id),
      member: store.members.find((m) => m.id === i.member_id),
      ...calculateIssueFine(i),
    }));

  const filteredFines = store.fines
    .filter((f) => f.created_at.split('T')[0] >= cutoff)
    .map((f) => ({
      ...f,
      member: store.members.find((m) => m.id === f.member_id),
    }));

  const totalCollected = filteredFines
    .filter((f) => f.payment_status === 'paid')
    .reduce((acc, f) => acc + (Number(f.amount) || 0), 0);

  const totalPending = filteredFines
    .filter((f) => f.payment_status === 'pending')
    .reduce((acc, f) => acc + (Number(f.amount) || 0), 0);

  res.json({
    timeframe: timeframe || 'all',
    type: type || 'overview',
    stats: {
      totalIssued: filteredIssues.length,
      totalReturned: filteredReturns.length,
      totalOverdue: filteredOverdue.length,
      finesCollected: totalCollected,
      finesPending: totalPending,
    },
    issuedBooks: filteredIssues,
    returnedBooks: filteredReturns,
    overdueBooks: filteredOverdue,
    fines: filteredFines,
  });
});

// ==========================================
// 9. ACTIVITY LOGS
// ==========================================

router.get('/activity-logs', (req: Request, res: Response) => {
  res.json(store.activity_logs);
});

export default router;
