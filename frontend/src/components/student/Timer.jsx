import { Clock } from "lucide-react";

export default function Timer({
  formattedTime,
  remainingSeconds,
}) {
  const critical = remainingSeconds <= 60;

  const warning =
    remainingSeconds <= 300 && !critical;

  return (
    <div
      role="timer"
      aria-label={`Time remaining ${formattedTime}`}
      className={`flex items-center gap-2 rounded-xl px-4 py-3 ${
        critical
          ? "bg-red-100 text-red-700"
          : warning
            ? "bg-amber-100 text-amber-700"
            : "bg-blue-50 text-blue-700"
      }`}
    >
      <Clock size={21} />

      <span className="font-mono text-xl font-bold tabular-nums sm:text-2xl">
        {formattedTime}
      </span>
    </div>
  );
}