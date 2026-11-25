import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";

import Button from "../common/Button";

export default function QuestionForm({
  question,
  onSubmit,
  onClose,
  loading = false,
}) {
  const [questionText, setQuestionText] = useState(
    question?.questionText || ""
  );

  const [options, setOptions] = useState(
    question ? [...question.options] : ["", "", "", ""]
  );

  const [correctOption, setCorrectOption] = useState(
    question?.correctOption ?? null
  );

  const [error, setError] = useState("");

  const updateOption = (index, value) => {
    setOptions((previous) =>
      previous.map((option, i) =>
        i === index ? value : option
      )
    );

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanedOptions = options.map(
      (option) => option.trim()
    );

    if (!questionText.trim()) {
      setError("Question text is required");
      return;
    }

    if (cleanedOptions.some((option) => !option)) {
      setError("All four options are required");
      return;
    }

    if (new Set(cleanedOptions).size !== 4) {
      setError("All options must be different");
      return;
    }

    if (correctOption === null) {
      setError("Please select the correct answer");
      return;
    }

    setError("");

    await onSubmit({
      questionText: questionText.trim(),
      options: cleanedOptions,
      correctOption,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="question-form-title"
        className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2
              id="question-form-title"
              className="text-xl font-semibold"
            >
              {question ? "Edit Question" : "Add Question"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter a question and select its correct answer.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close question form"
            disabled={loading}
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5"
        >
          <div>
            <label
              htmlFor="questionText"
              className="mb-2 block text-sm font-medium"
            >
              Question Text
            </label>

            <textarea
              id="questionText"
              rows={3}
              value={questionText}
              onChange={(event) => {
                setQuestionText(event.target.value);
                setError("");
              }}
              placeholder="Enter your question..."
              className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <p className="text-sm font-medium">
              Answer Options
            </p>

            <p className="mb-3 mt-1 text-xs text-slate-500">
              Select the radio button beside the correct answer.
            </p>

            <div className="space-y-3">
              {options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                    correctOption === index
                      ? "border-green-400 bg-green-50"
                      : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="correctOption"
                    aria-label={`Mark option ${String.fromCharCode(65 + index)} as correct`}
                    checked={correctOption === index}
                    onChange={() => {
                      setCorrectOption(index);
                      setError("");
                    }}
                    className="h-4 w-4 accent-green-600"
                  />

                  <span className="text-sm font-semibold text-slate-500">
                    {String.fromCharCode(65 + index)}.
                  </span>

                  <input
                    type="text"
                    aria-label={`Option ${String.fromCharCode(65 + index)}`}
                    value={option}
                    onChange={(event) =>
                      updateOption(index, event.target.value)
                    }
                    placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />

                  {correctOption === index && (
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-green-600"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button type="submit" loading={loading}>
              {question ? "Save Changes" : "Add Question"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}