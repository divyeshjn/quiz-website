import { useState } from "react";

import {
  Outlet,
  NavLink,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  GraduationCap,
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

import { getErrorMessage } from "../../utils/error";

const navigation = [
  {
    label: "Dashboard",
    path: "/teacher/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Create Quiz",
    path: "/teacher/quizzes/create",
    icon: PlusCircle,
  },
];

export default function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const { logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logout();

      toast.success("Logged out successfully");

      navigate("/teacher/login", {
        replace: true,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          flex w-64 flex-col
          bg-slate-900 text-white
          transition-transform
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div className="flex h-20 items-center justify-between px-5">
          <Link
            to="/teacher/dashboard"
            className="flex items-center gap-3"
          >
            <div className="rounded-lg bg-blue-600 p-2">
              <GraduationCap size={22} />
            </div>

            <div>
              <p className="font-semibold">
                Quiz Portal
              </p>

              <p className="text-xs text-slate-400">
                Teacher workspace
              </p>
            </div>
          </Link>

          <button
            className="lg:hidden"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </p>

          {navigation.map(
            ({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() =>
                  setSidebarOpen(false)
                }
                className={({ isActive }) => `
                  flex items-center gap-3
                  rounded-lg px-3 py-3
                  text-sm font-medium
                  transition-colors
                  ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }
                `}
              >
                <Icon size={19} />
                {label}
              </NavLink>
            )
          )}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            <LogOut size={19} />

            {loggingOut
              ? "Logging out..."
              : "Logout"}
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open sidebar"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <p className="text-sm font-medium text-slate-600">
              Teacher Portal
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              T
            </div>

            <span className="hidden text-sm font-medium sm:block">
              Teacher
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}