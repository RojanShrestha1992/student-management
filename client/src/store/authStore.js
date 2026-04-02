import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isHydrated: false,
      setAuth: (user, token) => {
        localStorage.setItem("sms_token", token);
        set({ user, token });
      },
      clearAuth: () => {
        localStorage.removeItem("sms_token");
        set({ user: null, token: null });
      },
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "sms-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.();
      },
    }
  )
);
