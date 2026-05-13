import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import { ADMIN_SESSION_STORAGE_KEY } from '../constants';
import type { Session } from '../types/admin.types';

export default function useAdminSession() {
  const [session, setSession] = useState<Session | null>(null);

  const clearSession = useCallback(() => {
    setSession(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restoreStoredSession() {
      if (typeof window === 'undefined') {
        return;
      }

      const rawSession = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
      if (!rawSession) {
        return;
      }

      try {
        const parsed = JSON.parse(rawSession) as Session;
        const refreshExpiry = new Date(parsed.refreshTokenExpiresAt).getTime();
        if (Number.isNaN(refreshExpiry) || refreshExpiry <= Date.now()) {
          window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
          return;
        }

        const accessExpiry = new Date(parsed.accessTokenExpiresAt).getTime();
        const shouldRefreshNow = Number.isNaN(accessExpiry) || accessExpiry <= Date.now() + 60_000;

        if (shouldRefreshNow) {
          const refreshed = await adminApi.refreshToken(parsed.refreshToken);
          if (cancelled) {
            return;
          }

          setSession({
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken,
            accessTokenExpiresAt: refreshed.accessTokenExpiresAt,
            refreshTokenExpiresAt: refreshed.refreshTokenExpiresAt,
          });
          return;
        }

        if (!cancelled) {
          setSession(parsed);
        }
      } catch {
        window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      }
    }

    void restoreStoredSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!session) {
      window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const accessExpiry = new Date(session.accessTokenExpiresAt).getTime();
    if (Number.isNaN(accessExpiry)) {
      return;
    }

    const refreshLeadMs = 60_000;
    const delay = Math.max(accessExpiry - Date.now() - refreshLeadMs, 5_000);
    let cancelled = false;

    const timeout = window.setTimeout(async () => {
      try {
        const refreshed = await adminApi.refreshToken(session.refreshToken);
        if (cancelled) {
          return;
        }

        setSession({
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          accessTokenExpiresAt: refreshed.accessTokenExpiresAt,
          refreshTokenExpiresAt: refreshed.refreshTokenExpiresAt,
        });
      } catch {
        if (!cancelled) {
          clearSession();
        }
      }
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [clearSession, session]);

  return {
    session,
    setSession,
    clearSession,
  };
}
