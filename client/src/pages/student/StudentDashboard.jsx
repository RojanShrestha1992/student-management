import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import StatCard from "../../components/layout/StatCard";

const StudentDashboard = () => {
  const [classInfo, setClassInfo] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const [classRes, attendanceRes, gradesRes, announcementsRes] = await Promise.all([
          api.get("/student/class"),
          api.get("/student/attendance"),
          api.get("/student/grades"),
          api.get("/student/announcements"),
        ]);

        setClassInfo(classRes.data.classInfo || null);
        setAttendance(attendanceRes.data.attendance || []);
        setGrades(gradesRes.data.grades || []);
        setAnnouncements(announcementsRes.data.announcements || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load student dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const attendanceRate = attendance.length
    ? Math.round(
        (attendance.filter((record) => record.status === "present" || record.status === "late").length /
          attendance.length) *
          100
      )
    : 0;

  const latestGrades = grades.slice(0, 3);
  const latestAnnouncements = announcements.slice(0, 3);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/70">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Student overview
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
          Your academic progress in one clear view.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Review attendance, grades, and announcements without extra noise.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Attendance" value={loading ? "..." : `${attendanceRate}%`} hint="Attendance from your stored records." accent="emerald" />
        <StatCard label="Subjects" value={loading ? "..." : classInfo ? 1 : 0} hint="Subjects assigned in your class." accent="blue" />
        <StatCard label="Announcements" value={loading ? "..." : announcements.length} hint="Notices available to your account." accent="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent grades</h2>
              <p className="mt-1 text-sm text-slate-500">
                {classInfo ? `${classInfo.name} - ${classInfo.section}` : "Your recorded assessments"}
              </p>
            </div>
            <Link to="/student/grades" className="text-sm font-medium text-slate-900 underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {latestGrades.length ? latestGrades.map((item) => (
              <div key={item.subject} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div>
                  <p className="font-medium text-slate-900">{item.subject}</p>
                  <p className="text-sm text-slate-500">{item.examType} {item.term ? `- ${item.term}` : ""}</p>
                </div>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
                  {item.marksObtained}/{item.maxMarks}
                </span>
              </div>
            )) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                No grades recorded yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Announcements</h2>
            <Link to="/student/announcements" className="text-sm font-medium text-slate-900 underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="mt-6 space-y-3">
            {latestAnnouncements.length ? latestAnnouncements.map((item) => (
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

export default StudentDashboard;
