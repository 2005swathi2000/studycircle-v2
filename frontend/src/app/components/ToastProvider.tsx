'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  actionLabel?: string;
  actionCallback?: () => void;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, actionLabel?: string, actionCallback?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const activeMessagesRef = useRef<Set<string>>(new Set());
  const router = useRouter();

  const showToast = useCallback((message: string, type: ToastType = 'info', actionLabel?: string, actionCallback?: () => void) => {
    // Intercept and prevent noisy/navigation/view toasts
    const lowerMsg = message.toLowerCase();
    const isForbidden = [
      /switching to/i,
      /loading /i,
      /viewing /i,
      /opening /i,
      /closing /i,
      /navigating /i,
      /selected /i,
      /details fetched/i,
      /details loaded/i,
      /refreshing /i,
      /profile opened/i,
      /tab activated/i,
      /showing /i,
      /expanded /i,
      /collapsed /i,
      /fetching /i,
      /clicked /i,
      /shortcut /i,
      /welcome /i,
      /entered /i,
      /entering /i,
      /page loaded/i,
      /analytics /i,
      /stats /i,
      /downloading dbms /i,
      /downloading syllabus /i,
      /note selected/i,
      /checking database/i,
      /checking server/i,
      /getting details/i,
      /retrieved /i,
      /retrieving /i,
      /loaded /i,
      /fetched /i,
      /checked /i,
      /inspecting /i,
    ].some(regex => regex.test(lowerMsg));

    if (isForbidden && type !== 'error' && type !== 'warning') {
      return; // Do not show noisy info/success toasts
    }

    // Prevent duplicate toasts
    if (activeMessagesRef.current.has(message)) {
      return;
    }

    const id = Math.random().toString(36).substring(2, 9);
    activeMessagesRef.current.add(message);
    setToasts((prev) => [...prev, { id, message, type, actionLabel, actionCallback }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      activeMessagesRef.current.delete(message);
    }, 5000); // Increased duration to 5 seconds to let users read and click "View"
  }, []);

  // Listen to global events for toast creation and session expiry
  useEffect(() => {
    const handleShowToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        showToast(customEvent.detail.message, customEvent.detail.type);
      }
    };

    const handleSessionExpired = () => {
      showToast('⚠️ Your session has expired. Please login again.', 'warning');
      router.replace('/?login=true');
    };

    window.addEventListener('show_toast', handleShowToast);
    window.addEventListener('auth_session_expired', handleSessionExpired);

    return () => {
      window.removeEventListener('show_toast', handleShowToast);
      window.removeEventListener('auth_session_expired', handleSessionExpired);
    };
  }, [showToast, router]);

  const removeToast = (id: string) => {
    setToasts((prev) => {
      const toastToRemove = prev.find((t) => t.id === id);
      if (toastToRemove) {
        activeMessagesRef.current.delete(toastToRemove.message);
      }
      return prev.filter((t) => t.id !== id);
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          let bgClass = 'bg-[#0E0F15]/95 border-zinc-800 text-zinc-100';
          let icon = <Info className="h-4 w-4 text-indigo-400 shrink-0" />;
          
          if (t.type === 'success') {
            bgClass = 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200';
            icon = <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
          } else if (t.type === 'error') {
            bgClass = 'bg-red-950/90 border-red-500/30 text-red-200';
            icon = <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />;
          } else if (t.type === 'warning') {
            bgClass = 'bg-amber-950/90 border-amber-500/30 text-amber-200';
            icon = <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center justify-between gap-3 text-xs font-semibold pointer-events-auto transition-all duration-300 transform translate-y-0 scale-100 ${bgClass}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {icon}
                <div className="leading-relaxed truncate">{t.message}</div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                {t.actionLabel && t.actionCallback && (
                  <button
                    onClick={() => {
                      t.actionCallback?.();
                      removeToast(t.id);
                    }}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border-none text-[10px] font-black text-white uppercase rounded-lg cursor-pointer transition-all"
                  >
                    {t.actionLabel}
                  </button>
                )}
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-zinc-500 hover:text-zinc-350 transition-colors shrink-0 border-none bg-transparent cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};