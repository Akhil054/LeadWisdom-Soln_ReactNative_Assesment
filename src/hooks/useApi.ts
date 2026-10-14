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
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
  { immediate = true, pollInterval }: UseApiOptions = {},
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mounted = useRef(true);
  const requestId = useRef(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableFetcher = useCallback(fetcher, deps);

  const run = useCallback(
    async (mode: 'load' | 'refresh' | 'silent') => {
      const id = ++requestId.current;
      if (mode === 'load') setLoading(true);
      if (mode === 'refresh') setRefreshing(true);
      try {
        const result = await stableFetcher();
        if (!mounted.current || id !== requestId.current) return;
        setData(result);
        setError(null);
      } catch (e) {
        if (!mounted.current || id !== requestId.current) return;
        // Background polls keep showing the last good data instead of an error screen.
        if (mode !== 'silent') setError(toApiError(e));
      } finally {
        if (mounted.current && id === requestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [stableFetcher],
  );

  useEffect(() => {
    mounted.current = true;
    if (immediate) run('load');
    return () => {
      mounted.current = false;
    };
  }, [run, immediate]);

  useEffect(() => {
    if (!pollInterval) return;
    const timer = setInterval(() => run('silent'), pollInterval);
    return () => clearInterval(timer);
  }, [run, pollInterval]);

  return {
    data,
    loading,
    refreshing,
    error,
    refetch: useCallback(() => run('load'), [run]),
    refresh: useCallback(() => run('refresh'), [run]),
    silentRefetch: useCallback(() => run('silent'), [run]),
  };
}
