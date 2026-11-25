import { LoaderCircle } from "lucide-react";

export default function Loader({
  message = "Loading...",
  fullScreen = false,
}) {
  return (
    <div
      role="status"
      className={`
        flex flex-col items-center justify-center
        gap-3
        ${fullScreen ? "min-h-dvh" : "py-16"}
      `}
    >
      <LoaderCircle
        size={32}
        className="animate-spin text-blue-600"
      />

      <p className="text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
}