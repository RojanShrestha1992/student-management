import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

const initialForm = {
  classId: "",
  title: "",
  type: "assignment",
  description: "",
  dueDate: "",
  file: null,
};

const UploadFilesPage = () => {
  const [classes, setClasses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);

    try {
      const [classesRes, materialsRes] = await Promise.all([
        api.get("/teacher/classes"),
        api.get("/teacher/materials"),
      ]);

      const loadedClasses = classesRes.data.classes || [];
      setClasses(loadedClasses);
      setMaterials(materialsRes.data.materials || []);

      setForm((prev) => ({
        ...prev,
        classId: prev.classId || loadedClasses[0]?._id || "",
      }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load upload page");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.classId || !form.title || !form.file) {
      toast.error("Class, title, and file are required");
      return;
    }

    const payload = new FormData();
    payload.append("classId", form.classId);
    payload.append("title", form.title);
    payload.append("type", form.type);
    payload.append("description", form.description);
    if (form.dueDate) payload.append("dueDate", form.dueDate);
    payload.append("file", form.file);

    setSaving(true);

    try {
      await api.post("/teacher/materials", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("File uploaded successfully");
      setForm((prev) => ({
        ...initialForm,
        classId: prev.classId,
      }));
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to upload file");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/70">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Teacher resources
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
          Upload assignments and question papers.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Share study files directly with students in your selected class.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Class" required>
            <select
              value={form.classId}
              onChange={(event) => handleChange("classId", event.target.value)}
              disabled={loading || classes.length === 0}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
            >
              {classes.length === 0 ? <option value="">No assigned classes</option> : null}
              {classes.map((classItem) => (
                <option key={classItem._id} value={classItem._id}>
                  {classItem.name} - {classItem.section} ({classItem.subject})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Title" required>
            <input
              type="text"
              value={form.title}
              onChange={(event) => handleChange("title", event.target.value)}
              placeholder="e.g. Unit Test 1 Question Paper"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
            />
          </Field>

          <Field label="Type">
            <select
              value={form.type}
              onChange={(event) => handleChange("type", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
            >
              <option value="assignment">Assignment</option>
              <option value="question-paper">Question paper</option>
              <option value="notes">Notes</option>
              <option value="other">Other</option>
            </select>
          </Field>

          <Field label="Due date">
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) => handleChange("dueDate", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => handleChange("description", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
              placeholder="Optional instructions for students"
            />
          </Field>

          <Field label="File" required>
            <input
              type="file"
              onChange={(event) => handleChange("file", event.target.files?.[0] || null)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition file:mr-3 file:rounded-xl file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-slate-700 focus:border-slate-900"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
            />
          </Field>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">Supported files: PDF, Word, PowerPoint, Excel, JPG, PNG. Max size 10 MB.</p>
          <button
            type="submit"
            disabled={saving || loading || classes.length === 0}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Uploading..." : "Upload file"}
          </button>
        </div>
      </form>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
        <h2 className="text-lg font-semibold text-slate-900">Uploaded files</h2>
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Class</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Uploaded</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {materials.length ? (
                materials.map((item) => (
                  <tr key={item._id} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-slate-700">{item.title}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.class ? `${item.class.name} - ${item.class.section}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 capitalize">{item.type}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Open file
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-200">
                  <td colSpan={5} className="px-4 py-6 text-slate-500">
                    No files uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, required = false, children }) => (
  <label className="space-y-2 text-sm font-medium text-slate-700">
    <span>
      {label}
      {required ? <span className="ml-1 text-rose-600">*</span> : null}
    </span>
    {children}
  </label>
);

const formatDate = (input) => {
  if (!input) return "-";
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

export default UploadFilesPage;
