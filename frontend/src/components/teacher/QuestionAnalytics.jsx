import { useState } from "react";
import { BarChart3 } from "lucide-react";

export default function QuestionAnalytics({
  questions = [],
}) {
  const [sort, setSort] = useState("lowest");

  const normalized = questions.map((question) => {
    const assigned = Number(
      question.totalAssigned ??
      question.assignedCount ??
      question.assigned ??
      0
    );

    const correct = Number(
      question.correctCount ??
      question.correctAnswers ??
      question.correct ??
      0
    );

    const incorrect = Number(
      question.incorrectCount ??
      question.incorrectAnswers ??
      question.incorrect ??
      0
    );

    const unanswered = Number(
      question.unansweredCount ??
      question.unanswered ??
      0
    );

    const accuracy =
      question.accuracy ??
      question.accuracyPercentage ??
      (assigned ? (correct / assigned) * 100 : 0);

    return {
      ...question,
      assigned,
      correct,
      incorrect,
      unanswered,
      accuracy: Number(accuracy),
    };
  });

  const sorted = [...normalized].sort((a, b) =>
    sort === "lowest"
      ? a.accuracy - b.accuracy
      : b.accuracy - a.accuracy
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Question-wise Analytics
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Identify difficult questions and learning gaps
          </p>
        </div>

        <select
          aria-label="Sort question accuracy"
          value={sort}
          onChange={(event) =>
            setSort(event.target.value)
          }
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="lowest">
            Lowest Accuracy First
          </option>

          <option value="highest">
            Highest Accuracy First
          </option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <div className="py-12 text-center">
          <BarChart3
            size={36}
            className="mx-auto text-slate-300"
          />

          <p className="mt-3 text-sm text-slate-500">
            No question analytics available yet
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {sorted.map((question, index) => {
            const accuracy = Math.min(
              100,
              Math.max(0, question.accuracy)
            );

            const color =
              accuracy >= 75
                ? "bg-green-500"
                : accuracy >= 40
                  ? "bg-amber-500"
                  : "bg-red-500";

            return (
              <div
                key={
                  question.questionId ||
                  question._id ||
                  index
                }
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="whitespace-pre-wrap wrap-break-words text-sm font-medium">
                    {question.questionText}
                  </p>

                  <span className="shrink-0 font-bold">
                    {question.assigned > 0
                      ? `${accuracy.toFixed(1)}%`
                      : "N/A"}
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{
                      width: `${accuracy}%`,
                    }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
                  <span className="text-slate-500">
                    Assigned: {question.assigned}
                  </span>

                  <span className="text-green-600">
                    Correct: {question.correct}
                  </span>

                  <span className="text-red-600">
                    Incorrect: {question.incorrect}
                  </span>

                  <span className="text-slate-500">
                    Unanswered: {question.unanswered}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}