import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import StatCard from "../../components/layout/StatCard";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/admin/dashboard");
        setStats(data.stats);
        setRecentActivity(data.recentActivity || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (location.hash === "#recent-activity") {
      window.requestAnimationFrame(() => {
        document.getElementById("recent-activity")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [location.hash]);

  const getActivityCardClasses = () => {
    return "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700";
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/70">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Admin overview
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
          Control the entire school from one dashboard.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Monitor enrollment, manage staff, publish announcements, and keep classes moving without jumping between tools.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={loading ? "..." : stats?.totalStudents ?? 0} hint="Active learners enrolled across all grades." accent="blue" />
        <StatCard label="Total Teachers" value={loading ? "..." : stats?.totalTeachers ?? 0} hint="Teachers currently assigned to classes." accent="emerald" />
        <StatCard label="Active Classes" value={loading ? "..." : stats?.activeClasses ?? 0} hint="Live class groups running this term." accent="amber" />
        <StatCard label="Announcements" value={loading ? "..." : stats?.totalAnnouncements ?? 0} hint="Published notices visible to users." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div id="recent-activity" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
              <p className="mt-1 text-sm text-slate-500">Latest actions across the platform.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Live
              </span>
              <Link
                to="/recent-activity"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                See all
              </Link>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {recentActivity.length ? recentActivity.map((item) => (
              <div key={item.id} className={getActivityCardClasses(item.type)}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {item.type}
                  </span>
                </div>
                <p className="mt-2 text-slate-600">{item.detail}</p>
              </div>
            )) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                No recent activity yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
          <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
          <div className="mt-6 space-y-3">
            <Link
              to="/admin/classes"
              style={{ color: "#fff" }}
              className="block rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Create a new class
            </Link>
            <Link
              to="/admin/users"
              style={{ color: "#fff" }}
              className="block rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Add a teacher account
            </Link>
            <Link
              to="/admin/announcements"
              style={{ color: "#fff" }}
              className="block rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Post a campus announcement
            </Link>
            <Link
              to="/admin/classes"
              style={{ color: "#fff" }}
              className="block rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Review attendance reports
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
