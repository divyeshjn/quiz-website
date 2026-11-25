const styles = {
  draft: "bg-slate-100 text-slate-600",

  open: "bg-green-100 text-green-700",

  upcoming: "bg-amber-100 text-amber-700",

  closed: "bg-red-100 text-red-700",

  published: "bg-blue-100 text-blue-700",

  submitted: "bg-green-100 text-green-700",

  "auto-submitted":
    "bg-amber-100 text-amber-700",

  "in-progress":
    "bg-blue-100 text-blue-700",
};

export default function StatusBadge({
  status,
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full px-2.5 py-1
        text-xs font-medium capitalize
        ${styles[status] || styles.draft}
      `}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {status?.replaceAll("-", " ") || "Unknown"}
    </span>
  );
}