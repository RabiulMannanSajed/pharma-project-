import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

/**
 * Dashboard-wide refresh hook.
 *
 * - click:    refetch every active React Query (soft refresh — instant, keeps UI state)
 * - shift-click / long-press: full hard reload (clears JS state and any cached HTML/JS)
 *
 * Designed to be called from the Topbar Refresh button so it works on every
 * dashboard page (admin & salesman).
 */
export const useRefreshDashboard = () => {
  const qc = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
  const inflightRef = useRef(false);

  // Soft refresh — invalidate every active query so pages refetch in parallel.
  const refresh = useCallback(
    async (event) => {
      if (inflightRef.current) return;
      // Shift-click → hard reload (clear SW caches + JS state).
      if (event?.shiftKey) {
        await hardReload();
        return;
      }
      inflightRef.current = true;
      setIsRefreshing(true);
      try {
        const queries = qc.getQueryCache().getAll();
        await Promise.all(
          queries.map((q) =>
            qc
              .invalidateQueries({ queryKey: q.queryKey, refetchType: 'active' })
              .catch(() => null)
          )
        );
        const now = new Date();
        setLastRefreshedAt(now);
        toast.success('Dashboard refreshed', { duration: 1500, id: 'dashboard-refresh' });
      } catch (e) {
        toast.error('Refresh failed');
      } finally {
        inflightRef.current = false;
        setIsRefreshing(false);
      }
    },
    [qc, hardReload]
  );

  // Hard reload: nuke SW caches then full page reload. Catches the case where
  // a new deployment shipped and the SW is still serving old bundles.
  const hardReload = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      } catch (e) {
        /* ignore */
      }
    }
    if (window.caches?.keys) {
      try {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((k) => window.caches.delete(k)));
      } catch (e) {
        /* ignore */
      }
    }
    window.location.reload();
  }, []);

  // Auto-refresh when the tab becomes visible again (covers the common case
  // of user coming back from another app — same as the stale-after-back issue).
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') {
        // Fire-and-forget; no spinner UX for this implicit refresh.
        qc.invalidateQueries({ refetchType: 'active' }).catch(() => null);
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [qc]);

  return { refresh, hardReload, isRefreshing, lastRefreshedAt };
};
