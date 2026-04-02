import { useEffect } from "react";
import api from "../../services/api";
import { useAuthStore } from "../../store/authStore";

const AuthBootstrap = ({ children }) => {
  const { token, user, isHydrated, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const syncSession = async () => {
      if (!token || !isHydrated) return;

      try {
        const { data } = await api.get("/auth/me");
        if (data?.user) {
          setAuth(data.user, token);
        }
      } catch {
        clearAuth();
      }
    };

    if (isHydrated && token && !user) {
      syncSession();
    }
  }, [clearAuth, isHydrated, setAuth, token, user]);

  return children;
};

export default AuthBootstrap;