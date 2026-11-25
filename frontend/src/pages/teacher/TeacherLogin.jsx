import { useState } from "react";

import {
  Navigate,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

import { getErrorMessage } from "../../utils/error";

import Navbar from "../../components/layout/Navbar";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

export default function TeacherLogin() {
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const {
    login,
    authenticated,
    loading,
  } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await login(password);

      toast.success("Login successful");

      const destination =
        location.state?.from?.pathname ||
        "/teacher/dashboard";

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (authenticated) {
    return (
      <Navigate
        to="/teacher/dashboard"
        replace
      />
    );
  }

  return (
    <div className="min-h-dvh">
      <Navbar />

      <main className="flex min-h-[calc(100dvh-64px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck size={30} />
            </div>

            <h1 className="text-2xl font-bold tracking-tight">
              Teacher Login
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Sign in to manage your quizzes
              and view student results.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="teacher-password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="teacher-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter teacher password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={submitting}
              className="w-full py-3"
            >
              {submitting
                ? "Signing in..."
                : "Sign in"}
            </Button>
          </form>

          <div className="mt-7 border-t border-slate-100 pt-5 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
            >
              <ArrowLeft size={15} />
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}