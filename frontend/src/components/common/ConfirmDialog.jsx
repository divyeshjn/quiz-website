import { AlertTriangle } from "lucide-react";
import Button from "./Button";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  variant = "danger",
  loading = false,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div
          className={`mb-4 inline-flex rounded-full p-3 ${
            variant === "danger"
              ? "bg-red-100 text-red-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          <AlertTriangle size={24} />
        </div>

        <h2
          id="confirm-dialog-title"
          className="text-xl font-semibold"
        >
          {title}
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {description}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            variant={variant}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}