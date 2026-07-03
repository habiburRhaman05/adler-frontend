import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '../api/auth.service';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginInput) => authService.login(credentials),
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken);
      toast.success('Welcome back!', {
        description: `Signed in as ${data.user.email}`,
      });
      navigate('/dashboard', { replace: true });
    },
    onError: (error) => {
      toast.error('Login failed', {
        description: error.message || 'Invalid email or password',
      });
    },
  });
}

export function useRegister() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterInput) => authService.register(data),
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken);
      toast.success('Account created!', {
        description: 'Welcome to the platform',
      });
      navigate('/dashboard', { replace: true });
    },
    onError: (error) => {
      toast.error('Registration failed', {
        description: error.message || 'Could not create account',
      });
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      logout();
      queryClient.clear();
      navigate('/login', { replace: true });
      toast.success('Signed out successfully');
    },
  });
}

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const user = await authService.me();
      setUser(user);
      return user;
    },
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
  });
}
