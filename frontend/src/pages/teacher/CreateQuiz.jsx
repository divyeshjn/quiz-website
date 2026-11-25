import { useEffect, useState } from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  FileText,
  CalendarClock,
  Settings2,
  Info,
  Save,
  ArrowRight,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  createQuiz,
  getQuizById,
  updateQuiz,
} from "../../api/quiz.api";

import {
  toLocalDateTimeInput,
  toUTCDateTime,
} from "../../utils/format";

import { getErrorMessage } from "../../utils/error";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";

const getInitialForm = () => ({
  title: "",
  subject: "",
  description: "",

  startTime: toLocalDateTimeInput(
    new Date(Date.now() + 60 * 60 * 1000)
  ),

  endTime: toLocalDateTimeInput(
    new Date(Date.now() + 2 * 60 * 60 * 1000)
  ),

  duration: 20,
  questionCount: 10,
  marksPerQuestion: 1,
  shuffleOptions: true,
});

function FormSection({
  title,
  description,
  icon: Icon,
  children,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">
        <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
          <Icon size={21} />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {children}
      </div>
    </section>
  );
}

export default function CreateQuiz() {
  const { quizId } = useParams();

  const isEdit = Boolean(quizId);

  const navigate = useNavigate();

  const [form, setForm] = useState(getInitialForm);
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Fetch existing quiz when editing
  useEffect(() => {
    let active = true;

    if (!isEdit) {
      setForm(getInitialForm());
      setErrors({});
      setLoadError("");
      setLoading(false);
      return;
    }

    const fetchQuiz = async () => {
      setLoading(true);
      setLoadError("");
      setErrors({});

      try {
        const response = await getQuizById(quizId);

        if (!active) return;

        const quiz = response.quiz;

        if (quiz.status !== "draft") {
          toast.error("Only draft quizzes can be edited");

          navigate("/teacher/dashboard", {
            replace: true,
          });

          return;
        }

        setForm({
          title: quiz.title,
          subject: quiz.subject,
          description: quiz.description || "",

          startTime: toLocalDateTimeInput(
            quiz.startTime
          ),

          endTime: toLocalDateTimeInput(
            quiz.endTime
          ),

          duration: quiz.duration,
          questionCount: quiz.questionCount,
          marksPerQuestion: quiz.marksPerQuestion,
          shuffleOptions: quiz.shuffleOptions,
        });
      } catch (error) {
        if (active) {
          setLoadError(getErrorMessage(error));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchQuiz();

    return () => {
      active = false;
    };
  }, [quizId, isEdit, navigate]);

  // Handle field changes
  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Quiz title is required";
    }

    if (!form.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    const start = new Date(form.startTime).getTime();
    const end = new Date(form.endTime).getTime();

    if (!Number.isFinite(start)) {
      newErrors.startTime =
        "Please select a valid opening time";
    }

    if (!Number.isFinite(end)) {
      newErrors.endTime =
        "Please select a valid closing time";
    } else if (end <= start) {
      newErrors.endTime =
        "Closing time must be after opening time";
    } else if (end <= Date.now()) {
      newErrors.endTime =
        "Closing time must be in the future";
    }

    if (
      !Number.isInteger(Number(form.duration)) ||
      Number(form.duration) < 1
    ) {
      newErrors.duration =
        "Enter a positive whole number of minutes";
    }

    if (
      !Number.isInteger(Number(form.questionCount)) ||
      Number(form.questionCount) < 1
    ) {
      newErrors.questionCount =
        "Enter a positive whole number of questions";
    }

    if (
      !Number.isFinite(Number(form.marksPerQuestion)) ||
      Number(form.marksPerQuestion) < 1
    ) {
      newErrors.marksPerQuestion =
        "Marks per question must be at least 1";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Create or update quiz
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the highlighted fields");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: form.title.trim(),
        subject: form.subject.trim(),
        description: form.description.trim(),

        startTime: toUTCDateTime(form.startTime),
        endTime: toUTCDateTime(form.endTime),

        duration: Number(form.duration),

        questionCount: Number(form.questionCount),

        marksPerQuestion: Number(
          form.marksPerQuestion
        ),

        shuffleOptions: form.shuffleOptions,
      };

      if (isEdit) {
        await updateQuiz(quizId, payload);

        toast.success("Quiz updated successfully");

        navigate("/teacher/dashboard");
      } else {
        const response = await createQuiz(payload);

        toast.success("Quiz created successfully");

        navigate(
          `/teacher/quizzes/${response.quiz._id}/questions`
        );
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const totalMarks =
    Number(form.questionCount || 0) *
    Number(form.marksPerQuestion || 0);

  const windowMinutes =
    (new Date(form.endTime).getTime() -
      new Date(form.startTime).getTime()) /
    60000;

  const durationWarning =
    Number.isFinite(windowMinutes) &&
    windowMinutes > 0 &&
    Number(form.duration) > windowMinutes;

  if (loading) {
    return <Loader message="Loading quiz settings..." />;
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">
          {loadError}
        </p>

        <Link
          to="/teacher/dashboard"
          className="mt-4 inline-block text-sm font-medium text-blue-600"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/teacher/dashboard"
        className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {isEdit ? "Edit Quiz" : "Create Quiz"}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {isEdit
            ? "Update the settings for your draft quiz."
            : "Configure your assessment before adding questions."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6"
      >
        {/* Basic information */}

        <FormSection
          title="Basic Information"
          description="Provide a name and subject for your assessment."
          icon={FileText}
        >
          <Input
            label="Quiz Title"
            required
            value={form.title}
            onChange={(event) =>
              updateField("title", event.target.value)
            }
            placeholder="e.g. Data Structures Quiz 2"
            error={errors.title}
          />

          <Input
            label="Subject"
            required
            value={form.subject}
            onChange={(event) =>
              updateField("subject", event.target.value)
            }
            placeholder="e.g. Data Structures and Algorithms"
            error={errors.subject}
          />

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Description / Instructions
            </label>

            <textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              placeholder="Enter instructions for students..."
              className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </FormSection>

        {/* Schedule */}

        <FormSection
          title="Schedule & Duration"
          description="Control when students can access the quiz."
          icon={CalendarClock}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Opening Time"
              type="datetime-local"
              required
              value={form.startTime}
              onChange={(event) =>
                updateField(
                  "startTime",
                  event.target.value
                )
              }
              error={errors.startTime}
            />

            <Input
              label="Closing Time"
              type="datetime-local"
              required
              value={form.endTime}
              onChange={(event) =>
                updateField(
                  "endTime",
                  event.target.value
                )
              }
              error={errors.endTime}
            />
          </div>

          <Input
            label="Duration per Student (minutes)"
            type="number"
            min={1}
            step={1}
            required
            value={form.duration}
            onChange={(event) =>
              updateField(
                "duration",
                event.target.value
              )
            }
            error={errors.duration}
          />

          <p className="text-xs text-slate-500">
            Time zone: {
              Intl.DateTimeFormat()
                .resolvedOptions().timeZone
            }
          </p>

          <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            <Info
              size={19}
              className="mt-0.5 shrink-0"
            />

            <p>
              Each student receives an individual timer
              when they start the quiz. However, all
              attempts must finish before the scheduled
              closing time.
            </p>
          </div>

          {durationWarning && (
            <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              The individual quiz duration exceeds the
              available examination window. Students
              will receive less than the configured
              duration.
            </div>
          )}
        </FormSection>

        {/* Question settings */}

        <FormSection
          title="Question Settings"
          description="Configure randomization and marking."
          icon={Settings2}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Questions per Student"
              type="number"
              min={1}
              step={1}
              required
              value={form.questionCount}
              onChange={(event) =>
                updateField(
                  "questionCount",
                  event.target.value
                )
              }
              error={errors.questionCount}
            />

            <Input
              label="Marks per Question"
              type="number"
              min={1}
              step="any"
              required
              value={form.marksPerQuestion}
              onChange={(event) =>
                updateField(
                  "marksPerQuestion",
                  event.target.value
                )
              }
              error={errors.marksPerQuestion}
            />
          </div>

          <p className="text-xs leading-relaxed text-slate-500">
            The configured number of questions will be
            randomly selected from the uploaded question
            pool for each student.
          </p>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4">
            <input
              type="checkbox"
              checked={form.shuffleOptions}
              onChange={(event) =>
                updateField(
                  "shuffleOptions",
                  event.target.checked
                )
              }
              className="mt-1 h-4 w-4 accent-blue-600"
            />

            <div>
              <p className="text-sm font-medium">
                Randomize answer options
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Shuffle the order of answer choices
                for each student.
              </p>
            </div>
          </label>

          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
            <div>
              <p className="text-sm font-medium text-slate-700">
                Total Quiz Marks
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Questions × Marks per question
              </p>
            </div>

            <p className="text-2xl font-bold text-blue-600">
              {Number.isFinite(totalMarks)
                ? Number(totalMarks.toFixed(4))
                : 0}
            </p>
          </div>
        </FormSection>

        {/* Submit actions */}

        <div className="flex flex-wrap justify-end gap-3 pb-6">
          <Button
            variant="secondary"
            disabled={submitting}
            onClick={() =>
              navigate("/teacher/dashboard")
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={submitting}
          >
            {isEdit ? (
              <>
                <Save size={17} />
                Save Changes
              </>
            ) : (
              <>
                Create & Add Questions
                <ArrowRight size={17} />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}