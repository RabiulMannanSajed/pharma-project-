import { createContext, useCallback, useEffect, useState } from 'react';
import { login as loginApi, me as meApi } from '../api/auth';

export const AuthContext = createContext(null);

const STORAGE_TOKEN = 'psm_token';
const STORAGE_USER = 'psm_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN) || null);
  const [loading, setLoading] = useState(true);
  const [bootstrapping, setBootstrapping] = useState(true);

  // On mount, if we have a token, validate it via /auth/me
  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      if (!token) {
        setBootstrapping(false);
        setLoading(false);
        return;
      }
      try {
        const u = await meApi();
        if (cancelled) return;
        setUser(u);
        localStorage.setItem(STORAGE_USER, JSON.stringify(u));
      } catch {
        if (cancelled) return;
        localStorage.removeItem(STORAGE_TOKEN);
        localStorage.removeItem(STORAGE_USER);
        setToken(null);
        setUser(null);
      } finally {
        if (!cancelled) {
          setBootstrapping(false);
          setLoading(false);
        }
      }
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const payload = await loginApi(credentials);
      const u = payload.user;
      const t = payload.token;
      localStorage.setItem(STORAGE_TOKEN, t);
      localStorage.setItem(STORAGE_USER, JSON.stringify(u));
      setUser(u);
      setToken(t);
      return u;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...updates };
      localStorage.setItem(STORAGE_USER, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = {
    user,
    token,
    loading,
    bootstrapping,
    isAuthenticated: !!token && !!user,
    role: user?.role || null,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
