import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../types';
import { toApiError } from '../services/apiClient';

interface UseApiOptions {
  /** Fetch on mount / when deps change. Default: true */
  immediate?: boolean;
  /** If set, silently re-fetch on this interval (ms) while mounted. */
  pollInterval?: number;
}

export interface UseApiResult<T> {
  data: T | null;
  /** First load (no data yet) — show full-screen loader. */
  loading: boolean;
  /** User-triggered pull-to-refresh. */
  refreshing: boolean;
  error: ApiError | null;
  /** Re-fetch showing the full loader (e.g. "Retry" after an error). */
  refetch: () => Promise<void>;
  /** Re-fetch for pull-to-refresh. */
  refresh: () => Promise<void>;
  /** Re-fetch in the background without touching loading flags. */
  silentRefetch: () => Promise<void>;
}

/**
 * Generic data-fetching hook: manages loading / error / success state and
 * protects against out-of-order responses and updates after unmount.
 *
 * `fetcher` must be referentially stable (a module function or a `useCallback`);
 * a new fetcher identity is what triggers a re-fetch, e.g. when filters change.
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  { immediate = true, pollInterval }: UseApiOptions = {},
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // When the fetcher changes (new filters), flip to loading during render rather
  // than in the effect — avoids an extra cascading render.
  const [prevFetcher, setPrevFetcher] = useState(() => fetcher);
  if (fetcher !== prevFetcher) {
    setPrevFetcher(() => fetcher);
    if (immediate) setLoading(true);
  }

  const mounted = useRef(true);
  const requestId = useRef(0);

  /** Performs the request; callers set the loading/refreshing flag beforehand. */
  const execute = useCallback(
    (mode: 'load' | 'refresh' | 'silent') => {
      const id = ++requestId.current;
      const isCurrent = () => mounted.current && id === requestId.current;
      return fetcher()
        .then(
          (result) => {
            if (!isCurrent()) return;
            setData(result);
            setError(null);
          },
          (e: unknown) => {
            // Background polls keep showing the last good data instead of an error screen.
            if (isCurrent() && mode !== 'silent') setError(toApiError(e));
          },
        )
        .finally(() => {
          if (!isCurrent()) return;
          setLoading(false);
          setRefreshing(false);
        });
    },
    [fetcher],
  );

  useEffect(() => {
    mounted.current = true;
    if (immediate) execute('load');
    return () => {
      mounted.current = false;
    };
  }, [execute, immediate]);

  useEffect(() => {
    if (!pollInterval) return;
    const timer = setInterval(() => execute('silent'), pollInterval);
    return () => clearInterval(timer);
  }, [execute, pollInterval]);

  const refetch = useCallback(() => {
    setLoading(true);
    return execute('load');
  }, [execute]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    return execute('refresh');
  }, [execute]);

  const silentRefetch = useCallback(() => execute('silent'), [execute]);

  return { data, loading, refreshing, error, refetch, refresh, silentRefetch };
}
