import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
export const UserRole = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

interface AuthActions {
  login: (user: User, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setHydrated: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user:{
    id: '04516',
    name: 'Jhon Doe',
    email: 'jhon.doe@gmail.com',
    avatar: '',
    role: 'admin',
    createdAt: '2023-01-01T00:00:00Z',
  },
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA0NTE2IiwibmFtZSI6Ikpob24gRG9lIiwiZW1haWwiOiJqaG9uLmRvZUBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2OTQ3NzYwMDAsImV4cCI6MTY5NDc3OTYwMH0.7k8zFjK8sL8sL8sL8sL8sL8sL8sL8sL8sL8sL8sL8  ",
  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA0NTE2IiwibmFtZSI6Ikpob24gRG9lIiwiZW1haWwiOiJqaG9uLmRvZUBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2OTQ3NzYwMDAsImV4cCI6MTY5NDc3OTYwMH0.7k8zFjK8sL8sL8sL8sL8sL8sL8sL8sL8sL8sL8sL8  "  ,
  isAuthenticated: true,
  isHydrated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      login: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          ...initialState,
          isHydrated: true,
        }),

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken: refreshToken || null,
        }),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
