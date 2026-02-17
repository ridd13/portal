"use client";

import { useEffect, useMemo } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
    [key: string]: unknown;
  }
}

interface TurnstileFieldProps {
  onTokenChange: (token: string | null) => void;
}

export function TurnstileField({ onTokenChange }: TurnstileFieldProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerId = useMemo(
    () => `turnstile-${Math.random().toString(36).slice(2, 10)}`,
    []
  );
  const callbackName = useMemo(
    () => `turnstileCallback_${Math.random().toString(36).slice(2, 10)}`,
    []
  );
  const expiredName = useMemo(
    () => `turnstileExpired_${Math.random().toString(36).slice(2, 10)}`,
    []
  );
  const errorName = useMemo(
    () => `turnstileError_${Math.random().toString(36).slice(2, 10)}`,
    []
  );

  useEffect(() => {
    if (!siteKey) return;

    (window as Window)[callbackName] = (token: string) => onTokenChange(token);
    (window as Window)[expiredName] = () => onTokenChange(null);
    (window as Window)[errorName] = () => onTokenChange(null);

    const renderWidget = () => {
      if (!window.turnstile) return;
      if (document.getElementById(containerId)?.childElementCount) return;

      window.turnstile.render(`#${containerId}`, {
        sitekey: siteKey,
        callback: callbackName,
        "expired-callback": expiredName,
        "error-callback": errorName,
      });
    };

    renderWidget();
    const interval = window.setInterval(renderWidget, 250);

    return () => {
      window.clearInterval(interval);
      delete (window as Window)[callbackName];
      delete (window as Window)[expiredName];
      delete (window as Window)[errorName];
    };
  }, [callbackName, containerId, errorName, expiredName, onTokenChange, siteKey]);

  if (!siteKey) {
    // Auto-pass captcha validation in development if not configured
    useEffect(() => {
      onTokenChange("dev-bypass-token");
    }, [onTokenChange]);

    return null;
  }

  return (
    <div>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div id={containerId} className="min-h-16" />
    </div>
  );
}
