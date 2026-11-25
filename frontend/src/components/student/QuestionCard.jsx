import { Circle, CircleDot } from "lucide-react";

export default function QuestionCard({
  question,
  index,
  total,
  disabled,
  onSelect,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          Question {index + 1} of {total}
        </p>

        <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium">
          {question.marks} marks
        </span>
      </div>

      <h2 className="mt-5 whitespace-pre-wrap wrap-break-words text-lg font-semibold leading-relaxed">
        {question.questionText}
      </h2>

      <div className="mt-6 space-y-3">
        {question.options.map((option, optionIndex) => {
          const selected =
            question.selectedOption === optionIndex;

          return (
            <button
              key={optionIndex}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onSelect(optionIndex)}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition disabled:opacity-60 ${
                selected
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
              }`}
            >
              {selected ? (
                <CircleDot
                  size={21}
                  className="shrink-0 text-blue-600"
                />
              ) : (
                <Circle
                  size={21}
                  className="shrink-0 text-slate-400"
                />
              )}

              <span className="font-medium">
                {String.fromCharCode(65 + optionIndex)}.
              </span>

              <span className="min-w-0 wrap-break-words text-sm sm:text-base">
                {option}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={
          disabled || question.selectedOption === null
        }
        onClick={() => onSelect(null)}
        className="mt-5 text-sm font-medium text-slate-500 hover:text-red-600 disabled:opacity-40"
      >
        Clear Answer
      </button>
    </section>
  );
}