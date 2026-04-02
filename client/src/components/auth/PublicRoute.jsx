import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const PublicRoute = ({ children }) => {
  const { user, token, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading session...
      </div>
    );
  }

  if (token && user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
};

export default PublicRoute;
