import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

/** Standard error thrown for all failed API calls. */
export class ApiError extends Error {
  status: number;
  statusText: string;
  data: unknown;

  constructor(message: string, status: number, statusText: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

/** Backend envelope shape: { success, message, data, statusCode }. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle the envelope + errors globally
api.interceptors.response.use(
  (response) => {
    const body = response.data as Partial<ApiEnvelope<unknown>> | undefined;

    // Envelope with success=false but HTTP 200 -> treat as error
    if (body && typeof body === 'object' && body.success === false) {
      return Promise.reject(
        new ApiError(
          body.message || 'Operation failed',
          body.statusCode || response.status,
          response.statusText,
          body.data
        )
      );
    }

    return response;
  },
  (error: AxiosError<Partial<ApiEnvelope<unknown>>>) => {
    if (error.response) {
      const { status, statusText, data } = error.response;

      // Auto-logout on 401 Unauthorized
      if (status === 401) {
        handleUnauthorized();
      }

      const message = data?.message || error.message || 'An unexpected error occurred';
      return Promise.reject(new ApiError(message, data?.statusCode || status, statusText, data?.data ?? data));
    }

    if (error.request) {
      return Promise.reject(
        new ApiError('Network error - is the mock API running? (npm run dev:server)', 0, 'Network Error')
      );
    }

    return Promise.reject(
      new ApiError(error.message || 'Request configuration error', 0, 'Request Error')
    );
  }
);

/** Read auth token from persisted storage to avoid circular imports */
function getAuthToken(): string | null {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.accessToken || null;
    }
  } catch {
    // Silently fail if localStorage is unavailable
  }
  return null;
}

/** Handle 401 - clear auth storage and redirect */
function handleUnauthorized(): void {
  localStorage.removeItem('auth-storage');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export default api;
