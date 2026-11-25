import {
  Users,
  CheckCircle2,
  Clock,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Award,
} from "lucide-react";

const formatNumber = (value) => {
  if (value === null || value === undefined) {
    return "—";
  }

  return Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};

export default function ResultStatCards({
  statistics,
  totalMarks,
}) {
  const hasSubmissions =
    statistics.totalSubmitted > 0;

  const formatScore = (score) =>
    hasSubmissions
      ? `${formatNumber(score)} / ${totalMarks}`
      : "—";

  const cards = [
    {
      title: "Total Participants",
      value: statistics.totalParticipants ?? 0,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Submitted",
      value: statistics.totalSubmitted ?? 0,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "In Progress",
      value: statistics.inProgress ?? 0,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Class Average",
      value: formatScore(statistics.averageScore),
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Highest Score",
      value: formatScore(statistics.highestScore),
      icon: Trophy,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Lowest Score",
      value: formatScore(statistics.lowestScore),
      icon: TrendingDown,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Pass Percentage",
      value: hasSubmissions
        ? `${formatNumber(statistics.passPercentage)}%`
        : "—",
      icon: Target,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Average Percentage",
      value: hasSubmissions
        ? `${formatNumber(statistics.averagePercentage)}%`
        : "—",
      icon: Award,
      color: "bg-cyan-50 text-cyan-600",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {cards.map(
        ({ title, value, icon: Icon, color }) => (
          <div
            key={title}
            className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                {title}
              </p>

              <div className={`rounded-lg p-2 ${color}`}>
                <Icon size={19} />
              </div>
            </div>

            <p className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">
              {value}
            </p>
          </div>
        )
      )}
    </section>
  );
}