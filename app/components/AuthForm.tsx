"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { createSession, currentPasscode } from "../lib/auth";
import styles from "./AuthForm.module.scss";

const OTP_LENGTH = 4;
const publicBasePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

export function AuthForm() {
  const router = useRouter();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const isAuthenticatingRef = useRef(false);
  const authenticationTimerRef = useRef<number | null>(null);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;
    if (isTouchDevice) return;

    const frame = window.requestAnimationFrame(() => inputRefs.current[0]?.focus());
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

      setDigits(Array(OTP_LENGTH).fill(""));
      setError("Mã không đúng. Vui lòng thử lại.");
      setIsSubmitting(false);
      isAuthenticatingRef.current = false;
      requestAnimationFrame(() => inputRefs.current[0]?.focus());
    }, 1500);
  };

  const setDigitsFrom = (startIndex: number, rawValue: string) => {
    const enteredDigits = rawValue.replace(/\D/g, "").slice(0, OTP_LENGTH - startIndex);
    const nextDigits = [...digits];

    if (!enteredDigits) {
      nextDigits[startIndex] = "";
    } else {
      enteredDigits.split("").forEach((digit, offset) => {
        nextDigits[startIndex + offset] = digit;
      });
    }

    setError("");
    setDigits(nextDigits);

    if (enteredDigits) {
      const focusIndex = Math.min(startIndex + enteredDigits.length, OTP_LENGTH - 1);
      requestAnimationFrame(() => inputRefs.current[focusIndex]?.focus());
    }

  };

  const submit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const passcode = digits.join("");

    if (passcode.length !== OTP_LENGTH) {
      setError("Nhập đủ 4 số để đăng nhập.");
      inputRefs.current.find((input) => !input?.value)?.focus();
      return;
    }

    authenticate(passcode);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const nextDigits = [...digits];
      nextDigits[index - 1] = "";
      setDigits(nextDigits);
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>, index: number) => {
    event.preventDefault();
    setDigitsFrom(index, event.clipboardData.getData("text"));
  };

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={submit}>
        <img className={styles.logo} src={`${publicBasePath}/logo.png`} alt="QLHS" />
        <h1>Đăng Nhập Dũng - QLHS</h1>
        <p className={styles.description}>Nhập mã bảo mật để tiếp tục</p>

        <div className={styles.otp} aria-label="Mã đăng nhập gồm 4 số">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => { inputRefs.current[index] = element; }}
              aria-label={`Số ${index + 1} trong mã đăng nhập`}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              disabled={isSubmitting}
              inputMode="numeric"
              maxLength={1}
              onChange={(event) => setDigitsFrom(index, event.target.value)}
              onFocus={(event) => event.currentTarget.select()}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onPaste={(event) => handlePaste(event, index)}
              pattern="[0-9]*"
              type="text"
              value={digit}
            />
          ))}
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <><LoaderCircle className={styles.spinner} size={18} /> Đang xử lý…</> : "Đăng Nhập"}
        </button>
      </form>
    </main>
  );
}
