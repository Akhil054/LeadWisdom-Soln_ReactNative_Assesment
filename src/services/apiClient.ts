import { AxiosError, create, isAxiosError } from 'axios';
import { ApiError } from '../types';
import { API_BASE_URL, REQUEST_TIMEOUT_MS, USE_MOCK_API } from './config';
import { mockAdapter } from './mock/mockServer';

/** Shared Axios instance used by every service module. */
export const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
  ...(USE_MOCK_API ? { adapter: mockAdapter } : {}),
});

// --- auth token handling ------------------------------------------------

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

apiClient.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(toApiError(error)),
);

// --- error normalisation --------------------------------------------------

/** Converts any thrown value into a predictable { message, status } shape. */
export const toApiError = (error: unknown): ApiError => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return { message: data.message, status: error.response?.status };
    if (error.code === 'ECONNABORTED') return { message: 'Request timed out. Please try again.' };
    if (!error.response) return { message: 'No internet connection. Check your network and retry.' };
    return { message: `Request failed (${error.response.status}).`, status: error.response.status };
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return error as ApiError;
  }
  return { message: 'Something went wrong. Please try again.' };
};
