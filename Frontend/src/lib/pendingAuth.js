const KEY = 'organic2home_pending_auth';

export function savePendingAuth(data) {
  sessionStorage.setItem(KEY, JSON.stringify(data));
}

export function readPendingAuth() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    sessionStorage.removeItem(KEY);
    return null;
  }
}

export function clearPendingAuth() {
  sessionStorage.removeItem(KEY);
}
