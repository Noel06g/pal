"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Cloudflare Turnstile widget. Writes the token into a hidden input named
 * "turnstileToken" so it is submitted with the surrounding form / FormData.
 */
export function Turnstile() {
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetId = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    let cancelled = false;
    loadScript().then(() => {
      if (cancelled || !ref.current || !window.turnstile || !siteKey) return;
      // Avoid double-render in React strict mode.
      if (widgetId.current) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme: "light",
        callback: (token: string) => {
          // Write the token to the hidden input so it submits with the form.
          if (inputRef.current) inputRef.current.value = token;
        },
        "expired-callback": () => {
          if (inputRef.current) inputRef.current.value = "";
        },
        "error-callback": () => {
          if (inputRef.current) inputRef.current.value = "";
        },
      });
    });
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [siteKey]);

  return (
    <div className="my-3">
      <div ref={ref} />
      <input ref={inputRef} type="hidden" name="turnstileToken" defaultValue="" />
      {!siteKey && (
        <p className="hint text-danger">
          Mungon NEXT_PUBLIC_TURNSTILE_SITE_KEY.
        </p>
      )}
    </div>
  );
}
