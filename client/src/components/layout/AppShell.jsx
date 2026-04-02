import { Link, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppShell = () => {
  const { user, clearAuth } = useAuthStore();

  const mobileLinksByRole = {
    admin: [
      { label: "Dashboard", to: "/admin" },
      { label: "Recent Activity", to: "/recent-activity" },
      { label: "Users", to: "/admin/users" },
      { label: "Classes", to: "/admin/classes" },
      { label: "Announcements", to: "/admin/announcements" },
    ],
    teacher: [
      { label: "Dashboard", to: "/teacher" },
      { label: "My Classes", to: "/teacher/classes" },
      { label: "Attendance", to: "/teacher/attendance" },
      { label: "Grades", to: "/teacher/grades" },
    ],
    student: [
      { label: "Dashboard", to: "/student" },
      { label: "Profile", to: "/student/profile" },
      { label: "Attendance", to: "/student/attendance" },
      { label: "Grades", to: "/student/grades" },
      { label: "Announcements", to: "/student/announcements" },
    ],
  };

  const mobileLinks = mobileLinksByRole[user?.role] || [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.18),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar role={user?.role} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar user={user} onLogout={clearAuth} />

          <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {mobileLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
