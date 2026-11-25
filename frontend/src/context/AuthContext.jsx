import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginTeacher,
  logoutTeacher,
  getTeacherStatus,
} from "../api/teacher.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        const response =
          await getTeacherStatus();

        if (active) {
          setAuthenticated(
            response.authenticated === true
          );
        }
      } catch {
        if (active) {
          setAuthenticated(false);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
  }, []);

  const login = async (password) => {
    const response =
      await loginTeacher(password);

    if (response.success) {
      setAuthenticated(true);
    }

    return response;
  };

  const logout = async () => {
    await logoutTeacher();

    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};