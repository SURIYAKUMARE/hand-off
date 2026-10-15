import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, type, message, title };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const toastMethods = {
    success: (message: string, title?: string) => addToast('success', message, title),
    error: (message: string, title?: string) => addToast('error', message, title),
    info: (message: string, title?: string) => addToast('info', message, title),
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods }}>
      {children}
      {/* Floating Notifications Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 p-3.5 bg-surface border border-border rounded-lg shadow-toast transition-all duration-150 animate-in fade-in slide-in-from-bottom-2"
          >
            {t.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-[#027A48] mt-0.5 flex-shrink-0" />
            )}
            {t.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-[#D92D20] mt-0.5 flex-shrink-0" />
            )}
            {t.type === 'info' && (
              <Info className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
            )}

            <div className="flex-1 text-xs">
              {t.title && (
                <div className="font-semibold text-text-primary mb-0.5">{t.title}</div>
              )}
              <div className="text-text-secondary leading-snug">{t.message}</div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-text-muted hover:text-text-primary p-0.5 rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}
