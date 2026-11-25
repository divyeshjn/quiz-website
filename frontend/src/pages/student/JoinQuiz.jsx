import { useEffect, useState } from "react";

import {
  useParams,
  useNavigate,
  Link,
} from "react-router-dom";

import {
  GraduationCap,
  Clock,
  ListChecks,
  Award,
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";

import toast from "react-hot-toast";

import { getPublicQuiz } from "../../api/quiz.api";
import { startAttempt } from "../../api/attempt.api";

import {
  storeAttempt,
  getStoredAttempt,
} from "../../utils/attemptStorage";

import { formatDateTime } from "../../utils/format";
import { getErrorMessage } from "../../utils/error";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";

export default function JoinQuiz() {
  const { quizId } = useParams();

  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [storedAttempt, setStoredAttempt] =
    useState(null);

  const [form, setForm] = useState({
    studentName: "",
    rollNumber: "",
    email: "",
  });

  const [errors, setErrors] = useState({});

  const [clockOffset, setClockOffset] =
    useState(0);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let active = true;

    const fetchQuiz = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getPublicQuiz(quizId);

        if (!active) return;

        setQuiz(response.quiz);

        if (response.serverTime) {
          setClockOffset(
            new Date(response.serverTime).getTime() -
              Date.now()
          );
        }

        setStoredAttempt(getStoredAttempt(quizId));
      } catch (error) {
        if (active) {
          setError(getErrorMessage(error));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchQuiz();

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [quizId]);

  const serverNow = now + clockOffset;

  const availability =
    !quiz
      ? "closed"
      : quiz.availability === "closed" ||
          serverNow >= new Date(quiz.endTime).getTime()
        ? "closed"
        : serverNow < new Date(quiz.startTime).getTime()
          ? "upcoming"
          : "open";

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

  const validateForm = () => {
    const newErrors = {};

    if (!form.studentName.trim()) {
      newErrors.studentName = "Full name is required";
    }

    if (!form.rollNumber.trim()) {
      newErrors.rollNumber = "Roll number is required";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      newErrors.email = "Enter a valid email address";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleStart = async (event) => {
    event.preventDefault();

    if (starting) return;

    if (!validateForm()) return;

    if (!agreed) {
      toast.error("Please accept the quiz instructions");
      return;
    }

    if (availability !== "open") {
      toast.error("This quiz is not currently open");
      return;
    }

    setStarting(true);

    try {
      const response = await startAttempt({
        quizId,
        studentName: form.studentName.trim(),
        rollNumber: form.rollNumber.trim().toUpperCase(),
        email: form.email.trim().toLowerCase(),
      });

      storeAttempt(
        quizId,
        response.attempt.id,
        response.accessToken
      );

      toast.success("Quiz started successfully");

      navigate(`/quiz/${quizId}/attempt`, {
        replace: true,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading quiz..." />;
  }

  if (error || !quiz) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center">
          <AlertCircle
            size={40}
            className="mx-auto text-red-500"
          />

          <h1 className="mt-4 text-xl font-bold">
            Quiz Unavailable
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "Quiz not found"}
          </p>

          <Link
            to="/"
            className="mt-5 inline-block text-sm text-blue-600"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const availableMinutes = Math.max(
    0,
    Math.min(
      quiz.duration,
      Math.floor(
        (new Date(quiz.endTime).getTime() -
          serverNow) /
          60000
      )
    )
  );

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">

        {/* Branding */}

        <Link
          to="/"
          className="mb-6 flex items-center gap-3"
        >
          <div className="rounded-xl bg-blue-600 p-2.5 text-white">
            <GraduationCap size={25} />
          </div>

          <span className="text-xl font-bold">
            Quiz Portal
          </span>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

          <StatusBadge status={availability} />

          <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
            {quiz.title}
          </h1>

          <p className="mt-2 text-slate-500">
            {quiz.subject}
          </p>

          {quiz.description && (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {quiz.description}
            </p>
          )}

          {/* Quiz information */}

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              {
                icon: Clock,
                value: `${quiz.duration} min`,
                label: "Duration",
              },
              {
                icon: ListChecks,
                value: quiz.questionCount,
                label: "Questions",
              },
              {
                icon: Award,
                value: quiz.totalMarks,
                label: "Total Marks",
              },
            ].map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="rounded-xl bg-slate-50 p-3 text-center sm:p-4"
              >
                <Icon
                  size={22}
                  className="mx-auto text-blue-600"
                />

                <p className="mt-2 text-lg font-bold">
                  {value}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2 rounded-xl border border-slate-200 p-4 text-sm">
            <p>
              <span className="text-slate-500">
                Opens:
              </span>{" "}
              {formatDateTime(quiz.startTime)}
            </p>

            <p>
              <span className="text-slate-500">
                Closes:
              </span>{" "}
              {formatDateTime(quiz.endTime)}
            </p>
          </div>

          {/* Existing attempt */}

          {storedAttempt ? (
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
              <h2 className="font-semibold text-blue-900">
                Existing Attempt Found
              </h2>

              <p className="mt-2 text-sm text-blue-700">
                You have already started this quiz on
                this browser. You can reopen your
                existing attempt.
              </p>

              <Button
                className="mt-4 w-full"
                onClick={() =>
                  navigate(`/quiz/${quizId}/attempt`)
                }
              >
                Open My Attempt
                <ArrowRight size={17} />
              </Button>
            </div>
          ) : availability === "upcoming" ? (
            <div className="mt-6 rounded-xl bg-amber-50 p-6 text-center">
              <CalendarClock
                size={35}
                className="mx-auto text-amber-600"
              />

              <h2 className="mt-3 font-semibold text-amber-800">
                Quiz Has Not Started Yet
              </h2>

              <p className="mt-2 text-sm text-amber-700">
                Registration will become available
                when the quiz opens.
              </p>
            </div>
          ) : availability === "closed" ? (
            <div className="mt-6 rounded-xl bg-red-50 p-6 text-center">
              <AlertCircle
                size={35}
                className="mx-auto text-red-600"
              />

              <h2 className="mt-3 font-semibold text-red-800">
                Quiz Is Closed
              </h2>

              <p className="mt-2 text-sm text-red-700">
                New attempts are no longer accepted.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleStart}
              noValidate
              className="mt-7 space-y-5 border-t border-slate-200 pt-6"
            >
              <h2 className="text-xl font-semibold">
                Student Information
              </h2>

              <Input
                label="Full Name"
                required
                maxLength={100}
                value={form.studentName}
                onChange={(event) =>
                  updateField(
                    "studentName",
                    event.target.value
                  )
                }
                placeholder="Enter your full name"
                error={errors.studentName}
              />

              <Input
                label="Roll Number"
                required
                maxLength={50}
                value={form.rollNumber}
                onChange={(event) =>
                  updateField(
                    "rollNumber",
                    event.target.value
                  )
                }
                placeholder="Enter your roll number"
                error={errors.rollNumber}
              />

              <Input
                label="College Email"
                type="email"
                required
                maxLength={254}
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                placeholder="Enter your college email"
                error={errors.email}
              />

              {availableMinutes < quiz.duration && (
                <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                  Less than the full configured duration
                  remains before the quiz closes.
                  Your timer will be shortened accordingly.
                </div>
              )}

              <div className="rounded-xl bg-blue-50 p-4">
                <h3 className="font-semibold text-blue-900">
                  Important Instructions
                </h3>

                <ul className="mt-3 space-y-2 text-sm text-blue-800">
                  {[
                    "Only one attempt is allowed per student.",
                    "Your timer starts immediately after starting.",
                    "Questions are randomly selected.",
                    "Answers are saved automatically.",
                    "The quiz is submitted when time expires.",
                    "Do not clear browser storage during the quiz.",
                    "Use the same browser if you refresh or reopen the quiz.",
                  ].map((instruction) => (
                    <li
                      key={instruction}
                      className="flex items-start gap-2"
                    >
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0"
                      />
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>

              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) =>
                    setAgreed(event.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 accent-blue-600"
                />

                I have read and understood the quiz
                instructions.
              </label>

              <Button
                type="submit"
                loading={starting}
                disabled={!agreed}
                className="w-full"
              >
                Start Quiz
                <ArrowRight size={18} />
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Quiz Portal · Online Assessment System
        </p>
      </div>
    </main>
  );
}