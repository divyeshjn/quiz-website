import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import Loader from "../components/common/Loader";

export default function ProtectedRoute() {
  const {
    authenticated,
    loading,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <Loader
        fullScreen
        message="Checking authentication..."
      />
    );
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/teacher/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}