import { useEffect, useState } from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  CheckCircle2,
  GraduationCap,
  AlertCircle,
  Clock,
} from "lucide-react";

import { getAttempt } from "../../api/attempt.api";

import {
  getStoredAttempt,
} from "../../utils/attemptStorage";

import { getErrorMessage } from "../../utils/error";
import { formatDateTime } from "../../utils/format";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

export default function Submitted() {
  const { quizId } = useParams();

  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const verifySubmission = async () => {
      const stored = getStoredAttempt(quizId);

      if (!stored) {
        if (active) {
          setError("No examination attempt found");
          setLoading(false);
        }

        return;
      }

      try {
        const response = await getAttempt(
          stored.attemptId,
          stored.accessToken
        );

        if (!active) return;

        if (response.attempt.status === "in-progress") {
          navigate(`/quiz/${quizId}/attempt`, {
            replace: true,
          });

          return;
        }

        setAttempt(response.attempt);
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

    verifySubmission();

    return () => {
      active = false;
    };
  }, [quizId, navigate]);

  if (loading) {
    return <Loader message="Verifying submission..." />;
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg">

        <div className="mb-6 flex items-center justify-center gap-2">
          <GraduationCap
            size={30}
            className="text-blue-600"
          />

          <span className="text-xl font-bold">
            Quiz Portal
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">

          {error ? (
            <>
              <AlertCircle
                size={56}
                className="mx-auto text-red-500"
              />

              <h1 className="mt-5 text-xl font-bold">
                Submission Could Not Be Verified
              </h1>

              <p className="mt-3 text-sm text-slate-500">
                {error}
              </p>

              <Button
                className="mt-6 w-full"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2
                  size={44}
                  className="text-green-600"
                />
              </div>

              <h1 className="mt-5 text-2xl font-bold">
                Quiz Submitted Successfully!
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Your responses have been recorded.
                Your teacher will be able to view your
                examination results.
              </p>

              {attempt.status === "auto-submitted" && (
                <div className="mt-5 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-left text-sm text-amber-700">
                  <Clock
                    size={18}
                    className="shrink-0"
                  />

                  Your quiz was automatically submitted
                  when the examination time expired.
                </div>
              )}

              <div className="mt-6 space-y-4 rounded-xl bg-slate-50 p-5 text-left text-sm">

                {[
                  ["Student Name", attempt.studentName],
                  ["Roll Number", attempt.rollNumber],
                  ["Email", attempt.email],
                  [
                    "Submitted At",
                    formatDateTime(attempt.submittedAt),
                  ],
                  ["Status", "Submitted"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-wrap justify-between gap-2"
                  >
                    <span className="text-slate-500">
                      {label}
                    </span>

                    <span className="break-all font-medium">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-xs text-slate-400">
                You can safely close this page.
                No further action is required.
              </p>
            </>
          )}

          <Link
            to="/"
            className="mt-6 inline-flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
}