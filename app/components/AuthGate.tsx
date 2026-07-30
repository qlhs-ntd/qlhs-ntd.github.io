"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AUTH_ROUTE, hasActiveSession } from "../lib/auth";

export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === AUTH_ROUTE || pathname.endsWith(`${AUTH_ROUTE}/`);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isAuthPage) return;

    const frame = window.requestAnimationFrame(() => {
      if (hasActiveSession()) {
        setIsAuthorized(true);
        return;
      }

      router.replace(AUTH_ROUTE);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isAuthPage, router]);

  if (isAuthPage || isAuthorized) return <>{children}</>;

  return <main className="auth-gate-loading" aria-live="polite">Đang kiểm tra phiên đăng nhập…</main>;
}
