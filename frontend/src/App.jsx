import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

import DashboardLayout from "./layouts/DashboardLayout.jsx";

import AdminDashboard from "./pages/dashboards/AdminDashboard.jsx";
import TeacherDashboard from "./pages/dashboards/TeacherDashboard.jsx";
import StudentDashboard from "./pages/dashboards/StudentDashboard.jsx";
import AnalystDashboard from "./pages/dashboards/AnalystDashboard.jsx";

import Students from "./pages/management/Students.jsx";
import Teachers from "./pages/management/Teachers.jsx";
import Courses from "./pages/management/Courses.jsx";
import Attendance from "./pages/management/Attendance.jsx";
import Results from "./pages/management/Results.jsx";


import Departments from "./pages/management/Departments.jsx";

import DataIngestion from "./pages/bigdata/DataIngestion.jsx";
import HDFSStorage from "./pages/bigdata/HDFSStorage.jsx";
import SparkProcessing from "./pages/bigdata/SparkProcessing.jsx";

import LiveView from "./pages/realtime/LiveView.jsx";
import MLHub from "./pages/ml/MLHub.jsx";
import AnalyticsDashboard from "./pages/analytics/AnalyticsDashboard.jsx";

import Reports from "./pages/utilities/Reports.jsx";
import Notifications from "./pages/utilities/Notifications.jsx";
import Support from "./pages/utilities/Support.jsx";
import Settings from "./pages/utilities/Settings.jsx";

function RequireAuth({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;s
}

function RequireRole({ roles, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <HomeRedirect />;
  }

  return children;
}

function HomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "Admin":
      return <Navigate to="/app/admin" replace />;

    case "Teacher":
      return <Navigate to="/app/teacher" replace />;

    case "Student":
      return <Navigate to="/app/student" replace />;

    case "Analyst":
      return <Navigate to="/app/analyst" replace />;

    default:
      return <Navigate to="/login" replace />;
  }
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>

      <Route path="/" element={<HomeRedirect />} />

            
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

      

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/app"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >

        <Route
          path="admin"
          element={
            <RequireRole roles={["Admin"]}>
              <AdminDashboard />
            </RequireRole>
          }
        />

        <Route
          path="teacher"
          element={
            <RequireRole roles={["Teacher"]}>
              <TeacherDashboard />
            </RequireRole>
          }
        />

        <Route
          path="student"
          element={
            <RequireRole roles={["Student"]}>
              <StudentDashboard />
            </RequireRole>
          }
        />

        <Route
          path="analyst"
          element={
            <RequireRole roles={["Analyst"]}>
              <AnalystDashboard />
            </RequireRole>
          }
        />

        <Route
          path="students"
          element={
            <RequireRole roles={["Admin", "Teacher"]}>
              <Students />
            </RequireRole>
          }
        />

        <Route
          path="teachers"
          element={
            <RequireRole roles={["Admin"]}>
              <Teachers />
            </RequireRole>
          }
        />

        <Route
          path="courses"
          element={
            <RequireRole roles={["Admin", "Teacher"]}>
              <Courses />
            </RequireRole>
          }
        />
       

        <Route
          path="results"
          element={
            <RequireRole roles={["Admin", "Teacher"]}>
              <Results />
            </RequireRole>
          }
        />

         <Route
          path="attendance"
          element={
            <RequireRole roles={["Admin", "Teacher"]}>
              <Attendance />
            </RequireRole>
          }
        />

        <Route
          path="departments"
          element={
            <RequireRole roles={["Admin"]}>
              <Departments />
            </RequireRole>
          }
        />

        <Route
          path="ingestion"
          element={
            <RequireRole roles={["Admin", "Analyst"]}>
              <DataIngestion />
            </RequireRole>
          }
        />

        <Route
          path="hdfs"
          element={
            <RequireRole roles={["Admin", "Analyst"]}>
              <HDFSStorage />
            </RequireRole>
          }
        />

        <Route
          path="spark"
          element={
            <RequireRole roles={["Admin", "Analyst"]}>
              <SparkProcessing />
            </RequireRole>
          }
        />

        <Route
          path="live"
          element={
            <RequireRole roles={["Admin", "Analyst"]}>
              <LiveView />
            </RequireRole>
          }
        />

        <Route
          path="ml"
          element={
            <RequireRole roles={["Admin", "Teacher", "Analyst"]}>
              <MLHub />
            </RequireRole>
          }
        />

        <Route
          path="analytics"
          element={
            <RequireRole roles={["Admin", "Teacher", "Analyst"]}>
              <AnalyticsDashboard />
            </RequireRole>
          }
        />

        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="support" element={<Support />} />
        <Route path="settings" element={<Settings />} />

      </Route>

      <Route path="*" element={<HomeRedirect />} />

    </Routes>
  );
}





// export default function App() {
//   return (
//     <h1>Hello EduPredict</h1>
//   );
// }