import React, { useState } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  Shield,
  UserCheck,
  GraduationCap,
  ArrowRight,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, role?: UserRole) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('admin@library.edu');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  if (!isOpen) return null;

  const handlePresetRole = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmail('admin@library.edu');
      setPassword('admin_pass');
    } else if (role === 'librarian') {
      setEmail('librarian@library.edu');
      setPassword('lib_pass');
    } else {
      setEmail('alex.rivera@student.edu');
      setPassword('stu_pass');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setForgotSuccess('');

    if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorMsg('Please enter your institutional email address.');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setForgotSuccess(
          `Password reset instructions have been dispatched to ${email}. Check your campus inbox.`
        );
      }, 700);
      return;
    }

    // Login mode
    setIsLoading(true);
    try {
      await onLogin(email, selectedRole);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {mode === 'login' ? 'Library Portal Login' : 'Reset Portal Password'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'login' ? 'Institutional Role-Based Access Control' : 'Account recovery'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Role Switcher (One-Click) */}
        {mode === 'login' && (
          <div className="px-6 pt-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Demo Role Preset:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="role-preset-admin"
                onClick={() => handlePresetRole('admin')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedRole === 'admin'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                <span className="text-xs block">Admin</span>
              </button>

              <button
                type="button"
                id="role-preset-librarian"
                onClick={() => handlePresetRole('librarian')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedRole === 'librarian'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <span className="text-xs block">Librarian</span>
              </button>

              <button
                type="button"
                id="role-preset-student"
                onClick={() => handlePresetRole('student')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedRole === 'student'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                <span className="text-xs block">Student</span>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200 border border-rose-200 dark:border-rose-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {forgotSuccess && (
            <div className="p-3 text-xs rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{forgotSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@library.edu"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {mode === 'login' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  id="forgot-password-link"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg('');
                  }}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <span>
              {isLoading
                ? 'Processing...'
                : mode === 'login'
                ? `Sign In as ${selectedRole.toUpperCase()}`
                : 'Send Password Reset Link'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {mode === 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setForgotSuccess('');
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
