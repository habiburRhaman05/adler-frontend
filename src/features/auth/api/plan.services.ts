import { apiClient } from '@/lib/api-client';
import {
  authResponseSchema,
  userSchema,
  type AuthResponse,
  type RegisterInput,
  type UserResponse,
} from '../schemas/auth.schema';

export const planServices = {
  submitPlan: async (): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/submit-plan', {
      schema: authResponseSchema,
    });
  },

  getSpecificPlan: async (data: RegisterInput): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', data, {
      schema: authResponseSchema,
    });
  },

  editPlan: async (): Promise<UserResponse> => {
    return apiClient.get<UserResponse>('/auth/me', {
      schema: userSchema,
    });
  },

};
