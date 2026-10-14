import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useApi } from '../useApi';

/** A promise you resolve/reject by hand, to control response ordering. */
const deferred = <T,>() => {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

it('loads data and clears the loading flag', async () => {
  const response = deferred<string[]>();
  const fetcher = () => response.promise;
  const { result } = await renderHook(() => useApi(fetcher));

  expect(result.current.loading).toBe(true);
  await act(async () => response.resolve(['a']));
  expect(result.current.loading).toBe(false);
  expect(result.current.data).toEqual(['a']);
  expect(result.current.error).toBeNull();
});

it('exposes a normalised error when the request fails', async () => {
  const fetcher = jest.fn().mockRejectedValue({ message: 'Boom', status: 500 });
  const { result } = await renderHook(() => useApi(fetcher));

  await waitFor(() => expect(result.current.error).toEqual({ message: 'Boom', status: 500 }));
  expect(result.current.loading).toBe(false);
});

it('ignores a stale response that arrives after a newer one', async () => {
  const slow = deferred<string>();
  const fast = deferred<string>();
  const slowFetcher = () => slow.promise;
  const fastFetcher = () => fast.promise;

  // Simulates changing filters: the fetcher identity changes mid-flight.
  const { result, rerender } = await renderHook(({ f }: { f: () => Promise<string> }) => useApi(f), {
    initialProps: { f: slowFetcher },
  });
  await rerender({ f: fastFetcher });

  await act(async () => fast.resolve('new filter result'));
  await act(async () => slow.resolve('old filter result'));

  expect(result.current.data).toBe('new filter result');
  expect(result.current.loading).toBe(false);
});

it('keeps the last good data when a background (silent) refresh fails', async () => {
  const fetcher = jest.fn().mockResolvedValueOnce('good').mockRejectedValueOnce({ message: 'offline' });
  const { result } = await renderHook(() => useApi(fetcher));
  await waitFor(() => expect(result.current.data).toBe('good'));

  await act(() => result.current.silentRefetch());

  expect(result.current.data).toBe('good');
  expect(result.current.error).toBeNull();
});

it('polls on the given interval', async () => {
  jest.useFakeTimers();
  const fetcher = jest.fn().mockResolvedValue('x');
  await renderHook(() => useApi(fetcher, { pollInterval: 1000 }));

  expect(fetcher).toHaveBeenCalledTimes(1);
  await act(async () => {
    jest.advanceTimersByTime(3000);
  });
  expect(fetcher).toHaveBeenCalledTimes(4);
  jest.useRealTimers();
});
