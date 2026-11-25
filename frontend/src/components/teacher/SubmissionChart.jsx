import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SubmissionChart({
  statistics,
}) {
  const data = [
    {
      name: "Manually Submitted",
      value: statistics.manualSubmissions ?? 0,
      color: "#16a34a",
    },
    {
      name: "Automatically Submitted",
      value: statistics.autoSubmissions ?? 0,
      color: "#f59e0b",
    },
    {
      name: "In Progress",
      value: statistics.inProgress ?? 0,
      color: "#2563eb",
    },
  ];

  const total = data.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold">
        Submission Status
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Overview of all student attempts
      </p>

      {total === 0 ? (
        <div className="flex h-55 items-center justify-center text-sm text-slate-500">
          No student attempts yet
        </div>
      ) : (
        <div className="relative mt-3 h-55">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.filter(
                  (item) => item.value > 0
                )}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                stroke="none"
              >
                {data
                  .filter((item) => item.value > 0)
                  .map((item) => (
                    <Cell
                      key={item.name}
                      fill={item.color}
                    />
                  ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">
              {total}
            </span>

            <span className="text-xs text-slate-500">
              Attempts
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />

              <span className="text-slate-600">
                {item.name}
              </span>
            </div>

            <span className="font-semibold">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}