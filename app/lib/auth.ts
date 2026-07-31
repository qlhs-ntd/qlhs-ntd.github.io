export const AUTH_ROUTE = "/auth";

const SESSION_KEY = "qlhs-auth-expires-at";
const SESSION_STARTED_AT_KEY = "qlhs-auth-started-at";
const SESSION_DEVICE_NAME_KEY = "qlhs-auth-device-name";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
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

function currentDeviceName(): string {
  if (typeof window === "undefined") return "Thiết bị không xác định";

  const userAgent = window.navigator.userAgent;
  const device = /iPad/i.test(userAgent)
    ? "iPad"
    : /iPhone/i.test(userAgent)
      ? "iPhone"
      : /Android/i.test(userAgent)
        ? /Mobile/i.test(userAgent) ? "Điện thoại Android" : "Máy tính bảng Android"
        : /Macintosh/i.test(userAgent)
          ? "Máy tính Mac"
          : /Windows/i.test(userAgent)
            ? "Máy tính Windows"
            : /Linux/i.test(userAgent)
              ? "Máy tính Linux"
              : "Thiết bị không xác định";
  const browser = /Edg\//i.test(userAgent)
    ? "Edge"
    : /OPR\//i.test(userAgent)
      ? "Opera"
      : /Chrome\//i.test(userAgent)
        ? "Chrome"
        : /Firefox\//i.test(userAgent)
          ? "Firefox"
          : /Safari\//i.test(userAgent)
            ? "Safari"
            : "Trình duyệt";

  return `${device} • ${browser}`;
}

export function hasActiveSession(now = Date.now()): boolean {
  if (typeof window === "undefined") return false;

  const expiresAt = Number(window.localStorage.getItem(SESSION_KEY));
  if (Number.isFinite(expiresAt) && expiresAt > now) return true;

  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(SESSION_STARTED_AT_KEY);
  window.localStorage.removeItem(SESSION_DEVICE_NAME_KEY);
  return false;
}

export function getSessionStartedAt(now = Date.now()): number | null {
  if (typeof window === "undefined") return null;

  const startedAt = Number(window.localStorage.getItem(SESSION_STARTED_AT_KEY));
  if (Number.isFinite(startedAt) && startedAt > 0) return startedAt;

  const expiresAt = Number(window.localStorage.getItem(SESSION_KEY));
  return Number.isFinite(expiresAt) && expiresAt > now ? expiresAt - SESSION_DURATION_MS : null;
}

export function getSessionDeviceName(): string {
  if (typeof window === "undefined") return "Thiết bị không xác định";
  return window.localStorage.getItem(SESSION_DEVICE_NAME_KEY) || currentDeviceName();
}

export function createSession(now = Date.now()): void {
  window.localStorage.setItem(SESSION_KEY, String(now + SESSION_DURATION_MS));
  window.localStorage.setItem(SESSION_STARTED_AT_KEY, String(now));
  window.localStorage.setItem(SESSION_DEVICE_NAME_KEY, currentDeviceName());
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(SESSION_STARTED_AT_KEY);
  window.localStorage.removeItem(SESSION_DEVICE_NAME_KEY);
}
