import React, { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Phone,
  Building,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit2,
  Trash2,
  BookOpen,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Eye,
  X,
  CreditCard,
} from 'lucide-react';
import { Member, User } from '../types';
import { api } from '../services/api';

interface MembersViewProps {
  members: Member[];
  currentUser: User;
  onAddMember: (member: Partial<Member>) => Promise<void>;
  onEditMember: (id: string, member: Partial<Member>) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
  onIssueToMember: (member: Member) => void;
  onNavigateToReturns: () => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  currentUser,
  onAddMember,
  onEditMember,
  onDeleteMember,
  onIssueToMember,
  onNavigateToReturns,
}) => {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    member_name: '',
    department: 'Computer Science',
    phone: '',
    email: '',
    member_code: '',
    status: 'active' as const,
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detailed Member View Modal State
  const [selectedMemberDetails, setSelectedMemberDetails] = useState<{
    member: Member;
    activeIssues: any[];
    history: any[];
    fines: any[];
  } | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const departments = [
    'All',
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Business Administration',
    'Medical Sciences',
    'Physics',
    'Arts & Humanities',
  ];

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.member_name.toLowerCase().includes(search.toLowerCase()) ||
      m.member_code.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search);

    const matchesDept = deptFilter === 'All' || m.department.toLowerCase() === deptFilter.toLowerCase();
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleGenerateCode = async (dept: string) => {
    try {
      const { member_code } = await api.generateMemberId(dept);
      setFormData((prev) => ({ ...prev, member_code }));
    } catch {
      const fallback = `MEM-${dept.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      setFormData((prev) => ({ ...prev, member_code: fallback }));
    }
  };

  const handleOpenAdd = () => {
    setEditingMember(null);
    const initialDept = 'Computer Science';
    setFormData({
      member_name: '',
      department: initialDept,
      phone: '+1 (555) ',
      email: '',
      member_code: `STU-CS-${new Date().getFullYear()}-${String(members.length + 1).padStart(3, '0')}`,
      status: 'active',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setFormData({
      member_name: m.member_name,
      department: m.department,
      phone: m.phone,
      email: m.email,
      member_code: m.member_code,
      status: m.status,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleViewDetails = async (m: Member) => {
    setIsLoadingDetails(true);
    try {
      const details = await api.getMember(m.id);
      setSelectedMemberDetails(details);
    } catch (err: any) {
      alert(err.message || 'Failed to load member records');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.member_name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setFormError('Member Name, Email, and Phone number are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingMember) {
        await onEditMember(editingMember.id, formData);
      } else {
        await onAddMember(formData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (m: Member) => {
    if (m.active_issues_count && m.active_issues_count > 0) {
      alert(`Cannot delete ${m.member_name}: Member has ${m.active_issues_count} unreturned book(s). All checked-out books must be returned first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to remove member "${m.member_name}" (${m.member_code}) from the library directory?`)) {
      try {
        await onDeleteMember(m.id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete member');
      }
    }
  };

  return (
    <div id="members-view" className="space-y-6">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Member & Student Management
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Institutional directory, student card generation, borrowing accounts, and fine ledgers.
          </p>
        </div>

        {currentUser.role !== 'student' && (
          <button
            id="register-member-btn"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            Register New Member
          </button>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Bar */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="member-search-input"
              type="text"
              placeholder="Search by student name, member ID code, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Department Filter */}
          <div className="md:col-span-3">
            <select
              id="member-dept-filter"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 transition-colors"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              id="member-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 transition-colors"
            >
              <option value="All">All Membership Status</option>
              <option value="active">Active Members</option>
              <option value="suspended">Suspended</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span>
            Displaying <strong className="text-slate-800 dark:text-slate-200">{filteredMembers.length}</strong> of {members.length} members
          </span>
          {(search || deptFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setDeptFilter('All');
                setStatusFilter('All');
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Members Table */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Member ID & Name</th>
                <th className="py-3.5 px-4 font-semibold">Department</th>
                <th className="py-3.5 px-4 font-semibold">Contact Info</th>
                <th className="py-3.5 px-4 font-semibold">Joined Date</th>
                <th className="py-3.5 px-4 font-semibold text-center">Circulation</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                    No members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const hasIssues = (m.active_issues_count || 0) > 0;
                  const hasFines = (m.total_fine_due || 0) > 0;
                  return (
                    <tr
                      key={m.id}
                      id={`member-row-${m.id}`}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {m.member_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                              {m.member_name}
                            </p>
                            <span className="font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                              {m.member_code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {m.department}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-xs space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{m.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{m.phone}</span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {m.membership_date}
                      </td>

                      {/* Circulation Summary (Active Checkouts & Fines) */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                              hasIssues
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                            }`}
                            title="Active Borrowed Books"
                          >
                            {m.active_issues_count || 0} books
                          </span>
                          {hasFines && (
                            <span
                              className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
                              title="Pending Late Fines Due"
                            >
                              ${Number(m.total_fine_due).toFixed(2)} due
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            m.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : m.status === 'suspended'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {m.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Full History */}
                          <button
                            id={`member-view-${m.id}`}
                            onClick={() => handleViewDetails(m)}
                            title="View Member Borrowing History & Fines"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Quick Issue to Member */}
                          {currentUser.role !== 'student' && m.status === 'active' && (
                            <button
                              id={`member-issue-${m.id}`}
                              onClick={() => onIssueToMember(m)}
                              title="Issue a book to this member"
                              className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                            >
                              <BookOpen className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit Member */}
                          {currentUser.role !== 'student' && (
                            <button
                              id={`member-edit-${m.id}`}
                              onClick={() => handleOpenEdit(m)}
                              title="Edit Member Information"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Member (Admin only) */}
                          {currentUser.role === 'admin' && (
                            <button
                              id={`member-delete-${m.id}`}
                              onClick={() => handleDelete(m)}
                              title="Delete Member Account"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div
          id="member-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingMember ? 'Edit Member Information' : 'Register New Member / Student'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200 border border-rose-200 dark:border-rose-900">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  id="member-name-field"
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={formData.member_name}
                  onChange={(e) => setFormData({ ...formData, member_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department *
                  </label>
                  <select
                    id="member-dept-field"
                    value={formData.department}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      setFormData({ ...formData, department: newDept });
                      if (!editingMember) {
                        handleGenerateCode(newDept);
                      }
                    }}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    {departments.filter((d) => d !== 'All').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Member ID Code
                    </label>
                    <button
                      type="button"
                      onClick={() => handleGenerateCode(formData.department)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> Auto-Gen
                    </button>
                  </div>
                  <input
                    id="member-code-field"
                    type="text"
                    required
                    value={formData.member_code}
                    onChange={(e) => setFormData({ ...formData, member_code: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Email *
                  </label>
                  <input
                    id="member-email-field"
                    type="email"
                    required
                    placeholder="student@library.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    id="member-phone-field"
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Card Status
                </label>
                <select
                  id="member-status-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="active">Active (Full Borrowing Rights)</option>
                  <option value="suspended">Suspended (Borrowing Blocked)</option>
                  <option value="expired">Expired (Card Inactive)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="save-member-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? 'Registering...' : editingMember ? 'Update Record' : 'Register Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Details & Borrowing History Modal */}
      {selectedMemberDetails && (
        <div
          id="member-details-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                  {selectedMemberDetails.member.member_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedMemberDetails.member.member_name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedMemberDetails.member.member_code} • {selectedMemberDetails.member.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMemberDetails(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Member Contact Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Email</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                    {selectedMemberDetails.member.email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Phone</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedMemberDetails.member.phone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Membership</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedMemberDetails.member.membership_date}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedMemberDetails.member.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Active Issued Books Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    Currently Borrowed Books ({selectedMemberDetails.activeIssues.length})
                  </h4>
                  {currentUser.role !== 'student' && selectedMemberDetails.activeIssues.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedMemberDetails(null);
                        onNavigateToReturns();
                      }}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Process Return
                    </button>
                  )}
                </div>

                {selectedMemberDetails.activeIssues.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    No books currently checked out.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedMemberDetails.activeIssues.map((iss) => (
                      <div
                        key={iss.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {iss.book?.title || 'Unknown Title'}
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            Issued: {iss.issue_date} • Due: <strong className={iss.status === 'overdue' ? 'text-rose-600' : ''}>{iss.due_date}</strong>
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              iss.status === 'overdue'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                            }`}
                          >
                            {iss.status === 'overdue' ? `${iss.overdue_days} Days Late` : 'Active'}
                          </span>
                          {iss.calculated_fine > 0 && (
                            <p className="text-rose-600 font-bold text-[11px] mt-0.5">
                              Fine: ${iss.calculated_fine.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fines Statement */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                  Fines Ledger
                </h4>
                {selectedMemberDetails.fines.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    Clear fine history. No penalty records on file.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedMemberDetails.fines.map((f) => (
                      <div
                        key={f.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            Late Return Penalty (${Number(f.amount).toFixed(2)})
                          </p>
                          <p className="text-slate-500 text-[11px]">Assessed: {f.created_at.split('T')[0]}</p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            f.payment_status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : f.payment_status === 'waived'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {f.payment_status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex justify-end">
              <button
                onClick={() => setSelectedMemberDetails(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
