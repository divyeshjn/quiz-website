import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  Plus,
  Search,
  ClipboardList,
  Activity,
  FileText,
  CalendarClock,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getAllQuizzes,
  deleteQuiz,
  publishQuiz,
} from "../../api/quiz.api";

import {
  formatDateTime,
  getQuizStatus,
} from "../../utils/format";

import { getErrorMessage } from "../../utils/error";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import StatCard from "../../components/common/StatCard";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import QuizActions from "../../components/teacher/QuizActions";

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [now, setNow] = useState(Date.now());

  const [dialog, setDialog] = useState(null);
  const [actionLoading, setActionLoading] =
    useState(false);

  // Fetch quizzes from backend
  const fetchQuizzes = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAllQuizzes();

      setQuizzes(response.quizzes || []);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();

    // Refresh displayed quiz statuses every second
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate current availability
  const quizzesWithStatus = useMemo(() => {
    return quizzes.map((quiz) => ({
      ...quiz,
      displayStatus: getQuizStatus(quiz, now),
    }));
  }, [quizzes, now]);

  // Dashboard statistics
  const statistics = useMemo(() => {
    return {
      total: quizzesWithStatus.length,

      active: quizzesWithStatus.filter(
        (quiz) => quiz.displayStatus === "open"
      ).length,

      upcoming: quizzesWithStatus.filter(
        (quiz) => quiz.displayStatus === "upcoming"
      ).length,

      draft: quizzesWithStatus.filter(
        (quiz) => quiz.displayStatus === "draft"
      ).length,

      closed: quizzesWithStatus.filter(
        (quiz) => quiz.displayStatus === "closed"
      ).length,
    };
  }, [quizzesWithStatus]);

  // Search and filter quizzes
  const filteredQuizzes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return quizzesWithStatus.filter((quiz) => {
      const matchesSearch =
        quiz.title.toLowerCase().includes(query) ||
        quiz.subject.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        quiz.displayStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quizzesWithStatus, search, statusFilter]);

  // Open delete confirmation
  const handleDelete = (quiz) => {
    setDialog({
      type: "delete",
      quiz,
    });
  };

  // Open publish confirmation
  const handlePublish = (quiz) => {
    setDialog({
      type: "publish",
      quiz,
    });
  };

  // Execute selected action
  const handleConfirm = async () => {
    if (!dialog) return;

    setActionLoading(true);

    try {
      if (dialog.type === "delete") {
        await deleteQuiz(dialog.quiz._id);

        toast.success("Quiz deleted successfully");
      }

      if (dialog.type === "publish") {
        await publishQuiz(dialog.quiz._id);

        toast.success("Quiz published successfully");
      }

      setDialog(null);

      await fetchQuizzes();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  // Copy student-facing quiz URL
  const handleCopyLink = async (quiz) => {
    const link =
      `${window.location.origin}/quiz/${quiz._id}`;

    try {
      await navigator.clipboard.writeText(link);

      toast.success("Quiz link copied");
    } catch {
      window.prompt("Copy this quiz link:", link);
    }
  };

  if (loading) {
    return <Loader message="Loading your quizzes..." />;
  }

  return (
    <div className="space-y-7">
      {/* Page heading */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and monitor your assessments.
          </p>
        </div>

        <Link
          to="/teacher/quizzes/create"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Quiz
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-2 font-medium text-red-700">
            <AlertCircle size={20} />
            Unable to load quizzes
          </div>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <Button
            variant="secondary"
            className="mt-4"
            onClick={fetchQuizzes}
          >
            <RefreshCw size={16} />
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {/* Statistics */}

          <section className="grid grid-cols-2 gap-4 xl:grid-cols-5">
            <StatCard
              title="Total Quizzes"
              value={statistics.total}
              icon={ClipboardList}
              color="blue"
            />

            <StatCard
              title="Active Quizzes"
              value={statistics.active}
              icon={Activity}
              color="green"
            />

            <StatCard
              title="Upcoming"
              value={statistics.upcoming}
              icon={CalendarClock}
              color="amber"
            />

            <StatCard
              title="Draft Quizzes"
              value={statistics.draft}
              icon={FileText}
              color="slate"
            />

            <StatCard
              title="Closed Quizzes"
              value={statistics.closed}
              icon={CheckCircle2}
              color="red"
            />
          </section>

          {/* Quiz management */}

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  My Quizzes
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredQuizzes.length} of {quizzes.length} quizzes
                </p>
              </div>

              <Button
                variant="secondary"
                onClick={fetchQuizzes}
              >
                <RefreshCw size={16} />
                Refresh
              </Button>
            </div>

            {/* Search and filter */}

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  aria-label="Search quizzes"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search by quiz title or subject..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <select
                aria-label="Filter quizzes by status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 sm:w-48"
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="upcoming">Upcoming</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Empty state */}

            {filteredQuizzes.length === 0 ? (
              <EmptyState
                title={
                  quizzes.length === 0
                    ? "No quizzes yet"
                    : "No matching quizzes"
                }
                description={
                  quizzes.length === 0
                    ? "Create your first quiz to get started."
                    : "Try a different search or status filter."
                }
                action={
                  quizzes.length === 0 ? (
                    <Link
                      to="/teacher/quizzes/create"
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white"
                    >
                      <Plus size={17} />
                      Create Quiz
                    </Link>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )
                }
              />
            ) : (
              <div className="space-y-3">
                {filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="rounded-xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="wrap-break-words font-semibold text-slate-900">
                          {quiz.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {quiz.subject}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <StatusBadge
                          status={quiz.displayStatus}
                        />

                        <QuizActions
                          quiz={quiz}
                          onDelete={handleDelete}
                          onPublish={handlePublish}
                          onCopyLink={handleCopyLink}
                        />
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 lg:grid-cols-5">
                      <div>
                        <p className="text-xs text-slate-500">
                          Questions
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {quiz.questionCount}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Duration
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {quiz.duration} min
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Total Marks
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {quiz.questionCount *
                            quiz.marksPerQuestion}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Opens At
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {formatDateTime(quiz.startTime)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Closes At
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {formatDateTime(quiz.endTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Confirmation dialog */}

      <ConfirmDialog
        open={Boolean(dialog)}
        title={
          dialog?.type === "delete"
            ? "Delete Quiz?"
            : "Publish Quiz?"
        }
        description={
          dialog?.type === "delete"
            ? `Are you sure you want to delete "${dialog?.quiz.title}"? Its question pool will also be deleted. This action cannot be undone.`
            : `Publish "${dialog?.quiz.title}"? Once published, the quiz settings and questions cannot be edited. Students can attempt it during the scheduled time window.`
        }
        confirmText={
          dialog?.type === "delete"
            ? "Delete Quiz"
            : "Publish Quiz"
        }
        variant={
          dialog?.type === "delete"
            ? "danger"
            : "primary"
        }
        loading={actionLoading}
        onConfirm={handleConfirm}
        onClose={() => setDialog(null)}
      />
    </div>
  );
}