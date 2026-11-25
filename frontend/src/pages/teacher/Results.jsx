import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Download,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Users,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getResults,
  getAnalytics,
  getIndividualResult,
  downloadResults,
} from "../../api/result.api";

import { getErrorMessage } from "../../utils/error";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

import ResultStatCards from "../../components/teacher/ResultStatCards";
import ScoreDistribution from "../../components/teacher/ScoreDistribution";
import SubmissionChart from "../../components/teacher/SubmissionChart";
import StudentResultsTable from "../../components/teacher/StudentResultsTable";
import QuestionAnalytics from "../../components/teacher/QuestionAnalytics";
import StudentResultModal from "../../components/teacher/StudentResultModal";

export default function Results() {
  const { quizId } = useParams();

  const [results, setResults] = useState(null);
  const [analytics, setAnalytics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [error, setError] = useState("");
  const [analyticsError, setAnalyticsError] = useState("");

  const [passingPercentage, setPassingPercentage] =
    useState(50);

  const [activeTab, setActiveTab] =
    useState("students");

  const [modalOpen, setModalOpen] = useState(false);

  const [individualResult, setIndividualResult] =
    useState(null);

  const [individualLoading, setIndividualLoading] =
    useState(false);

  const [individualError, setIndividualError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);

  // Fetch results and analytics

  const fetchData = useCallback(
    async (signal) => {
      setRefreshing(true);
      setError("");
      setAnalyticsError("");

      try {
        const response = await getResults(
          quizId,
          passingPercentage
        );

        if (signal?.aborted) return;

        setResults(response);
        setLastUpdated(new Date());

        try {
          const analyticsResponse =
            await getAnalytics(quizId);

          if (signal?.aborted) return;

          const questionData =
            analyticsResponse.questionAnalytics ??
            analyticsResponse.analytics?.questionAnalytics ??
            analyticsResponse.analytics?.questions ??
            analyticsResponse.questions ??
            analyticsResponse.analytics ??
            [];

          if (!Array.isArray(questionData)) {
            setAnalytics([]);
            setAnalyticsError(
              "Unexpected question analytics response format"
            );
          } else {
            setAnalytics(questionData);
          }
        } catch (error) {
          if (!signal?.aborted) {
            setAnalytics([]);
            setAnalyticsError(
              getErrorMessage(error)
            );
          }
        }
      } catch (error) {
        if (!signal?.aborted) {
          setError(getErrorMessage(error));
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [quizId, passingPercentage]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchData(controller.signal);

    return () => controller.abort();
  }, [fetchData]);

  // Export results

  const handleExport = async () => {
    setExporting(true);

    try {
      await downloadResults(quizId);

      toast.success("Results downloaded successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setExporting(false);
    }
  };

  // View individual student result

  const handleViewResult = async (attemptId) => {
    setModalOpen(true);
    setIndividualLoading(true);
    setIndividualResult(null);
    setIndividualError("");

    try {
      const response = await getIndividualResult(
        quizId,
        attemptId
      );

      const detail =
        response.result ??
        response.attempt ??
        response.student ??
        response;

      setIndividualResult({
        ...detail,
        questions:
          detail.questions ??
          detail.assignedQuestions ??
          response.questions ??
          response.assignedQuestions ??
          [],
      });
    } catch (error) {
      setIndividualError(
        getErrorMessage(error)
      );
    } finally {
      setIndividualLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading quiz results..." />;
  }

  if (error || !results) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <AlertCircle
          size={25}
          className="text-red-600"
        />

        <h2 className="mt-3 font-semibold text-red-800">
          Unable to Load Results
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {error || "Results not available"}
        </p>

        <Button
          className="mt-4"
          variant="secondary"
          onClick={() => fetchData()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const quiz = results.quiz;
  const statistics = results.statistics || {};
  const students = results.students || [];

  const totalMarks =
    quiz?.totalMarks ??
    (quiz?.questionCount || 0) *
      (quiz?.marksPerQuestion || 0);

  return (
    <div className="space-y-6">

      {/* Back navigation */}

      <Link
        to="/teacher/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={17} />
        Back to Dashboard
      </Link>

      {/* Page heading */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Results & Analytics
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {quiz?.title} · {quiz?.subject}
          </p>

          {lastUpdated && (
            <p className="mt-2 text-xs text-slate-400">
              Last updated:{" "}
              {lastUpdated.toLocaleTimeString("en-IN")}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            disabled={refreshing}
            onClick={() => fetchData()}
          >
            <RefreshCw
              size={17}
              className={
                refreshing ? "animate-spin" : ""
              }
            />
            Refresh
          </Button>

          <Button
            loading={exporting}
            disabled={students.length === 0}
            onClick={handleExport}
          >
            <Download size={17} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Quiz configuration */}

      <div className="flex flex-wrap items-center gap-5 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <p className="text-xs text-slate-500">
            Total Marks
          </p>

          <p className="mt-1 font-semibold">
            {totalMarks}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Questions per Student
          </p>

          <p className="mt-1 font-semibold">
            {quiz?.questionCount ?? "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Duration
          </p>

          <p className="mt-1 font-semibold">
            {quiz?.duration ?? "—"} min
          </p>
        </div>

        <div className="sm:ml-auto">
          <label
            htmlFor="passingPercentage"
            className="block text-xs text-slate-500"
          >
            Passing Percentage
          </label>

          <select
            id="passingPercentage"
            value={passingPercentage}
            disabled={refreshing}
            onChange={(event) =>
              setPassingPercentage(
                Number(event.target.value)
              )
            }
            className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {[30, 33, 35, 40, 50, 60, 70, 75, 80].map(
              (percentage) => (
                <option
                  key={percentage}
                  value={percentage}
                >
                  {percentage}%
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Statistics */}

      <ResultStatCards
        statistics={statistics}
        totalMarks={totalMarks}
      />

      {/* Charts */}

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <ScoreDistribution students={students} />

        <SubmissionChart
          statistics={statistics}
        />
      </div>

      {/* Results tabs */}

      <div className="flex gap-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("students")}
          className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium ${
            activeTab === "students"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500"
          }`}
        >
          <Users size={17} />
          Student Results
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium ${
            activeTab === "analytics"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500"
          }`}
        >
          <BarChart3 size={17} />
          Question Analytics
        </button>
      </div>

      {activeTab === "students" ? (
        <StudentResultsTable
          students={students}
          passingPercentage={passingPercentage}
          onViewResult={handleViewResult}
        />
      ) : analyticsError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {analyticsError}
        </div>
      ) : (
        <QuestionAnalytics questions={analytics} />
      )}

      {/* Individual student result */}

      {modalOpen && (
        <StudentResultModal
          result={individualResult}
          loading={individualLoading}
          error={individualError}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}