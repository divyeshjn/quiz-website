import {
  X,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from "lucide-react";

export default function StudentResultModal({
  result,
  loading,
  error,
  onClose,
}) {
  const questions =
    result?.assignedQuestions ||
    result?.questions ||
    [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-result-title"
        className="max-h-[90dvh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
          <h2
            id="student-result-title"
            className="text-xl font-semibold"
          >
            Student Result
          </h2>

          <button
            aria-label="Close result"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={21} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading student result...
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">
            {error}
          </div>
        ) : result ? (
          <div className="space-y-6 p-5 sm:p-6">

            {/* Student details */}

            <div>
              <h3 className="text-xl font-bold">
                {result.studentName}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {result.rollNumber} · {result.email}
              </p>
            </div>

            {/* Marks overview */}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: "Total Score",
                  value: `${result.score} / ${result.totalMarks}`,
                  color: "bg-blue-50 text-blue-700",
                },
                {
                  label: "Correct",
                  value: result.correctAnswers,
                  color: "bg-green-50 text-green-700",
                },
                {
                  label: "Incorrect",
                  value: result.incorrectAnswers,
                  color: "bg-red-50 text-red-700",
                },
                {
                  label: "Unanswered",
                  value: result.unanswered,
                  color: "bg-slate-100 text-slate-700",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl p-4 ${item.color}`}
                >
                  <p className="text-xs font-medium">
                    {item.label}
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold">
              Answer Breakdown
            </h3>

            {questions.length === 0 && (
              <p className="text-sm text-slate-500">
                No question breakdown available.
              </p>
            )}

            {questions.map((question, index) => {
              const unanswered =
                question.selectedOption === null ||
                question.selectedOption === undefined;

              const correct =
                !unanswered &&
                question.selectedOption ===
                  question.correctOption;

              const StatusIcon = unanswered
                ? MinusCircle
                : correct
                  ? CheckCircle2
                  : XCircle;

              const statusColor = unanswered
                ? "text-slate-500"
                : correct
                  ? "text-green-600"
                  : "text-red-600";

              return (
                <div
                  key={question.questionId || index}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Question {index + 1}
                    </span>

                    <span
                      className={`flex items-center gap-1.5 text-sm font-medium ${statusColor}`}
                    >
                      <StatusIcon size={17} />

                      {unanswered
                        ? "Unanswered"
                        : correct
                          ? "Correct"
                          : "Incorrect"}
                    </span>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap font-medium">
                    {question.questionText}
                  </p>

                  <div className="mt-4 space-y-2">
                    {question.options.map(
                      (option, optionIndex) => {
                        const isCorrect =
                          optionIndex ===
                          question.correctOption;

                        const isSelected =
                          optionIndex ===
                          question.selectedOption;

                        return (
                          <div
                            key={optionIndex}
                            className={`flex flex-wrap items-center gap-2 rounded-lg border p-3 text-sm ${
                              isCorrect
                                ? "border-green-200 bg-green-50 text-green-700"
                                : isSelected
                                  ? "border-red-200 bg-red-50 text-red-700"
                                  : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            <span className="font-medium">
                              {String.fromCharCode(
                                65 + optionIndex
                              )}.
                            </span>

                            <span className="min-w-0 flex-1 wrap-break-words">
                              {option}
                            </span>

                            {isCorrect && (
                              <span className="text-xs font-semibold">
                                Correct Answer
                              </span>
                            )}

                            {isSelected && (
                              <span className="text-xs font-semibold">
                                Student's Answer
                              </span>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>

                  <p className="mt-4 text-right text-sm font-semibold">
                    Marks: {correct ? question.marks : 0}
                    {" / "}
                    {question.marks}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}