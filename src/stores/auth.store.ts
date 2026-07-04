import { create } from "zustand";

export const UserRole = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole | string;
  createdAt: string;
}

interface AuthState {
  admin: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

interface AuthActions {
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setHydrated: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  admin: null,
  isAuthenticated: false,
  isHydrated: false,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  login: (admin) =>
    set({
      admin,
      isAuthenticated: true,
      isHydrated:true
    }),

  logout: () =>
    set({
      ...initialState,
      isHydrated: true,
    }),

  setUser: (admin) =>
    set({
      admin,
    }),

  setHydrated: () =>
    set({
      isHydrated: true,
    }),
}));