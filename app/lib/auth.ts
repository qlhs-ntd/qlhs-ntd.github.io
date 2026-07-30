export const AUTH_ROUTE = "/auth";

const SESSION_KEY = "qlhs-auth-expires-at";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

export function currentPasscode(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: VIETNAM_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const valueFor = (type: "hour" | "minute") => parts.find((part) => part.type === type)?.value ?? "00";

  const nextMinute = (Number(valueFor("minute")) + 1) % 60;
  return `${String(nextMinute).padStart(2, "0")}${valueFor("hour")}`;
}

export function hasActiveSession(now = Date.now()): boolean {
  if (typeof window === "undefined") return false;

  const expiresAt = Number(window.localStorage.getItem(SESSION_KEY));
  if (Number.isFinite(expiresAt) && expiresAt > now) return true;

  window.localStorage.removeItem(SESSION_KEY);
  return false;
}

export function createSession(now = Date.now()): void {
  window.localStorage.setItem(SESSION_KEY, String(now + SESSION_DURATION_MS));
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
}
