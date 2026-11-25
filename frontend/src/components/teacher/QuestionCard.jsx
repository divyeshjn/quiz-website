import {
  Pencil,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export default function QuestionCard({
  question,
  index,
  editable,
  onEdit,
  onDelete,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Question {index + 1}
        </span>

        {editable && (
          <div className="flex items-center gap-1">
            <button
              aria-label={`Edit question ${index + 1}`}
              onClick={() => onEdit(question)}
              className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
            >
              <Pencil size={17} />
            </button>

            <button
              aria-label={`Delete question ${index + 1}`}
              onClick={() => onDelete(question)}
              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={17} />
            </button>
          </div>
        )}
      </div>

      <h3 className="whitespace-pre-wrap wrap-break-words font-medium text-slate-900">
        {question.questionText}
      </h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {question.options.map((option, i) => {
          const isCorrect = i === question.correctOption;

          return (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
                isCorrect
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              <span className="font-semibold">
                {String.fromCharCode(65 + i)}.
              </span>

              <span className="min-w-0 flex-1 wrap-break-words">
                {option}
              </span>

              {isCorrect && (
                <CheckCircle2
                  size={18}
                  className="shrink-0"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}