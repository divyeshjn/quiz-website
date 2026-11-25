import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  Plus,
  Upload,
  Download,
  ListChecks,
  Target,
  Award,
  Search,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getQuizById,
  publishQuiz,
} from "../../api/quiz.api";

import {
  getQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  uploadQuestions,
} from "../../api/question.api";

import {
  getErrorMessage,
} from "../../utils/error";

import {
  getQuizStatus,
} from "../../utils/format";

import {
  downloadCSVTemplate,
} from "../../utils/csv";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import QuestionForm from "../../components/teacher/QuestionForm";
import QuestionCard from "../../components/teacher/QuestionCard";
import CSVUploadModal from "../../components/teacher/CSVUploadModal";

export default function ManageQuestions() {
  const { quizId } = useParams();

  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [questionForm, setQuestionForm] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadErrors, setUploadErrors] = useState([]);

  const [dialog, setDialog] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch quiz and question pool
  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [quizResponse, questionResponse] =
        await Promise.all([
          getQuizById(quizId),
          getQuestions(quizId),
        ]);

      setQuiz(quizResponse.quiz);
      setQuestions(questionResponse.questions || []);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quizId]);

  const isDraft = quiz?.status === "draft";

  const requiredQuestions = quiz?.questionCount || 0;

  const totalMarks =
    requiredQuestions * (quiz?.marksPerQuestion || 0);

  const enoughQuestions =
    requiredQuestions > 0 &&
    questions.length >= requiredQuestions;

  const progress =
    requiredQuestions > 0
      ? Math.min(
          (questions.length / requiredQuestions) * 100,
          100
        )
      : 0;

  // Search questions
  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return questions
      .map((question, index) => ({
        question,
        index,
      }))
      .filter(({ question }) =>
        question.questionText.toLowerCase().includes(query) ||
        question.options.some((option) =>
          option.toLowerCase().includes(query)
        )
      );
  }, [questions, search]);

  // Add or update question
  const handleSaveQuestion = async (data) => {
    setActionLoading(true);

    try {
      if (questionForm?.question) {
        const response = await updateQuestion(
          quizId,
          questionForm.question._id,
          data
        );

        setQuestions((previous) =>
          previous.map((question) =>
            question._id === response.question._id
              ? response.question
              : question
          )
        );

        toast.success("Question updated successfully");
      } else {
        const response = await addQuestion(
          quizId,
          data
        );

        setQuestions((previous) => [
          ...previous,
          response.question,
        ]);

        toast.success("Question added successfully");
      }

      setQuestionForm(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  // Upload CSV
  const handleUpload = async (file) => {
    setActionLoading(true);
    setUploadErrors([]);

    try {
      const response = await uploadQuestions(
        quizId,
        file
      );

      toast.success(
        `${response.uploadedCount} questions uploaded successfully`
      );

      setUploadOpen(false);

      await fetchData();
    } catch (error) {
      const validationErrors =
        error.response?.data?.errors;

      if (Array.isArray(validationErrors)) {
        setUploadErrors(validationErrors);
      }

      toast.error(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  // Delete question or publish quiz
  const handleConfirm = async () => {
    if (!dialog) return;

    setActionLoading(true);

    try {
      if (dialog.type === "delete") {
        await deleteQuestion(
          quizId,
          dialog.question._id
        );

        setQuestions((previous) =>
          previous.filter(
            (question) =>
              question._id !== dialog.question._id
          )
        );

        toast.success("Question deleted successfully");
      }

      if (dialog.type === "publish") {
        await publishQuiz(quizId);

        toast.success("Quiz published successfully");

        setDialog(null);

        navigate("/teacher/dashboard");

        return;
      }

      setDialog(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  // Copy quiz link
  const handleCopyLink = async () => {
    const link =
      `${window.location.origin}/quiz/${quizId}`;

    try {
      await navigator.clipboard.writeText(link);

      toast.success("Quiz link copied");
    } catch {
      window.prompt("Copy this quiz link:", link);
    }
  };

  if (loading) {
    return <Loader message="Loading question pool..." />;
  }

  if (error || !quiz) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">
          {error || "Quiz not found"}
        </p>

        <Button
          variant="secondary"
          className="mt-4"
          onClick={fetchData}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}

      <Link
        to="/teacher/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Page heading */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold sm:text-3xl">
              {quiz.title}
            </h1>

            <StatusBadge status={getQuizStatus(quiz)} />
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {quiz.subject} · Question Management
          </p>
        </div>

        {isDraft ? (
          <Button
            disabled={!enoughQuestions || actionLoading}
            onClick={() =>
              setDialog({ type: "publish" })
            }
          >
            <Send size={17} />
            Publish Quiz
          </Button>
        ) : (
          <Button onClick={handleCopyLink}>
            <Copy size={17} />
            Copy Quiz Link
          </Button>
        )}
      </div>

      {/* Statistics */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Question Pool"
          value={questions.length}
          icon={ListChecks}
          color="blue"
        />

        <StatCard
          title="Questions per Student"
          value={requiredQuestions}
          icon={Target}
          color="amber"
        />

        <StatCard
          title="Total Quiz Marks"
          value={totalMarks}
          icon={Award}
          color="green"
        />
      </section>

      {/* Question pool readiness */}

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">
            Question Pool Readiness
          </h2>

          {enoughQuestions ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
              <CheckCircle2 size={17} />
              Enough questions
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
              <AlertCircle size={17} />
              More questions required
            </span>
          )}
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            style={{ width: `${progress}%` }}
            className={`h-full rounded-full transition-all ${
              enoughQuestions
                ? "bg-green-500"
                : "bg-blue-500"
            }`}
          />
        </div>

        <p className="mt-3 text-sm text-slate-500">
          {questions.length} questions available.
          {" "}
          {requiredQuestions} questions required per student.
        </p>

        {!enoughQuestions && (
          <p className="mt-2 text-sm text-amber-600">
            Add at least{" "}
            {requiredQuestions - questions.length}
            {" "}more questions before publishing.
          </p>
        )}
      </section>

      {/* Published quiz warning */}

      {!isDraft && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          <AlertCircle
            size={19}
            className="shrink-0"
          />

          This quiz has been published. Its questions
          are now read-only and cannot be modified.
        </div>
      )}

      {/* Question actions */}

      {isDraft && (
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              setQuestionForm({ question: null })
            }
          >
            <Plus size={18} />
            Add Question
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              setUploadErrors([]);
              setUploadOpen(true);
            }}
          >
            <Upload size={17} />
            Upload CSV
          </Button>

          <Button
            variant="secondary"
            onClick={downloadCSVTemplate}
          >
            <Download size={17} />
            CSV Template
          </Button>
        </div>
      )}

      {/* Question list heading */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">
            Question Pool
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Showing {filteredQuestions.length} of{" "}
            {questions.length} questions
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            aria-label="Search questions"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search questions..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Question cards */}

      {filteredQuestions.length === 0 ? (
        <EmptyState
          title={
            questions.length === 0
              ? "No questions added yet"
              : "No matching questions"
          }
          description={
            questions.length === 0
              ? "Add questions manually or upload a CSV file."
              : "Try searching with a different keyword."
          }
          action={
            questions.length === 0 && isDraft ? (
              <Button
                onClick={() =>
                  setQuestionForm({ question: null })
                }
              >
                <Plus size={17} />
                Add First Question
              </Button>
            ) : search ? (
              <Button
                variant="secondary"
                onClick={() => setSearch("")}
              >
                Clear Search
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map(({ question, index }) => (
            <QuestionCard
              key={question._id}
              question={question}
              index={index}
              editable={isDraft}
              onEdit={(question) =>
                setQuestionForm({ question })
              }
              onDelete={(question) =>
                setDialog({
                  type: "delete",
                  question,
                })
              }
            />
          ))}
        </div>
      )}

      {/* Add/edit question modal */}

      {questionForm && (
        <QuestionForm
          question={questionForm.question}
          loading={actionLoading}
          onSubmit={handleSaveQuestion}
          onClose={() => setQuestionForm(null)}
        />
      )}

      {/* CSV upload modal */}

      {uploadOpen && (
        <CSVUploadModal
          loading={actionLoading}
          errors={uploadErrors}
          onUpload={handleUpload}
          onClose={() => {
            setUploadOpen(false);
            setUploadErrors([]);
          }}
        />
      )}

      {/* Confirmation modal */}

      <ConfirmDialog
        open={Boolean(dialog)}
        title={
          dialog?.type === "delete"
            ? "Delete Question?"
            : "Publish Quiz?"
        }
        description={
          dialog?.type === "delete"
            ? "Are you sure you want to permanently delete this question?"
            : "Once published, the quiz settings and question pool cannot be edited. Students will be able to attempt the quiz during its scheduled time window."
        }
        confirmText={
          dialog?.type === "delete"
            ? "Delete Question"
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