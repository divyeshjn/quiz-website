import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <h1 className="text-7xl font-bold text-blue-600">
        404
      </h1>

      <h2 className="mt-4 text-2xl font-semibold">
        Page not found
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        The page you are looking for does not exist.
      </p>

      <Link
        to="/"
        className="mt-6 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
      >
        Return to home
      </Link>
    </main>
  );
}