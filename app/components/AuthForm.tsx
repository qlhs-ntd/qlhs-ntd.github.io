"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { createSession, currentPasscode } from "../lib/auth";
import styles from "./AuthForm.module.scss";

const OTP_LENGTH = 4;
const publicBasePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

export function AuthForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isAuthenticatingRef = useRef(false);
  const authenticationTimerRef = useRef<number | null>(null);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;
    if (isTouchDevice) return;

    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => () => {
    if (authenticationTimerRef.current !== null) {
      window.clearTimeout(authenticationTimerRef.current);
    }
  }, []);

  const authenticate = (passcode: string) => {
    if (isAuthenticatingRef.current) return;

    isAuthenticatingRef.current = true;
    setIsSubmitting(true);
    authenticationTimerRef.current = window.setTimeout(() => {
      if (passcode === currentPasscode()) {
        createSession();
        router.replace("/");
        return;
      }

      setPasscode("");
      setError("Mã không đúng. Vui lòng thử lại.");
      setIsSubmitting(false);
      isAuthenticatingRef.current = false;
      requestAnimationFrame(() => inputRef.current?.focus());
    }, 1500);
  };

  const submit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (passcode.length !== OTP_LENGTH) {
      setError("Nhập đủ 4 số để đăng nhập.");
      inputRef.current?.focus();
      return;
    }

    authenticate(passcode);
  };

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={submit}>
        <img className={styles.logo} src={`${publicBasePath}/logo.png`} alt="QLHS" />
        <h1>Đăng Nhập Dũng - QLHS</h1>
        <p className={styles.description}>Nhập mã bảo mật để tiếp tục</p>

        <div className={styles.otp}>
          <input
            ref={inputRef}
            aria-label="Mã đăng nhập gồm 4 số"
            autoComplete="one-time-code"
            disabled={isSubmitting}
            inputMode="numeric"
            maxLength={OTP_LENGTH}
            onChange={(event) => {
              setError("");
              setPasscode(event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH));
            }}
            onFocus={(event) => event.currentTarget.select()}
            pattern="[0-9]*"
            type="password"
            value={passcode}
          />
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <><LoaderCircle className={styles.spinner} size={18} /> Đang xử lý…</> : "Đăng Nhập"}
        </button>
      </form>
    </main>
  );
}
