"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  avatarUrl?: string | null;
}

interface Organisation {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

interface AuthState {
  user: User | null;
  org: Organisation | null;
  accessToken: string | null;
  refreshToken: string | null;

  setAuth: (data: {
    user: User;
    organisation: Organisation;
    accessToken: string;
    refreshToken: string;
  }) => void;

  updateUser: (data: Partial<User>) => void;
  updateOrg: (data: Partial<Organisation>) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      org: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (data) =>
        set({
          user: data.user,
          org: data.organisation,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      updateOrg: (data) =>
        set((state) => ({
          org: state.org ? { ...state.org, ...data } : null,
        })),

      clearAuth: () =>
        set({
          user: null,
          org: null,
          accessToken: null,
          refreshToken: null,
        }),

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: "qa-auth",
      partialize: (state) => ({
        user: state.user,
        org: state.org,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
