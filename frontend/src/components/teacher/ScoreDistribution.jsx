import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ScoreDistribution({
  students = [],
}) {
  const completed = students.filter(
    (student) =>
      student.status === "submitted" ||
      student.status === "auto-submitted"
  );

  const data = [
    { range: "0–20%", count: 0 },
    { range: ">20–40%", count: 0 },
    { range: ">40–60%", count: 0 },
    { range: ">60–80%", count: 0 },
    { range: ">80–100%", count: 0 },
  ];

  completed.forEach((student) => {
    const percentage = student.totalMarks
      ? (student.score / student.totalMarks) * 100
      : 0;

    const index = Math.min(
      4,
      Math.max(0, Math.ceil(percentage / 20) - 1)
    );

    data[index].count += 1;
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold">
        Score Distribution
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Distribution of marks across completed examinations
      </p>

      {completed.length === 0 ? (
        <div className="flex h-70 items-center justify-center text-sm text-slate-500">
          No completed examinations yet
        </div>
      ) : (
        <div className="mt-6 h-70 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />

              <XAxis
                dataKey="range"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={35}
              />

              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                formatter={(value) => [
                  value,
                  "Students",
                ]}
              />

              <Bar
                dataKey="count"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}