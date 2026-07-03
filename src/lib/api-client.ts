import type { AxiosRequestConfig } from 'axios';
import type { ZodType } from 'zod';
import api from './axios';

interface ApiRequestConfig<T> extends AxiosRequestConfig {
  schema?: ZodType<T>;
}

/**
 * Execute an API request with optional Zod schema validation.
 * If a schema is provided, the response data is parsed and validated at runtime.
 */
async function request<T>(config: ApiRequestConfig<T>): Promise<T> {
  const response = await api.request(config);

  if (config.schema) {
    return config.schema.parse(response.data);
  }

  return response.data as T;
}

/** Type-safe API client with Zod runtime validation */
export const apiClient = {
  get: <T>(url: string, config?: Omit<ApiRequestConfig<T>, 'method' | 'url'>) =>
    request<T>({ ...config, method: 'GET', url }),

  post: <T>(
    url: string,
    data?: unknown,
    config?: Omit<ApiRequestConfig<T>, 'method' | 'url' | 'data'>
  ) => request<T>({ ...config, method: 'POST', url, data }),

  put: <T>(
    url: string,
    data?: unknown,
    config?: Omit<ApiRequestConfig<T>, 'method' | 'url' | 'data'>
  ) => request<T>({ ...config, method: 'PUT', url, data }),

  patch: <T>(
    url: string,
    data?: unknown,
    config?: Omit<ApiRequestConfig<T>, 'method' | 'url' | 'data'>
  ) => request<T>({ ...config, method: 'PATCH', url, data }),

  delete: <T>(url: string, config?: Omit<ApiRequestConfig<T>, 'method' | 'url'>) =>
    request<T>({ ...config, method: 'DELETE', url }),
};
