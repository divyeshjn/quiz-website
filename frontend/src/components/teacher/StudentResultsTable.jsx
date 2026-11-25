import { useMemo, useState } from "react";
import { Search, Eye, Users } from "lucide-react";

const statusStyles = {
  submitted: {
    label: "Submitted",
    color: "bg-green-100 text-green-700",
  },
  "auto-submitted": {
    label: "Auto-submitted",
    color: "bg-amber-100 text-amber-700",
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700",
  },
};

export default function StudentResultsTable({
  students = [],
  passingPercentage = 50,
  onViewResult,
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("rollNumber");

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = students.filter((student) => {
      const matchesSearch = [
        student.studentName,
        student.rollNumber,
        student.email,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query)
      );

      const matchesStatus =
        status === "all" ||
        student.status === status;

      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (sort === "highest") {
        return (
          (b.status === "in-progress" ? -1 : b.score) -
          (a.status === "in-progress" ? -1 : a.score)
        );
      }

      if (sort === "lowest") {
        return (
          (a.status === "in-progress" ? Infinity : a.score) -
          (b.status === "in-progress" ? Infinity : b.score)
        );
      }

      if (sort === "name") {
        return a.studentName.localeCompare(
          b.studentName
        );
      }

      return a.rollNumber.localeCompare(
        b.rollNumber,
        undefined,
        { numeric: true }
      );
    });
  }, [students, search, status, sort]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white">

      <div className="p-5">
        <h2 className="text-lg font-semibold">
          Individual Student Results
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Showing {filteredStudents.length} of{" "}
          {students.length} students
        </p>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search name, roll number or email..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            aria-label="Filter by submission status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="auto-submitted">
              Auto-submitted
            </option>
            <option value="in-progress">
              In Progress
            </option>
          </select>

          <select
            aria-label="Sort results"
            value={sort}
            onChange={(event) =>
              setSort(event.target.value)
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
          >
            <option value="rollNumber">
              Roll Number
            </option>
            <option value="name">Student Name</option>
            <option value="highest">
              Highest Marks
            </option>
            <option value="lowest">
              Lowest Marks
            </option>
          </select>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="border-t border-slate-100 p-12 text-center">
          <Users
            size={38}
            className="mx-auto text-slate-300"
          />

          <p className="mt-4 font-medium">
            No students found
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Results will appear here when students
            attempt the quiz.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {[
                  "Roll Number",
                  "Student",
                  "Marks",
                  "Percentage",
                  "Correct",
                  "Incorrect",
                  "Unanswered",
                  "Result",
                  "Status",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 font-semibold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const completed =
                  student.status !== "in-progress";

                const percentage = student.totalMarks
                  ? (student.score /
                      student.totalMarks) *
                    100
                  : 0;

                const passed =
                  percentage >= passingPercentage;

                const badge =
                  statusStyles[student.status] || {
                    label: student.status,
                    color: "bg-slate-100 text-slate-700",
                  };

                const attemptId =
                  student.attemptId ||
                  student.id ||
                  student._id;

                return (
                  <tr
                    key={attemptId}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 font-medium">
                      {student.rollNumber}
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium">
                        {student.studentName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {student.email}
                      </p>
                    </td>

                    <td className="px-4 py-4 font-bold">
                      {completed
                        ? `${student.score} / ${student.totalMarks}`
                        : "—"}
                    </td>

                    <td className="px-4 py-4">
                      {completed
                        ? `${percentage.toFixed(1)}%`
                        : "—"}
                    </td>

                    <td className="px-4 py-4 text-green-600">
                      {completed
                        ? student.correctAnswers
                        : "—"}
                    </td>

                    <td className="px-4 py-4 text-red-600">
                      {completed
                        ? student.incorrectAnswers
                        : "—"}
                    </td>

                    <td className="px-4 py-4 text-slate-500">
                      {completed
                        ? student.unanswered
                        : "—"}
                    </td>

                    <td className="px-4 py-4">
                      {completed ? (
                        <span
                          className={`font-medium ${
                            passed
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {passed ? "Pass" : "Fail"}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        disabled={!completed || !attemptId}
                        onClick={() =>
                          onViewResult(attemptId)
                        }
                        className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}