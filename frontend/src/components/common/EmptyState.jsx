import { ClipboardList } from "lucide-react";

export default function EmptyState({
  title = "Nothing here yet",
  description,
  action,
  icon: Icon = ClipboardList,
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mb-4 rounded-full bg-slate-100 p-4">
        <Icon
          size={28}
          className="text-slate-500"
        />
      </div>

      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}