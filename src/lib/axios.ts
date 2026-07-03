import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

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

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
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

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response) {
      const { status, statusText, data } = error.response;

      // Auto-logout on 401 Unauthorized
      if (status === 401) {
        handleUnauthorized();
      }

      const message = data?.message || error.message || 'An unexpected error occurred';
      return Promise.reject(new ApiError(message, status, statusText, data));
    }

    if (error.request) {
      return Promise.reject(
        new ApiError('Network error - no response received', 0, 'Network Error')
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
