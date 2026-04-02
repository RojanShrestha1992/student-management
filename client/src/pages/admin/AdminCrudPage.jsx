import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

const emptyUserForm = {
  name: "",
  email: "",
  password: "",
  role: "teacher",
  isActive: true,
  phone: "",
  gender: "",
  dob: "",
  address: "",
  avatarUrl: "",
  employeeId: "",
  department: "",
  rollNumber: "",
  admissionNumber: "",
  classId: "",
  guardianName: "",
  guardianPhone: "",
};

const emptyClassForm = {
  name: "",
  section: "",
  subject: "",
  code: "",
  teacher: "",
  students: "",
  scheduleDays: "",
  scheduleStartTime: "",
  scheduleEndTime: "",
  scheduleRoom: "",
  isActive: true,
};

const emptyAnnouncementForm = {
  title: "",
  message: "",
  audience: "all",
  isActive: true,
};

const sectionConfig = {
  users: {
    title: "Users",
    description: "Create, update, and remove student, teacher, and admin accounts.",
    endpoint: "/admin/users",
    columns: ["Name", "Email", "Role", "Status", "Actions"],
    buildList: (data) => data?.users || [],
    getRowValues: (item) => [
      item.name,
      item.email,
      item.role,
      item.isActive ? "Active" : "Inactive",
    ],
    getFormTitle: (editing) => (editing ? "Update user" : "Create user"),
  },
  classes: {
    title: "Classes",
    description: "Set up class groups, assign teachers, and manage schedules.",
    endpoint: "/admin/classes",
    columns: ["Class", "Teacher", "Code", "Status", "Actions"],
    buildList: (data) => data?.classes || [],
    getRowValues: (item) => [
      `${item.name} - ${item.section} (${item.subject})`,
      item.teacher?.name || "Unassigned",
      item.code,
      item.isActive ? "Active" : "Inactive",
    ],
    getFormTitle: (editing) => (editing ? "Update class" : "Create class"),
  },
  announcements: {
    title: "Announcements",
    description: "Publish notices for students, teachers, or the whole school.",
    endpoint: "/admin/announcements",
    columns: ["Title", "Audience", "Status", "Actions"],
    buildList: (data) => data?.announcements || [],
    getRowValues: (item) => [
      item.title,
      item.audience,
      item.isActive ? "Active" : "Inactive",
    ],
    getFormTitle: (editing) => (editing ? "Update announcement" : "Create announcement"),
  },
};

