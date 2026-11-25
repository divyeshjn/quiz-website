export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "blue",
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        {Icon && (
          <div
            className={`rounded-lg p-2.5 ${
              colors[color] || colors.blue
            }`}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <p className="mt-3 text-3xl font-bold tracking-tight">
        {value}
      </p>
    </div>
  );
}