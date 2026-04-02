import { Link, NavLink, useLocation } from "react-router-dom";

const Sidebar = ({ role }) => {
  const location = useLocation();

  const linksByRole = {
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

  const navLinks = linksByRole[role] || [];
  const isAdminRecentActivityActive = location.pathname === "/recent-activity";

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white/95 px-5 py-6 backdrop-blur lg:block">
      <div className="mb-10">
        <div className="inline-flex items-center rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white">
          SMS
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
          Student Management
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Clean, role-based control center for school operations.
        </p>
      </div>

      <nav className="space-y-2">
        {navLinks.map((link) => (
          link.to === "/recent-activity" ? (
            <Link
              key={link.to}
              to={link.to}
              style={isAdminRecentActivityActive ? { color: "#ffffff" } : undefined}
              className={[
                "flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition",
                isAdminRecentActivityActive
                  ? "bg-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")}
            >
              {link.label}
            </Link>
          ) : (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === `/${role}`}
              style={({ isActive }) => (isActive ? { color: "#ffffff" } : undefined)}
              className={({ isActive }) =>
                [
                  "flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-slate-900 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")
              }
            >
              {link.label}
            </NavLink>
          )
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
