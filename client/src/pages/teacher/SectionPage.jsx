import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

const sectionConfig = {
  classes: {
    pageTitle: "My Classes",
    description: "Review assigned classes and inspect the student roster for each section.",
  },
  attendance: {
    pageTitle: "Attendance",
    description: "Mark attendance and review historical attendance records for your classes.",
  },
  grades: {
    pageTitle: "Grades",
    description: "Upload marks, update assessments, and keep grading records organized.",
  },
};

const TeacherSectionPage = ({ section = "classes", title, description }) => {
  const config = sectionConfig[section];
  const resolvedTitle = title || config.pageTitle;
  const resolvedDescription = description || config.description;

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [gradeRows, setGradeRows] = useState([]);
  const [gradeForm, setGradeForm] = useState({
    student: "",
    subject: "",
    examType: "assignment",
    marksObtained: "",
    maxMarks: "",
    gradeLetter: "",
    remarks: "",
    term: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadClasses = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/teacher/classes");
        const loadedClasses = data.classes || [];
        setClasses(loadedClasses);

        if (loadedClasses.length && !selectedClassId) {
          setSelectedClassId(loadedClasses[0]._id);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load classes");
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, [refreshKey, selectedClassId]);

  useEffect(() => {
    const loadClassDetails = async () => {
      if (!selectedClassId) {
        setStudents([]);
        setAttendanceRows([]);
        setAttendanceHistory([]);
        setGradeRows([]);
        return;
      }

      try {
        const [studentsRes, attendanceRes, gradesRes] = await Promise.all([
          api.get(`/teacher/classes/${selectedClassId}/students`),
          api.get(`/teacher/classes/${selectedClassId}/attendance`),
          api.get(`/teacher/classes/${selectedClassId}/grades`),
        ]);

        const loadedStudents = studentsRes.data.students || [];
        setStudents(loadedStudents);

        setAttendanceRows(
          loadedStudents.map((student) => ({
            student: student._id,
            studentName: student.name,
            status: "present",
            remarks: "",
          }))
        );

        setAttendanceHistory(attendanceRes.data.attendance || []);
        setGradeRows(gradesRes.data.grades || []);

        setGradeForm((prev) => ({
          ...prev,
          student: loadedStudents[0]?._id || "",
          subject: prev.subject || classes.find((item) => item._id === selectedClassId)?.subject || "",
        }));
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load class details");
      }
    };

    loadClassDetails();
  }, [classes, selectedClassId]);

  const refresh = () => setRefreshKey((value) => value + 1);

  const currentClass = useMemo(
    () => classes.find((item) => item._id === selectedClassId),
    [classes, selectedClassId]
  );

  const handleAttendanceChange = (studentId, field, value) => {
    setAttendanceRows((prev) =>
      prev.map((row) => (row.student === studentId ? { ...row, [field]: value } : row))
    );
  };

  const saveAttendance = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await api.post("/teacher/attendance", {
        classId: selectedClassId,
        date: attendanceDate,
        records: attendanceRows.map((row) => ({
          student: row.student,
          status: row.status,
          remarks: row.remarks,
        })),
      });

      toast.success("Attendance saved");
      refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const saveGrade = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await api.post("/teacher/grades", {
        classId: selectedClassId,
        student: gradeForm.student,
        subject: gradeForm.subject,
        examType: gradeForm.examType,
        marksObtained: Number(gradeForm.marksObtained),
        maxMarks: Number(gradeForm.maxMarks),
        gradeLetter: gradeForm.gradeLetter,
        remarks: gradeForm.remarks,
        term: gradeForm.term,
      });

      toast.success("Grade saved");
      setGradeForm((prev) => ({ ...prev, marksObtained: "", maxMarks: "", gradeLetter: "", remarks: "" }));
      refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save grade");
    } finally {
      setSaving(false);
    }
  };

  const classSelector = (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
      <label className="mb-2 block text-sm font-medium text-slate-700">Select class</label>
      <select
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
        value={selectedClassId}
        onChange={(event) => setSelectedClassId(event.target.value)}
      >
        {classes.length === 0 ? <option value="">No assigned classes</option> : null}
        {classes.map((item) => (
          <option key={item._id} value={item._id}>
            {item.name} - {item.section} ({item.subject})
          </option>
        ))}
      </select>
      {currentClass ? (
        <p className="mt-3 text-sm text-slate-500">Class code: {currentClass.code}</p>
      ) : null}
    </div>
  );

  const classesContent = (
    <div className="space-y-6">
      {classSelector}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Assigned classes" value={classes.length} />
        <SummaryCard
          label="Total students"
          value={classes.reduce((sum, item) => sum + (item.students?.length || 0), 0)}
        />
        <SummaryCard label="Active class" value={currentClass ? `${currentClass.name} ${currentClass.section}` : "-"} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
        <h2 className="text-lg font-semibold text-slate-900">Students in selected class</h2>
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Roll no.</th>
              </tr>
            </thead>
            <tbody>
              {students.length ? (
                students.map((student) => (
                  <tr key={student._id} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-slate-700">{student.name}</td>
                    <td className="px-4 py-3 text-slate-700">{student.email}</td>
                    <td className="px-4 py-3 text-slate-700">{student.studentDetails?.rollNumber || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-200">
                  <td colSpan={3} className="px-4 py-6 text-slate-500">No students assigned to this class.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const attendanceContent = (
    <div className="space-y-6">
      {classSelector}

      <form onSubmit={saveAttendance} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">Attendance date</label>
          <input
            type="date"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
            value={attendanceDate}
            onChange={(event) => setAttendanceDate(event.target.value)}
          />
        </div>

        <div className="space-y-3">
          {attendanceRows.length ? (
            attendanceRows.map((row) => (
              <div key={row.student} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1.2fr_0.7fr_1fr]">
                <div>
                  <p className="text-sm font-medium text-slate-900">{row.studentName}</p>
                </div>
                <select
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={row.status}
                  onChange={(event) => handleAttendanceChange(row.student, "status", event.target.value)}
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
                <input
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="Remarks"
                  value={row.remarks}
                  onChange={(event) => handleAttendanceChange(row.student, "remarks", event.target.value)}
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No students found for attendance.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!selectedClassId || !attendanceRows.length || saving}
          className="mt-5 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save attendance"}
        </button>
      </form>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
        <h2 className="text-lg font-semibold text-slate-900">Attendance history</h2>
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.length ? (
                attendanceHistory.map((record) => (
                  <tr key={record._id} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-slate-700">{formatDate(record.date)}</td>
                    <td className="px-4 py-3 text-slate-700">{record.student?.name || "-"}</td>
                    <td className="px-4 py-3 text-slate-700 capitalize">{record.status}</td>
                    <td className="px-4 py-3 text-slate-700">{record.remarks || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-200">
                  <td colSpan={4} className="px-4 py-6 text-slate-500">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const gradesContent = (
    <div className="space-y-6">
      {classSelector}

      <form onSubmit={saveGrade} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Student">
            <select
              className="input bg-white"
              value={gradeForm.student}
              onChange={(event) => setGradeForm((prev) => ({ ...prev, student: event.target.value }))}
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>{student.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Subject">
            <input
              className="input"
              value={gradeForm.subject}
              onChange={(event) => setGradeForm((prev) => ({ ...prev, subject: event.target.value }))}
            />
          </Field>
          <Field label="Exam type">
            <select
              className="input bg-white"
              value={gradeForm.examType}
              onChange={(event) => setGradeForm((prev) => ({ ...prev, examType: event.target.value }))}
            >
              <option value="assignment">Assignment</option>
              <option value="quiz">Quiz</option>
              <option value="midterm">Midterm</option>
              <option value="final">Final</option>
              <option value="project">Project</option>
            </select>
          </Field>
          <Field label="Term">
            <input
              className="input"
              value={gradeForm.term}
              onChange={(event) => setGradeForm((prev) => ({ ...prev, term: event.target.value }))}
              placeholder="2026-Spring"
            />
          </Field>
          <Field label="Marks obtained">
            <input
              type="number"
              className="input"
              value={gradeForm.marksObtained}
              onChange={(event) => setGradeForm((prev) => ({ ...prev, marksObtained: event.target.value }))}
            />
          </Field>
          <Field label="Max marks">
            <input
              type="number"
              className="input"
              value={gradeForm.maxMarks}
              onChange={(event) => setGradeForm((prev) => ({ ...prev, maxMarks: event.target.value }))}
            />
          </Field>
          <Field label="Grade letter">
            <input
              className="input"
              value={gradeForm.gradeLetter}
              onChange={(event) => setGradeForm((prev) => ({ ...prev, gradeLetter: event.target.value }))}
              placeholder="A"
            />
          </Field>
          <Field label="Remarks">
            <input
              className="input"
              value={gradeForm.remarks}
              onChange={(event) => setGradeForm((prev) => ({ ...prev, remarks: event.target.value }))}
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={!selectedClassId || !gradeForm.student || saving}
          className="mt-5 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save grade"}
        </button>
      </form>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
        <h2 className="text-lg font-semibold text-slate-900">Grade history</h2>
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Exam</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Term</th>
              </tr>
            </thead>
            <tbody>
              {gradeRows.length ? (
                gradeRows.map((grade) => (
                  <tr key={grade._id} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-slate-700">{grade.student?.name || "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{grade.subject}</td>
                    <td className="px-4 py-3 text-slate-700 capitalize">{grade.examType}</td>
                    <td className="px-4 py-3 text-slate-700">{grade.marksObtained}/{grade.maxMarks}</td>
                    <td className="px-4 py-3 text-slate-700">{grade.term || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-200">
                  <td colSpan={5} className="px-4 py-6 text-slate-500">No grades found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const sectionContent = {
    classes: classesContent,
    attendance: attendanceContent,
    grades: gradesContent,
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/70">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Teacher workspace
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          {resolvedTitle}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          {resolvedDescription}
        </p>
      </div>

      <style>{`
        .input { width: 100%; border-radius: 1rem; border: 1px solid #cbd5e1; padding: 0.75rem 1rem; outline: none; }
        .input:focus { border-color: #0f172a; }
      `}</style>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm shadow-slate-200/70">
          Loading classes...
        </div>
      ) : (
        sectionContent[section]
      )}
    </section>
  );
};

const SummaryCard = ({ label, value }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
  </div>
);

const Field = ({ label, children }) => (
  <label>
    <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
    {children}
  </label>
);

const formatDate = (input) => {
  if (!input) return "-";
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

export default TeacherSectionPage;
