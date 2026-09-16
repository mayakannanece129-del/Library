import React, { useState } from 'react';
import { Database, Code, Check, Copy, ExternalLink, ShieldCheck, Server, Key, Terminal } from 'lucide-react';

export const SupabaseDocsView: React.FC<{ isUsingSupabase: boolean }> = ({ isUsingSupabase }) => {
  const [copied, setCopied] = useState(false);

  const envSample = `# Environment Variables (.env)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=optional_admin_key
PORT=3000`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="supabase-docs-view" className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Database className="w-6 h-6 text-emerald-500" />
          Supabase Database & API Architecture
        </h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Complete database specifications, PostgreSQL schema tables, REST API contracts, and connecting instructions.
        </p>
      </div>

      {/* Integration Status Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isUsingSupabase ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isUsingSupabase ? 'Connected to Live Supabase Cloud Database' : 'Running on High-Performance Supabase Schema Store'}
              </h3>
              <p className="text-xs text-slate-500">
                {isUsingSupabase
                  ? 'All CRUD operations synchronize directly with your remote PostgreSQL instance.'
                  : 'All endpoints run with the full PostgreSQL/Supabase schema with pre-seeded books, members, issues, and fine ledgers.'}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isUsingSupabase ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
            }`}
          >
            {isUsingSupabase ? 'SUPABASE CLOUD ACTIVE' : 'SCHEMA COMPATIBLE'}
          </span>
        </div>

        {/* How to connect to Supabase instructions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            How to Connect Your Own Supabase Project:
          </h4>
          <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-decimal list-inside">
            <li>
              Log in to your dashboard at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline">supabase.com</a> and create a new project.
            </li>
            <li>
              Open the <strong>SQL Editor</strong> in Supabase and paste the contents of <code>supabase_schema.sql</code> (provided in this project root). Run the query to create all tables, indexes, and triggers.
            </li>
            <li>
              Copy your <strong>Project URL</strong> and <strong>anon public API key</strong> from <code>Project Settings &gt; API</code>.
            </li>
            <li>
              Add them to your environment variables or <code>.env</code> file:
            </li>
          </ol>

          <div className="relative rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto">
            <button
              onClick={handleCopyEnv}
              className="absolute right-3 top-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <pre>{envSample}</pre>
          </div>
        </div>
      </div>

      {/* Database Schema Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            table: 'books',
            desc: 'Catalog titles, authors, ISBN, category, total & available inventory quantities, and shelf locations.',
            cols: ['id (UUID)', 'title (TEXT)', 'author (TEXT)', 'isbn (TEXT UNIQUE)', 'category (TEXT)', 'quantity (INT)', 'available_quantity (INT)', 'shelf_location (TEXT)'],
          },
          {
            table: 'members',
            desc: 'Student and faculty membership directory, institutional IDs, contact cards, and card status.',
            cols: ['id (UUID)', 'member_name (TEXT)', 'department (TEXT)', 'phone (TEXT)', 'email (TEXT)', 'member_code (TEXT UNIQUE)', 'status (TEXT)'],
          },
          {
            table: 'issued_books',
            desc: 'Active book circulation records, checkout dates, scheduled return due dates, and notes.',
            cols: ['id (UUID)', 'book_id (UUID FK)', 'member_id (UUID FK)', 'issue_date (DATE)', 'due_date (DATE)', 'status (issued | returned | overdue)'],
          },
          {
            table: 'returned_books',
            desc: 'Historical return logs, actual return dates, receiving librarian, and assessed fines.',
            cols: ['id (UUID)', 'issue_id (UUID FK)', 'book_id (UUID FK)', 'member_id (UUID FK)', 'return_date (DATE)', 'fine_amount (NUMERIC)', 'received_by (TEXT)'],
          },
          {
            table: 'fines',
            desc: 'Financial ledger for overdue circulation fines, receipts, and payment statuses.',
            cols: ['id (UUID)', 'issue_id (UUID FK)', 'member_id (UUID FK)', 'amount (NUMERIC)', 'payment_status (pending | paid | waived)', 'created_at (TIMESTAMP)'],
          },
          {
            table: 'activity_logs',
            desc: 'Institutional audit log tracking all actions taken across books, issues, members, and fines.',
            cols: ['id (UUID)', 'action (TEXT)', 'entity_type (TEXT)', 'details (TEXT)', 'user_name (TEXT)', 'created_at (TIMESTAMP)'],
          },
        ].map((item) => (
          <div
            key={item.table}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
                  <Database className="w-3.5 h-3.5" />
                </span>
                <h4 className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  public.{item.table}
                </h4>
              </div>
              <p className="text-xs text-slate-500 mb-3">{item.desc}</p>
              <div className="space-y-1">
                {item.cols.map((c) => (
                  <span
                    key={c}
                    className="block font-mono text-[10px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded"
                  >
                    • {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
