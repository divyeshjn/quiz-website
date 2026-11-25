import { LoaderCircle } from "lucide-react";

const variants = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700",

  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",

  danger:
    "bg-red-600 text-white hover:bg-red-700",

  ghost:
    "text-slate-600 hover:bg-slate-100",
};

export default function Button({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center
        gap-2 rounded-lg px-4 py-2.5
        text-sm font-medium transition-colors
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-blue-600
        disabled:opacity-50
        ${variants[variant] || variants.primary}
        ${className}
      `}
    >
      {loading && (
        <LoaderCircle
          size={16}
          className="animate-spin"
        />
      )}

      {children}
    </button>
  );
}