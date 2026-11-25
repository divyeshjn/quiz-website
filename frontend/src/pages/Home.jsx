import { Link } from "react-router-dom";

import {
  GraduationCap,
  ClipboardCheck,
  ShieldCheck,
  BarChart3,
  ArrowRight,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";

const features = [
  {
    icon: ClipboardCheck,
    title: "Online Assessments",
    description:
      "Attempt scheduled quizzes through a simple and accessible interface.",
  },
  {
    icon: ShieldCheck,
    title: "Randomized Questions",
    description:
      "Individual question papers generated from a shared question pool.",
  },
  {
    icon: BarChart3,
    title: "Instant Evaluation",
    description:
      "Automatic grading and detailed performance analytics for teachers.",
  },
];

export default function Home() {
  return (
    <div className="min-h-dvh">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <section className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <GraduationCap size={36} />
          </div>

          <div className="mb-5 inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700">
            Online Examination Platform
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Assessments made{" "}
            <span className="text-blue-600">
              simple.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
            Create quizzes, conduct assessments,
            and evaluate student performance
            from one platform.
          </p>

          <Link
            to="/teacher/login"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Teacher Portal
            <ArrowRight size={17} />
          </Link>
        </section>

        <section className="mt-16 grid gap-5 md:grid-cols-3">
          {features.map(
            ({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200 bg-white p-6"
              >
                <div className="mb-4 inline-flex rounded-lg bg-blue-50 p-3 text-blue-600">
                  <Icon size={24} />
                </div>

                <h2 className="font-semibold">
                  {title}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {description}
                </p>
              </div>
            )
          )}
        </section>

        <section className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-6 text-center">
          <h2 className="font-semibold text-blue-900">
            Are you a student?
          </h2>

          <p className="mt-2 text-sm text-blue-700">
            Open the quiz link shared by your
            teacher to begin your assessment.
            No account registration is required.
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-400">
        Quiz Portal · Online Examination Platform
      </footer>
    </div>
  );
}