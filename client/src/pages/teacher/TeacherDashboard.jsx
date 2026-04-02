import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import StatCard from "../../components/layout/StatCard";

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const classesRes = await api.get("/teacher/classes");
        setClasses(classesRes.data.classes || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load teacher dashboard");
      } finally {
        setLoading(false);
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const announcementsRes = await api.get("/teacher/announcements");
        setAnnouncements(announcementsRes.data.announcements || []);
      } catch (error) {
        // Silently fail for announcements (don't show error if unauthorized)
        setAnnouncements([]);
      }
    };

    fetchDashboardData();
    fetchAnnouncements();
  }, []);

  const totalStudents = classes.reduce((sum, classItem) => sum + (classItem.students?.length || 0), 0);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/70">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Teacher overview
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
          Manage your classes, attendance, and grades with clarity.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Keep classroom operations moving with a focused workspace for daily teaching tasks.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Assigned Classes" value={loading ? "..." : classes.length} hint="Live sections currently on your schedule." accent="blue" />
        <StatCard label="Students" value={loading ? "..." : totalStudents} hint="Students across all assigned classes." accent="emerald" />
        <StatCard label="Pending Grades" value="--" hint="Assessment queue can be loaded in the next step." accent="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
          <h2 className="text-lg font-semibold text-slate-900">Announcements</h2>
          <div className="mt-6 space-y-3">
            {announcements.length ? announcements.slice(0, 5).map((item) => (
              <div key={item._id} className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="mt-2 leading-6 text-slate-600">{item.message}</p>
              </div>
            )) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                No announcements available.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeacherDashboard;
