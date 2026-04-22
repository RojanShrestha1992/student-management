import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import PublicRoute from "../components/auth/PublicRoute";
import AppShell from "../components/layout/AppShell";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminCrudPage from "../pages/admin/AdminCrudPage";
import RecentActivityPage from "../pages/admin/RecentActivityPage";
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import TeacherSectionPage from "../pages/teacher/SectionPage";
import UploadFilesPage from "../pages/teacher/UploadFilesPage";
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentSectionPage from "../pages/student/SectionPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route element={<ProtectedRoute allowedRoles={["admin", "teacher", "student"]} />}>
        <Route element={<AppShell />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/recent-activity" element={<RecentActivityPage />} />
          <Route
            path="/admin/users"
            element={
              <AdminCrudPage section="users" />
            }
          />
          <Route
            path="/admin/classes"
            element={
              <AdminCrudPage section="classes" />
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <AdminCrudPage section="announcements" />
            }
          />

          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route
            path="/teacher/classes"
            element={
              <TeacherSectionPage
                section="classes"
                title="My Classes"
                description="Review assigned classes and inspect the student roster for each section."
              />
            }
          />
          <Route
            path="/teacher/attendance"
            element={
              <TeacherSectionPage
                section="attendance"
                title="Attendance"
                description="Mark attendance and review historical attendance records for your classes."
              />
            }
          />
          <Route
            path="/teacher/grades"
            element={
              <TeacherSectionPage
                section="grades"
                title="Grades"
                description="Upload marks, update assessments, and keep grading records organized."
              />
            }
          />
          <Route path="/teacher/upload-files" element={<UploadFilesPage />} />

          <Route path="/student" element={<StudentDashboard />} />
          <Route
            path="/student/profile"
            element={
              <StudentSectionPage
                section="profile"
                title="Profile"
                description="View your own account and student record details in read-only mode."
              />
            }
          />
          <Route
            path="/student/attendance"
            element={
              <StudentSectionPage
                section="attendance"
                title="Attendance"
                description="Check your attendance history and term-level attendance status."
              />
            }
          />
          <Route
            path="/student/grades"
            element={
              <StudentSectionPage
                section="grades"
                title="Grades"
                description="Review report cards, assessment marks, and subject-level performance."
              />
            }
          />
          <Route
            path="/student/materials"
            element={
              <StudentSectionPage
                section="materials"
                title="Materials"
                description="Download assignments, question papers, and study resources shared by your teacher."
              />
            }
          />
          <Route
            path="/student/announcements"
            element={
              <StudentSectionPage
                section="announcements"
                title="Announcements"
                description="See the latest notices shared by the admin team."
              />
            }
          />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
