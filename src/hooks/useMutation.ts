import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../types';
import { toApiError } from '../services/apiClient';

/**
 * Wraps a write operation (POST/PUT/DELETE) with loading + error state.
 * `mutate` resolves to the result, or `null` if the request failed
 * (the error is exposed via `error`).
 */
export function useMutation<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const mutate = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setLoading(true);
      setError(null);
      try {
        return await fn(...args);
      } catch (e) {
        if (mounted.current) setError(toApiError(e));
        return null;
      } finally {
        if (mounted.current) setLoading(false);
      }
    },
    [fn],
  );

  const reset = useCallback(() => setError(null), []);

  return { mutate, loading, error, reset };
}
