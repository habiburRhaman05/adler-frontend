import { apiClient } from '@/lib/api-client';
import {
  authResponseSchema,
  userSchema,
  type AuthResponse,
  type LoginInput,
  type RegisterInput,
  type UserResponse,
} from '../schemas/auth.schema';

export const authService = {
  login: async (credentials: LoginInput): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/admin/login', credentials);
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', data, {
      schema: authResponseSchema,
    });
  },

  me: async (): Promise<UserResponse> => {
    return apiClient.get<UserResponse>('/auth/admin/profile');
  },

  logout: async (): Promise<void> => {
    return apiClient.post<void>('/auth/admin/logout');
  },
};
