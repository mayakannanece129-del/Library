import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface SingleToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<SingleToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getThemeClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100';
      case 'error':
        return 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100';
      case 'warning':
        return 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100';
      default:
        return 'bg-slate-900/95 dark:bg-slate-800/95 border-slate-700 text-white';
    }
  };

  return (
    <div
      id="toast-notification"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div
        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md ${getThemeClasses()}`}
      >
        {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
        {type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />}
        {type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />}
        {type === 'info' && <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold leading-relaxed">{message}</p>
        </div>

        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 transition-opacity p-0.5"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; onDismiss: (id: string) => void }> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div id="toast-container" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300"
        >
          <div className="flex-1 min-w-0">
            {toast.title && <h4 className="text-sm font-semibold leading-tight">{toast.title}</h4>}
            <p className="text-xs mt-1 opacity-90 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
