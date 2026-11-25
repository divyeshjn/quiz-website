import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5"
        >
          <div className="rounded-lg bg-blue-600 p-2 text-white">
            <GraduationCap size={22} />
          </div>

          <span className="text-lg font-bold tracking-tight">
            Quiz Portal
          </span>
        </Link>

        <Link
          to="/teacher/login"
          className="text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          Teacher Portal
        </Link>
      </div>
    </header>
  );
}