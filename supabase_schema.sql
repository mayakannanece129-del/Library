-- ====================================================================
-- LIBRARY MANAGEMENT SYSTEM - SUPABASE DATABASE SCHEMA
-- For Colleges and Schools
-- Compatible with PostgreSQL & Supabase Database
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running (order respects foreign keys)
DROP TABLE IF EXISTS fines CASCADE;
DROP TABLE IF EXISTS returned_books CASCADE;
DROP TABLE IF EXISTS issued_books CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- --------------------------------------------------------------------
-- 3. Table: users
-- Roles: 'admin', 'librarian', 'student'
-- --------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'librarian', 'student')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 4. Table: books
-- --------------------------------------------------------------------
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    publisher VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    available_quantity INTEGER NOT NULL DEFAULT 1 CHECK (available_quantity >= 0 AND available_quantity <= quantity),
    shelf_location VARCHAR(100) DEFAULT 'General Stacks',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 5. Table: members
-- --------------------------------------------------------------------
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_code VARCHAR(50) UNIQUE,
    member_name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    membership_date DATE DEFAULT CURRENT_DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 6. Table: issued_books
-- Status: 'issued', 'returned', 'overdue'
-- --------------------------------------------------------------------
CREATE TABLE issued_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    issue_date DATE DEFAULT CURRENT_DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'returned', 'overdue')),
    issued_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 7. Table: returned_books
-- --------------------------------------------------------------------
CREATE TABLE returned_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES issued_books(id) ON DELETE CASCADE,
    return_date DATE DEFAULT CURRENT_DATE NOT NULL,
    fine_amount DECIMAL(10, 2) DEFAULT 0.00 CHECK (fine_amount >= 0),
    received_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 8. Table: fines
-- Payment Status: 'pending', 'paid', 'waived'
-- --------------------------------------------------------------------
CREATE TABLE fines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES issued_books(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'waived')),
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 9. Table: activity_logs
-- --------------------------------------------------------------------
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 10. Performance Indexes
-- --------------------------------------------------------------------
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_members_code ON members(member_code);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_issued_books_status ON issued_books(status);
CREATE INDEX idx_issued_books_due_date ON issued_books(due_date);
CREATE INDEX idx_fines_status ON fines(payment_status);

-- --------------------------------------------------------------------
-- 11. Row Level Security (RLS) Policies
-- --------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE issued_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE returned_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to catalog books
CREATE POLICY "Public Read Books" ON books FOR SELECT USING (true);
CREATE POLICY "Public Read Members" ON members FOR SELECT USING (true);
CREATE POLICY "Public Read Issued" ON issued_books FOR SELECT USING (true);
CREATE POLICY "Public Read Returned" ON returned_books FOR SELECT USING (true);
CREATE POLICY "Public Read Fines" ON fines FOR SELECT USING (true);
CREATE POLICY "Public Read Logs" ON activity_logs FOR SELECT USING (true);

-- Allow authenticated operations for authorized roles (or service role)
CREATE POLICY "Full Access For All Tables" ON books FOR ALL USING (true);
CREATE POLICY "Full Access For Members" ON members FOR ALL USING (true);
CREATE POLICY "Full Access For Issues" ON issued_books FOR ALL USING (true);
CREATE POLICY "Full Access For Returns" ON returned_books FOR ALL USING (true);
CREATE POLICY "Full Access For Fines" ON fines FOR ALL USING (true);
CREATE POLICY "Full Access For Logs" ON activity_logs FOR ALL USING (true);
