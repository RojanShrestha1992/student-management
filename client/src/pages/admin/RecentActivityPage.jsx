import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

const RecentActivityPage = () => {
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const { data } = await api.get("/admin/dashboard");
        setRecentActivity(data.recentActivity || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load recent activity");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  const getActivityCardClasses = () => {
    return "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700";
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/70">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Admin workspace
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
          Recent activity
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Track the latest changes across users, classes, and announcements.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent activity feed</h2>
            <p className="mt-1 text-sm text-slate-500">Newest events from the platform.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Live
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              Loading recent activity...
            </div>
          ) : recentActivity.length ? (
            recentActivity.map((item) => (
              <div key={item.id} className={getActivityCardClasses(item.type)}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {item.type}
                  </span>
                </div>
                <p className="mt-2 text-slate-600">{item.detail}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              No recent activity yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RecentActivityPage;