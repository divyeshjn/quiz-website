import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
  Link,
} from "react-router-dom";

import {
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getAttempt,
  saveAnswer,
  submitAttempt,
} from "../../api/attempt.api";

import {
  getStoredAttempt,
} from "../../utils/attemptStorage";

import { getErrorMessage } from "../../utils/error";

import useQuizTimer from "../../hooks/useQuizTimer";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import QuestionCard from "../../components/student/QuestionCard";
import QuestionNavigator from "../../components/student/QuestionNavigator";
import Timer from "../../components/student/Timer";

export default function AttemptQuiz() {
  const { quizId } = useParams();

  const navigate = useNavigate();

  const [credentials, setCredentials] = useState(null);
  const [attempt, setAttempt] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);

  const [clockOffset, setClockOffset] = useState(0);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [isOnline, setIsOnline] = useState(
    navigator.onLine
  );

  const [pendingAnswer, setPendingAnswer] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [submissionError, setSubmissionError] =
    useState("");

  const savingRef = useRef(false);
  const submittingRef = useRef(false);
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const {
    remainingSeconds,
    formattedTime,
    isExpired,
  } = useQuizTimer(
    attempt?.deadline,
    clockOffset
  );

  // Update clock using backend timestamp
  const synchronizeClock = (serverTime) => {
    if (serverTime) {
      setClockOffset(
        new Date(serverTime).getTime() - Date.now()
      );
    }
  };

  // Recover existing attempt
  useEffect(() => {
    let active = true;

    const loadAttempt = async () => {
      setLoading(true);
      setError("");

      const stored = getStoredAttempt(quizId);

      if (!stored) {
        navigate(`/quiz/${quizId}`, {
          replace: true,
        });

        return;
      }

      try {
        const response = await getAttempt(
          stored.attemptId,
          stored.accessToken
        );

        if (!active) return;

        if (response.attempt.status !== "in-progress") {
          navigate(`/quiz/${quizId}/submitted`, {
            replace: true,
          });

          return;
        }

        setCredentials(stored);
        setAttempt(response.attempt);
        synchronizeClock(response.serverTime);
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

    loadAttempt();

    return () => {
      active = false;
    };
  }, [quizId, navigate]);

  // Warn before closing or refreshing during exam
  useEffect(() => {
    if (attempt?.status !== "in-progress") return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [attempt?.status]);

  // Save selected answer immediately
  // Save an answer and retain failed selections for retry
  const persistAnswer = async (questionId, selectedOption) => {
    if (
      !attempt ||
      !credentials ||
      isExpired ||
      savingRef.current ||
      submittingRef.current
    ) {
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setSaveError("");

    setPendingAnswer({
      questionId,
      selectedOption,
    });

    try {
      const response = await saveAnswer(
        credentials.attemptId,
        credentials.accessToken,
        questionId,
        selectedOption
      );

      setAttempt((previous) => ({
        ...previous,
        questions: previous.questions.map((item) =>
          item.questionId === questionId
            ? {
                ...item,
                selectedOption: response.selectedOption,
              }
            : item
        ),
      }));

      synchronizeClock(response.serverTime);

      setPendingAnswer(null);
      setSaveError("");
    } catch (error) {
      setSaveError(
        "Answer could not be confirmed as saved. " +
        "Check your connection and retry."
      );

      toast.error(getErrorMessage(error));

      // Verify whether the server saved the answer
      // even though the original response failed.
      try {
        const response = await getAttempt(
          credentials.attemptId,
          credentials.accessToken
        );

        if (response.attempt.status !== "in-progress") {
          navigate(`/quiz/${quizId}/submitted`, {
            replace: true,
          });

          return;
        }

        setAttempt(response.attempt);
        synchronizeClock(response.serverTime);

        const savedQuestion = response.attempt.questions.find(
          (item) => item.questionId === questionId
        );

        if (savedQuestion?.selectedOption === selectedOption) {
          setPendingAnswer(null);
          setSaveError("");
        }
      } catch {
        // Retain the pending answer for manual retry.
      }
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  // Handle selection from the current question
  const handleSelectAnswer = async (selectedOption) => {
    if (
      !attempt ||
      !credentials ||
      isExpired ||
      savingRef.current ||
      submittingRef.current ||
      pendingAnswer
    ) {
      return;
    }

    const question = attempt.questions[currentIndex];

    if (question.selectedOption === selectedOption) {
      return;
    }

    await persistAnswer(
      question.questionId,
      selectedOption
    );
  };

  // Manual and automatic submission
  const handleSubmit = async () => {
    if (
      !credentials ||
      submittingRef.current ||
      savingRef.current ||
      (!isExpired && pendingAnswer)
    ) {
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmissionError("");

    try {
      await submitAttempt(
        credentials.attemptId,
        credentials.accessToken
      );

      setConfirmOpen(false);

      navigate(`/quiz/${quizId}/submitted`, {
        replace: true,
      });
    } catch (error) {
      setSubmissionError(getErrorMessage(error));

      toast.error(
        "Submission could not be confirmed. Please retry."
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  // Submit automatically when time expires
  useEffect(() => {
    if (
      !attempt ||
      !credentials ||
      !isExpired ||
      saving ||
      submitting ||
      autoSubmitRef.current
    ) {
      return;
    }

    autoSubmitRef.current = true;

    handleSubmit();
  }, [
    attempt,
    credentials,
    isExpired,
    saving,
    submitting,
  ]);

  if (loading) {
    return <Loader message="Loading your examination..." />;
  }

  if (error || !attempt) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-xl border bg-white p-6 text-center">
          <AlertCircle
            size={40}
            className="mx-auto text-red-500"
          />

          <h1 className="mt-4 text-xl font-semibold">
            Unable to Load Attempt
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "Attempt not found"}
          </p>

          <Button
            className="mt-5 w-full"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>

          <Link
            to={`/quiz/${quizId}`}
            className="mt-4 inline-block text-sm text-blue-600"
          >
            Return to Quiz
          </Link>
        </div>
      </main>
    );
  }

  const questions = attempt.questions;

  const currentQuestion = questions[currentIndex];

  const answered = questions.filter(
    (question) => question.selectedOption !== null
  ).length;

  const disabled =
    saving ||
    submitting ||
    isExpired ||
    !isOnline ||
    Boolean(pendingAnswer);

  return (
    <main className="min-h-dvh bg-slate-50">

      {/* Examination header */}

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">

          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden rounded-xl bg-blue-600 p-2.5 text-white sm:block">
              <GraduationCap size={24} />
            </div>

            <div className="min-w-0">
              <h1 className="font-semibold">
                Online Examination
              </h1>

              <p className="truncate text-xs text-slate-500">
                {attempt.studentName} · {attempt.rollNumber}
              </p>
            </div>
          </div>

          <Timer
            formattedTime={formattedTime}
            remainingSeconds={remainingSeconds}
          />
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">

        {!isOnline && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle size={20} className="shrink-0" />

            <div>
              <p className="font-semibold">
                Internet Connection Lost
              </p>

              <p className="mt-1">
                Reconnect to the internet to continue saving
                answers. Your examination timer is still running.
              </p>
            </div>
          </div>
        )}

        {/* Save status */}

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">

          <p className="text-slate-500">
            {answered} of {questions.length} answered
          </p>

          {saving ? (
            <span className="flex items-center gap-2 text-blue-600">
              <Loader2
                size={16}
                className="animate-spin"
              />
              Saving answer...
            </span>
          ) : saveError ? (
            <span className="flex items-center gap-2 text-red-600">
              <AlertCircle size={16} />
              Save not confirmed
            </span>
          ) : (
            <span className="flex items-center gap-2 text-green-600">
              <CheckCircle2 size={16} />
              All answers saved
            </span>
          )}
        </div>

        {saveError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{saveError}</p>

            {pendingAnswer && !isExpired && (
              <Button
                className="mt-3"
                disabled={!isOnline || saving || submitting}
                loading={saving}
                onClick={() =>
                  persistAnswer(
                    pendingAnswer.questionId,
                    pendingAnswer.selectedOption
                  )
                }
              >
                Retry Saving Answer
              </Button>
            )}

            {pendingAnswer && isExpired && (
              <p className="mt-2">
                Time has expired. Only answers received by
                the server before the deadline will be graded.
              </p>
            )}
          </div>
        )}

        {/* Time expired */}

        {isExpired && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h2 className="font-semibold text-red-800">
              Time Is Up
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {submitting
                ? "Submitting your examination..."
                : "Your examination time has ended."}
            </p>

            {submissionError && (
              <>
                <p className="mt-2 text-sm text-red-700">
                  {submissionError}
                </p>

                <Button
                  className="mt-4"
                  loading={submitting}
                  onClick={handleSubmit}
                >
                  Retry Submission
                </Button>
              </>
            )}
          </div>
        )}

        <div className="grid items-start gap-5 lg:grid-cols-[1fr_320px]">

          {/* Question panel */}

          <div className="space-y-4">
            <QuestionCard
              question={currentQuestion}
              index={currentIndex}
              total={questions.length}
              disabled={disabled}
              onSelect={handleSelectAnswer}
            />

            <div className="flex justify-between gap-3">
              <Button
                variant="secondary"
                disabled={currentIndex === 0}
                onClick={() =>
                  setCurrentIndex((index) => index - 1)
                }
              >
                <ArrowLeft size={17} />
                Previous
              </Button>

              {currentIndex < questions.length - 1 ? (
                <Button
                  onClick={() =>
                    setCurrentIndex((index) => index + 1)
                  }
                >
                  Next
                  <ArrowRight size={17} />
                </Button>
              ) : (
                <Button
                  disabled={disabled}
                  onClick={() => setConfirmOpen(true)}
                >
                  Finish Quiz
                  <Send size={17} />
                </Button>
              )}
            </div>
          </div>

          {/* Question navigator */}

          <aside className="space-y-4 lg:sticky lg:top-28">
            <QuestionNavigator
              questions={questions}
              currentIndex={currentIndex}
              onNavigate={setCurrentIndex}
            />

            <Button
              className="w-full"
              disabled={disabled}
              loading={submitting}
              onClick={() => setConfirmOpen(true)}
            >
              <Send size={17} />
              Submit Quiz
            </Button>

            <p className="text-center text-xs text-slate-500">
              Your examination will automatically submit
              when the timer expires.
            </p>
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen && !isExpired}
        title="Submit Examination?"
        description={`You have answered ${answered} out of ${questions.length} questions. ${questions.length - answered} questions remain unanswered. Once submitted, you cannot modify your answers.`}
        confirmText="Submit Quiz"
        variant="primary"
        loading={submitting}
        onConfirm={handleSubmit}
        onClose={() => setConfirmOpen(false)}
      />
    </main>
  );
}