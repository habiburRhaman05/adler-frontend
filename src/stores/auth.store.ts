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
  role: UserRole | string;
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
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
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
