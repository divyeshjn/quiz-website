export default function QuestionNavigator({
  questions,
  currentIndex,
  onNavigate,
}) {
  const answered = questions.filter(
    (question) => question.selectedOption !== null
  ).length;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">

      <h2 className="font-semibold">
        Question Navigator
      </h2>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {questions.map((question, index) => {
          const current = index === currentIndex;

          const isAnswered =
            question.selectedOption !== null;

          return (
            <button
              key={question.questionId}
              type="button"
              aria-label={`Question ${index + 1}`}
              aria-current={current ? "step" : undefined}
              onClick={() => onNavigate(index)}
              className={`aspect-square rounded-lg text-sm font-semibold transition ${
                current
                  ? "bg-blue-600 text-white"
                  : isAnswered
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-blue-600" />
          Current Question
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-green-200" />
          Answered
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-slate-200" />
          Unanswered
        </div>
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <div className="flex justify-between text-sm">
          <span>Answered</span>
          <span className="font-semibold">{answered}</span>
        </div>

        <div className="mt-2 flex justify-between text-sm">
          <span>Unanswered</span>

          <span className="font-semibold">
            {questions.length - answered}
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{
              width: `${
                questions.length
                  ? (answered / questions.length) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}