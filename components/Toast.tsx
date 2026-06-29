"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; message: string; kind: ToastKind };

type ToastContextValue = {
  toast: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx.toast;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((tt) => tt.id !== id));
    }, 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((tt) => (
          <div
            key={tt.id}
            role="status"
            className={[
              "pointer-events-auto w-full max-w-sm rounded-[12px] border px-4 py-3 text-sm font-medium shadow-card",
              tt.kind === "success"
                ? "border-teal bg-teal-tint text-teal-dk"
                : tt.kind === "error"
                  ? "border-danger bg-danger-tint text-danger"
                  : "border-border bg-card text-ink",
            ].join(" ")}
          >
            {tt.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
