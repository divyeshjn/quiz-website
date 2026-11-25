import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoutes";
import TeacherLayout from "./components/layout/TeacherLayout";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

import TeacherLogin from "./pages/teacher/TeacherLogin";
import Dashboard from "./pages/teacher/Dashboard";
import CreateQuiz from "./pages/teacher/CreateQuiz";
import ManageQuestions from "./pages/teacher/ManageQuestions";
import Results from "./pages/teacher/Results";

import JoinQuiz from "./pages/student/JoinQuiz";
import AttemptQuiz from "./pages/student/AttemptQuiz";
import Submitted from "./pages/student/Submitted";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontSize: "14px",
              borderRadius: "10px",
            },
          }}
        />

        <Routes>
          {/* Public routes */}

          <Route path="/" element={<Home />} />

          <Route
            path="/teacher/login"
            element={<TeacherLogin />}
          />

          {/* Student routes */}

          <Route
            path="/quiz/:quizId"
            element={<JoinQuiz />}
          />

          <Route
            path="/quiz/:quizId/attempt"
            element={<AttemptQuiz />}
          />

          <Route
            path="/quiz/:quizId/submitted"
            element={<Submitted />}
          />

          {/* Protected teacher routes */}

          <Route element={<ProtectedRoute />}>
            <Route
              path="/teacher"
              element={<TeacherLayout />}
            >
              <Route
                index
                element={
                  <Navigate to="dashboard" replace />
                }
              />

              <Route
                path="dashboard"
                element={<Dashboard />}
              />

              <Route
                path="quizzes/create"
                element={<CreateQuiz />}
              />

              <Route
                path="quizzes/:quizId/edit"
                element={<CreateQuiz />}
              />

              <Route
                path="quizzes/:quizId/questions"
                element={<ManageQuestions />}
              />

              <Route
                path="quizzes/:quizId/results"
                element={<Results />}
              />
            </Route>
          </Route>

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}