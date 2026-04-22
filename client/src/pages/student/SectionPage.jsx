import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

const sectionConfig = {
  profile: {
    pageTitle: "Profile",
    description: "View your own account and student record details in read-only mode.",
    endpoint: "/student/me",
  },
  attendance: {
    pageTitle: "Attendance",
    description: "Check your attendance history and term-level attendance status.",
    endpoint: "/student/attendance",
  },
  grades: {
    pageTitle: "Grades",
    description: "Review report cards, assessment marks, and subject-level performance.",
    endpoint: "/student/grades",
  },
  announcements: {
    pageTitle: "Announcements",
    description: "See the latest notices shared by the admin team.",
    endpoint: "/student/announcements",
  },
  materials: {
    pageTitle: "Materials",
    description: "Download assignments, question papers, and study resources shared by your teacher.",
    endpoint: "/student/materials",
  },
};

const StudentSectionPage = ({ section = "profile", title, description }) => {
  const config = sectionConfig[section];
  const resolvedTitle = title || config.pageTitle;
  const resolvedDescription = description || config.description;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchSectionData = async () => {
      setLoading(true);
      try {
        const { data: responseData } = await api.get(config.endpoint);
        setData(responseData);
      } catch (error) {
        toast.error(error?.response?.data?.message || `Failed to load ${resolvedTitle.toLowerCase()}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSectionData();
  }, [config.endpoint, resolvedTitle]);

  const content = useMemo(() => {
    if (!data) return null;

    if (section === "profile") {
      const user = data.user;
      const classInfo = user?.studentDetails?.class;
      return (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <InfoCard title="Student details">
            <DetailRow label="Name" value={user?.name || "-"} />
            <DetailRow label="Email" value={user?.email || "-"} />
            <DetailRow label="Roll number" value={user?.studentDetails?.rollNumber || "-"} />
            <DetailRow label="Admission number" value={user?.studentDetails?.admissionNumber || "-"} />
            <DetailRow label="Guardian name" value={user?.studentDetails?.guardianName || "-"} />
            <DetailRow label="Guardian phone" value={user?.studentDetails?.guardianPhone || "-"} />
          </InfoCard>

          <InfoCard title="Current class">
            {classInfo ? (
              <>
                <DetailRow label="Class" value={`${classInfo.name} - ${classInfo.section}`} />
                <DetailRow label="Subject" value={classInfo.subject || "-"} />
                <DetailRow label="Code" value={classInfo.code || "-"} />
              </>
            ) : (
              <p className="text-sm text-slate-500">No class assigned yet.</p>
            )}
          </InfoCard>
        </div>
      );
    }

    if (section === "attendance") {
      const records = data.attendance || [];
      const presentCount = records.filter((record) => record.status === "present" || record.status === "late").length;
      const rate = records.length ? Math.round((presentCount / records.length) * 100) : 0;

      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard label="Total records" value={records.length} />
            <SummaryCard label="Present / Late" value={presentCount} />
            <SummaryCard label="Attendance rate" value={`${rate}%`} />
          </div>

          <TableCard title="Attendance history">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <TableHeadCell>Date</TableHeadCell>
                  <TableHeadCell>Class</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Remarks</TableHeadCell>
                </tr>
              </thead>
              <tbody>
                {records.length ? records.map((record) => (
                  <tr key={record._id} className="border-t border-slate-200">
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>{record.class ? `${record.class.name} - ${record.class.section}` : "-"}</TableCell>
                    <TableCell><StatusBadge status={record.status} /></TableCell>
                    <TableCell>{record.remarks || "-"}</TableCell>
                  </tr>
                )) : (
                  <EmptyRow colSpan={4} text="No attendance records found." />
                )}
              </tbody>
            </table>
          </TableCard>
        </div>
      );
    }

    if (section === "grades") {
      const grades = data.grades || [];
      const average = grades.length
        ? Math.round((grades.reduce((sum, grade) => sum + (grade.marksObtained / grade.maxMarks) * 100, 0) / grades.length))
        : 0;

      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard label="Total grades" value={grades.length} />
            <SummaryCard label="Average score" value={`${average}%`} />
            <SummaryCard label="Latest term" value={grades[0]?.term || "-"} />
          </div>

          <TableCard title="Grade records">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <TableHeadCell>Subject</TableHeadCell>
                  <TableHeadCell>Exam type</TableHeadCell>
                  <TableHeadCell>Score</TableHeadCell>
                  <TableHeadCell>Grade</TableHeadCell>
                  <TableHeadCell>Teacher</TableHeadCell>
                  <TableHeadCell>Remarks</TableHeadCell>
                </tr>
              </thead>
              <tbody>
                {grades.length ? grades.map((grade) => (
                  <tr key={grade._id} className="border-t border-slate-200">
                    <TableCell>{grade.subject}</TableCell>
                    <TableCell>{grade.examType}</TableCell>
                    <TableCell>{grade.marksObtained}/{grade.maxMarks}</TableCell>
                    <TableCell>{grade.gradeLetter || "-"}</TableCell>
                    <TableCell>{grade.teacher?.name || "-"}</TableCell>
                    <TableCell>{grade.remarks || "-"}</TableCell>
                  </tr>
                )) : (
                  <EmptyRow colSpan={6} text="No grades found yet." />
                )}
              </tbody>
            </table>
          </TableCard>
        </div>
      );
    }

    if (section === "materials") {
      const materials = data.materials || [];

      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard label="Total files" value={materials.length} />
            <SummaryCard label="Latest upload" value={materials[0] ? formatDate(materials[0].createdAt) : "-"} />
            <SummaryCard
              label="With due dates"
              value={materials.filter((item) => Boolean(item.dueDate)).length}
            />
          </div>

          <TableCard title="Shared materials">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <TableHeadCell>Title</TableHeadCell>
                  <TableHeadCell>Type</TableHeadCell>
                  <TableHeadCell>Teacher</TableHeadCell>
                  <TableHeadCell>Due date</TableHeadCell>
                  <TableHeadCell>Action</TableHeadCell>
                </tr>
              </thead>
              <tbody>
                {materials.length ? materials.map((item) => (
                  <tr key={item._id} className="border-t border-slate-200">
                    <TableCell>{item.title}</TableCell>
                    <TableCell>
                      <span className="capitalize">{item.type || "other"}</span>
                    </TableCell>
                    <TableCell>{item.uploadedBy?.name || "Teacher"}</TableCell>
                    <TableCell>{formatDate(item.dueDate)}</TableCell>
                    <TableCell>
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Download
                      </a>
                    </TableCell>
                  </tr>
                )) : (
                  <EmptyRow colSpan={5} text="No materials shared yet." />
                )}
              </tbody>
            </table>
          </TableCard>
        </div>
      );
    }

    const announcements = data.announcements || [];
    return (
      <div className="space-y-4">
        {announcements.length ? announcements.map((announcement) => (
          <div key={announcement._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{announcement.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Posted by {announcement.postedBy?.name || "Admin"} on {formatDate(announcement.publishedAt)}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                {announcement.audience}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">{announcement.message}</p>
          </div>
        )) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm shadow-slate-200/70">
            No announcements available.
          </div>
        )}
      </div>
    );
  }, [data, section]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/70">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Student workspace
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          {resolvedTitle}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          {resolvedDescription}
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm shadow-slate-200/70">
          Loading...
        </div>
      ) : (
        content
      )}
    </section>
  );
};

const InfoCard = ({ title, children }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
    <div className="mt-5 space-y-3">{children}</div>
  </div>
);

const TableCard = ({ title, children }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">{children}</div>
  </div>
);

const TableHeadCell = ({ children }) => (
  <th className="px-4 py-3 font-medium">{children}</th>
);

const TableCell = ({ children }) => <td className="px-4 py-3 text-slate-700">{children}</td>;

const EmptyRow = ({ colSpan, text }) => (
  <tr className="border-t border-slate-200">
    <td colSpan={colSpan} className="px-4 py-6 text-slate-500">{text}</td>
  </tr>
);

const SummaryCard = ({ label, value }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    present: "bg-emerald-100 text-emerald-700",
    absent: "bg-rose-100 text-rose-700",
    late: "bg-amber-100 text-amber-700",
    excused: "bg-slate-100 text-slate-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${colors[status] || colors.excused}`}>
      {status}
    </span>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-medium text-slate-900">{value}</span>
  </div>
);

const formatDate = (input) => {
  if (!input) return "-";
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

export default StudentSectionPage;
