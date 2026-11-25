import { useId } from "react";

export default function Input({
  label,
  error,
  className = "",
  id,
  required,
  ...props
}) {
  const generatedId = useId();

  const inputId = id || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>
      )}

      <input
        {...props}
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${inputId}-error` : undefined
        }
        className={`
          w-full rounded-lg border bg-white
          px-3.5 py-2.5 text-sm
          text-slate-900 outline-none
          transition
          placeholder:text-slate-400
          focus:ring-2 focus:ring-blue-100
          ${
            error
              ? "border-red-500"
              : "border-slate-300 focus:border-blue-500"
          }
          ${className}
        `}
      />

      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}