const AdminCrudPage = ({ section }) => {
  const config = sectionConfig[section];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [classForm, setClassForm] = useState(emptyClassForm);
  const [announcementForm, setAnnouncementForm] = useState(emptyAnnouncementForm);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);

  const formState = useMemo(() => {
    if (section === "users") return userForm;
    if (section === "classes") return classForm;
    return announcementForm;
  }, [announcementForm, classForm, section, userForm]);

  const resetForm = () => {
    setEditingId(null);
    if (section === "users") setUserForm(emptyUserForm);
    if (section === "classes") setClassForm(emptyClassForm);
    if (section === "announcements") setAnnouncementForm(emptyAnnouncementForm);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const requests = [api.get(config.endpoint)];

        if (section === "classes" || section === "users") {
          requests.push(api.get("/admin/users?role=teacher"));
        }

        if (section === "users") {
          requests.push(api.get("/admin/classes"));
        }

        const responses = await Promise.all(requests);
        setItems(config.buildList(responses[0].data));

        if (section === "classes" || section === "users") {
          setTeachers(responses[1].data.users || []);
        }

        if (section === "users") {
          const classesResponse = section === "users" ? responses[2] : null;
          setClasses(classesResponse?.data?.classes || []);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || `Failed to load ${config.title.toLowerCase()}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [config, refreshKey, section]);

  const refresh = () => setRefreshKey((value) => value + 1);

  const handleEdit = (item) => {
    setEditingId(item._id);

    if (section === "users") {
      setUserForm({
        name: item.name || "",
        email: item.email || "",
        password: "",
        role: item.role || "teacher",
        isActive: item.isActive ?? true,
        phone: item.profile?.phone || "",
        gender: item.profile?.gender || "",
        dob: item.profile?.dob ? item.profile.dob.slice(0, 10) : "",
        address: item.profile?.address || "",
        avatarUrl: item.profile?.avatarUrl || "",
        employeeId: item.teacherDetails?.employeeId || "",
        department: item.teacherDetails?.department || "",
        rollNumber: item.studentDetails?.rollNumber || "",
        admissionNumber: item.studentDetails?.admissionNumber || "",
        classId: item.studentDetails?.class?._id || item.studentDetails?.class || "",
        guardianName: item.studentDetails?.guardianName || "",
        guardianPhone: item.studentDetails?.guardianPhone || "",
      });
    }

    if (section === "classes") {
      setClassForm({
        name: item.name || "",
        section: item.section || "",
        subject: item.subject || "",
        code: item.code || "",
        teacher: item.teacher?._id || item.teacher || "",
        students: Array.isArray(item.students) ? item.students.map((student) => student._id || student).join(", ") : "",
        scheduleDays: Array.isArray(item.schedule?.days) ? item.schedule.days.join(", ") : "",
        scheduleStartTime: item.schedule?.startTime || "",
        scheduleEndTime: item.schedule?.endTime || "",
        scheduleRoom: item.schedule?.room || "",
        isActive: item.isActive ?? true,
      });
    }

    if (section === "announcements") {
      setAnnouncementForm({
        title: item.title || "",
        message: item.message || "",
        audience: item.audience || "all",
        isActive: item.isActive ?? true,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`${config.endpoint}/${id}`);
      toast.success(`${config.title.slice(0, -1)} deleted successfully`);
      refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (section === "users") {
        const payload = {
          name: userForm.name,
          email: userForm.email,
          password: userForm.password,
          role: userForm.role,
          isActive: Boolean(userForm.isActive),
          profile: {
            phone: userForm.phone,
            gender: userForm.gender,
            dob: userForm.dob || undefined,
            address: userForm.address,
            avatarUrl: userForm.avatarUrl,
          },
          teacherDetails: userForm.role === "teacher"
            ? {
                employeeId: userForm.employeeId,
                department: userForm.department,
              }
            : undefined,
          studentDetails: userForm.role === "student"
            ? {
                rollNumber: userForm.rollNumber,
                admissionNumber: userForm.admissionNumber,
                class: userForm.classId || undefined,
                guardianName: userForm.guardianName,
                guardianPhone: userForm.guardianPhone,
              }
            : undefined,
        };

        if (!editingId && !payload.password) {
          toast.error("Password is required when creating a user");
          setSaving(false);
          return;
        }

        if (editingId && !payload.password) {
          delete payload.password;
        }

        if (editingId) {
          await api.put(`${config.endpoint}/${editingId}`, payload);
          toast.success("User updated successfully");
        } else {
          await api.post(config.endpoint, payload);
          toast.success("User created successfully");
        }
      }

      if (section === "classes") {
        const payload = {
          ...classForm,
          teacher: classForm.teacher,
          students: classForm.students
            ? classForm.students.split(",").map((value) => value.trim()).filter(Boolean)
            : [],
          schedule: {
            days: classForm.scheduleDays
              ? classForm.scheduleDays.split(",").map((value) => value.trim()).filter(Boolean)
              : [],
            startTime: classForm.scheduleStartTime,
            endTime: classForm.scheduleEndTime,
            room: classForm.scheduleRoom,
          },
          isActive: Boolean(classForm.isActive),
        };

        if (editingId) {
          await api.put(`${config.endpoint}/${editingId}`, payload);
          toast.success("Class updated successfully");
        } else {
          await api.post(config.endpoint, payload);
          toast.success("Class created successfully");
        }
      }

      if (section === "announcements") {
        const payload = {
          ...announcementForm,
          isActive: Boolean(announcementForm.isActive),
        };

        if (editingId) {
          await api.put(`${config.endpoint}/${editingId}`, payload);
          toast.success("Announcement updated successfully");
        } else {
          await api.post(config.endpoint, payload);
          toast.success("Announcement created successfully");
        }
      }

      resetForm();
      refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const renderForm = () => {
    if (section === "users") {
      return (
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Name">
            <input className="input" value={formState.name} onChange={(event) => setUserForm((prev) => ({ ...prev, name: event.target.value }))} />
          </Field>
          <Field label="Email">
            <input type="email" className="input" value={formState.email} onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))} />
          </Field>
          <Field label="Password">
            <input type="password" className="input" value={formState.password} onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))} placeholder={editingId ? "Leave blank to keep current password" : "Enter password"} />
          </Field>
          <Field label="Role">
            <select className="input bg-white" value={formState.role} onChange={(event) => setUserForm((prev) => ({ ...prev, role: event.target.value }))}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <Field label="Account status">
            <select className="input bg-white" value={String(formState.isActive)} onChange={(event) => setUserForm((prev) => ({ ...prev, isActive: event.target.value === "true" }))}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </Field>
          <Field label="Phone">
            <input className="input" value={formState.phone} onChange={(event) => setUserForm((prev) => ({ ...prev, phone: event.target.value }))} />
          </Field>
          <Field label="Gender">
            <select className="input bg-white" value={formState.gender} onChange={(event) => setUserForm((prev) => ({ ...prev, gender: event.target.value }))}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Date of birth">
            <input type="date" className="input" value={formState.dob} onChange={(event) => setUserForm((prev) => ({ ...prev, dob: event.target.value }))} />
          </Field>
          <Field label="Address" full>
            <textarea className="input min-h-24" value={formState.address} onChange={(event) => setUserForm((prev) => ({ ...prev, address: event.target.value }))} />
          </Field>
          <Field label="Avatar URL" full>
            <input className="input" value={formState.avatarUrl} onChange={(event) => setUserForm((prev) => ({ ...prev, avatarUrl: event.target.value }))} />
          </Field>

          {formState.role === "teacher" ? (
            <>
              <Field label="Employee ID">
                <input className="input" value={formState.employeeId} onChange={(event) => setUserForm((prev) => ({ ...prev, employeeId: event.target.value }))} />
              </Field>
              <Field label="Department">
                <input className="input" value={formState.department} onChange={(event) => setUserForm((prev) => ({ ...prev, department: event.target.value }))} />
              </Field>
            </>
          ) : null}

          {formState.role === "student" ? (
            <>
              <Field label="Roll number">
                <input className="input" value={formState.rollNumber} onChange={(event) => setUserForm((prev) => ({ ...prev, rollNumber: event.target.value }))} />
              </Field>
              <Field label="Admission number">
                <input className="input" value={formState.admissionNumber} onChange={(event) => setUserForm((prev) => ({ ...prev, admissionNumber: event.target.value }))} />
              </Field>
              <Field label="Class">
                <select className="input bg-white" value={formState.classId} onChange={(event) => setUserForm((prev) => ({ ...prev, classId: event.target.value }))}>
                  <option value="">Select class</option>
                  {classes.map((classItem) => (
                    <option key={classItem._id} value={classItem._id}>
                      {classItem.name} - {classItem.section} ({classItem.subject})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Guardian name">
                <input className="input" value={formState.guardianName} onChange={(event) => setUserForm((prev) => ({ ...prev, guardianName: event.target.value }))} />
              </Field>
              <Field label="Guardian phone">
                <input className="input" value={formState.guardianPhone} onChange={(event) => setUserForm((prev) => ({ ...prev, guardianPhone: event.target.value }))} />
              </Field>
            </>
          ) : null}

          <div className="md:col-span-2 flex gap-3">
            <button className="primary-btn" type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Update user" : "Create user"}</button>
            {editingId ? <button type="button" className="secondary-btn" onClick={resetForm}>Cancel edit</button> : null}
          </div>
        </form>
      );
    }

    if (section === "classes") {
      return (
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Class name"><input className="input" value={formState.name} onChange={(event) => setClassForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Grade 10" /></Field>
          <Field label="Section"><input className="input" value={formState.section} onChange={(event) => setClassForm((prev) => ({ ...prev, section: event.target.value }))} placeholder="A" /></Field>
          <Field label="Subject"><input className="input" value={formState.subject} onChange={(event) => setClassForm((prev) => ({ ...prev, subject: event.target.value }))} placeholder="Mathematics" /></Field>
          <Field label="Code"><input className="input" value={formState.code} onChange={(event) => setClassForm((prev) => ({ ...prev, code: event.target.value }))} placeholder="MATH-10-A" /></Field>
          <Field label="Teacher">
            <select className="input bg-white" value={formState.teacher} onChange={(event) => setClassForm((prev) => ({ ...prev, teacher: event.target.value }))}>
              <option value="">Select teacher</option>
              {teachers.map((teacher) => <option key={teacher._id} value={teacher._id}>{teacher.name} ({teacher.email})</option>)}
            </select>
          </Field>
          <Field label="Active status">
            <select className="input bg-white" value={String(formState.isActive)} onChange={(event) => setClassForm((prev) => ({ ...prev, isActive: event.target.value === "true" }))}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </Field>
          <Field label="Students IDs" full>
            <textarea className="input min-h-24" value={formState.students} onChange={(event) => setClassForm((prev) => ({ ...prev, students: event.target.value }))} placeholder="Optional: comma separated user IDs" />
          </Field>
          <Field label="Schedule days" full>
            <input className="input" value={formState.scheduleDays} onChange={(event) => setClassForm((prev) => ({ ...prev, scheduleDays: event.target.value }))} placeholder="Mon, Wed, Fri" />
          </Field>
          <Field label="Start time"><input className="input" value={formState.scheduleStartTime} onChange={(event) => setClassForm((prev) => ({ ...prev, scheduleStartTime: event.target.value }))} placeholder="09:00" /></Field>
          <Field label="End time"><input className="input" value={formState.scheduleEndTime} onChange={(event) => setClassForm((prev) => ({ ...prev, scheduleEndTime: event.target.value }))} placeholder="10:00" /></Field>
          <Field label="Room" full><input className="input" value={formState.scheduleRoom} onChange={(event) => setClassForm((prev) => ({ ...prev, scheduleRoom: event.target.value }))} placeholder="Room 12" /></Field>
          <div className="md:col-span-2 flex gap-3">
            <button className="primary-btn" type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Update class" : "Create class"}</button>
            {editingId ? <button type="button" className="secondary-btn" onClick={resetForm}>Cancel edit</button> : null}
          </div>
        </form>
      );
    }

    return (
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <Field label="Title"><input className="input" value={formState.title} onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, title: event.target.value }))} /></Field>
        <Field label="Audience"><select className="input bg-white" value={formState.audience} onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, audience: event.target.value }))}><option value="all">All</option><option value="student">Students</option><option value="teacher">Teachers</option><option value="admin">Admins</option></select></Field>
        <Field label="Message" full><textarea className="input min-h-32" value={formState.message} onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, message: event.target.value }))} /></Field>
        <Field label="Active status"><select className="input bg-white" value={String(formState.isActive)} onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, isActive: event.target.value === "true" }))}><option value="true">Active</option><option value="false">Inactive</option></select></Field>
        <div className="flex gap-3">
          <button className="primary-btn" type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Update announcement" : "Create announcement"}</button>
          {editingId ? <button type="button" className="secondary-btn" onClick={resetForm}>Cancel edit</button> : null}
        </div>
      </form>
    );
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/70">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Admin workspace</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{config.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">{config.description}</p>
      </div>

      <style>{`
        .input { width: 100%; border-radius: 1rem; border: 1px solid #cbd5e1; padding: 0.75rem 1rem; outline: none; }
        .input:focus { border-color: #0f172a; }
        .primary-btn { border-radius: 1rem; background: #0f172a; padding: 0.75rem 1rem; color: white; font-weight: 500; }
        .secondary-btn { border-radius: 1rem; border: 1px solid #cbd5e1; background: white; padding: 0.75rem 1rem; color: #0f172a; font-weight: 500; }
      `}</style>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
        <h2 className="text-lg font-semibold text-slate-900">{config.getFormTitle(Boolean(editingId))}</h2>
        <p className="mt-1 text-sm text-slate-500">Use the form below to create or update records.</p>
        <div className="mt-6">{renderForm()}</div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Existing records</h2>
            <p className="mt-1 text-sm text-slate-500">Click edit or delete on any row.</p>
          </div>
          <button className="secondary-btn" type="button" onClick={refresh}>Refresh</button>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">No records yet.</div>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {config.columns.map((column) => <th key={column} className="px-4 py-3 font-medium">{column}</th>)}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-t border-slate-200">
                    {config.getRowValues(item).map((value, index) => <td key={index} className="px-4 py-3 text-slate-700">{value}</td>)}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700" onClick={() => handleEdit(item)}>Edit</button>
                        <button type="button" className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700" onClick={() => handleDelete(item._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, children, full = false }) => (
  <label className={full ? "md:col-span-2" : ""}>
    <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
    {children}
  </label>
);

export default AdminCrudPage;
