export const MOGZU_ADMIN_SESSION_KEY = 'mogzuAdminSession';

export interface AdminSessionPayload {
  email: string;
  at: number;
}

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function getAdminSession(): AdminSessionPayload | null {
  try {
    const raw = localStorage.getItem(MOGZU_ADMIN_SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as AdminSessionPayload;
    if (!p || typeof p.email !== 'string' || typeof p.at !== 'number') {
      localStorage.removeItem(MOGZU_ADMIN_SESSION_KEY);
      return null;
    }
    if (Date.now() - p.at > MAX_AGE_MS) {
      localStorage.removeItem(MOGZU_ADMIN_SESSION_KEY);
      return null;
    }
    return p;
  } catch {
    localStorage.removeItem(MOGZU_ADMIN_SESSION_KEY);
    return null;
  }
}

export function setAdminSession(email: string) {
  localStorage.setItem(MOGZU_ADMIN_SESSION_KEY, JSON.stringify({ email, at: Date.now() }));
}

export function clearAdminSession() {
  localStorage.removeItem(MOGZU_ADMIN_SESSION_KEY);
}
