import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getToken, setToken, setUnauthorizedHandler } from '../lib/api.js';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);
const USER_KEY = 'organic2home_user';

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [ready, setReady] = useState(!getToken());
  const persistRef = useRef(null);

  function persist(nextUser, token) {
    setUser(nextUser);
    setToken(token);
    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(USER_KEY);
  }

  persistRef.current = persist;

  useEffect(() => {
    setUnauthorizedHandler(() => persistRef.current?.(null, null));
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function restore() {
      if (!getToken()) {
        setReady(true);
        return;
      }
      try {
        const data = await authService.me();
        if (!cancelled) persist(data.user, getToken());
      } catch {
        if (!cancelled) persist(null, null);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      isCustomer: user?.role === 'CUSTOMER',
      isAdmin: user?.role === 'ADMIN',
      setSession: persist,
      async logout() {
        try {
          if (getToken()) await authService.logout();
        } catch {
          /* client still clears */
        }
        persist(null, null);
      },
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
