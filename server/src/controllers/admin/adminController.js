const User = require("../../models/User");
const Class = require("../../models/Class");
const Attendance = require("../../models/Attendance");
const Grade = require("../../models/Grade");
const Announcement = require("../../models/Announcement");

const sanitizeUserPayload = (body) => ({
  name: body.name,
  email: body.email,
  password: body.password,
  role: body.role,
  isActive: body.isActive,
  profile: body.profile,
  teacherDetails: body.teacherDetails,
  studentDetails: body.studentDetails,
});

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalStudents, totalTeachers, totalAdmins, activeClasses, totalAnnouncements, recentUsers, recentClasses, recentAnnouncements] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "teacher" }),
        User.countDocuments({ role: "admin" }),
        Class.countDocuments({ isActive: true }),
        Announcement.countDocuments({ isActive: true }),
        User.find().sort({ createdAt: -1 }).limit(3).select("name role createdAt"),
        Class.find().sort({ createdAt: -1 }).limit(3).select("name section subject createdAt"),
        Announcement.find().sort({ createdAt: -1 }).limit(3).select("title audience createdAt"),
      ]);

    const attendanceCount = await Attendance.countDocuments();
    const gradeCount = await Grade.countDocuments();

    const recentActivity = [
      ...recentUsers.map((user) => ({
        id: `user:${user._id}`,
        type: "user",
        title: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} account created`,
        detail: user.name,
        createdAt: user.createdAt,
      })),
      ...recentClasses.map((classDoc) => ({
        id: `class:${classDoc._id}`,
        type: "class",
        title: "Class created",
        detail: `${classDoc.name} - ${classDoc.section} (${classDoc.subject})`,
        createdAt: classDoc.createdAt,
      })),
      ...recentAnnouncements.map((announcement) => ({
        id: `announcement:${announcement._id}`,
        type: "announcement",
        title: "Announcement published",
        detail: announcement.title,
        createdAt: announcement.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return res.status(200).json({
      stats: {
        totalStudents,
        totalTeachers,
        totalAdmins,
        activeClasses,
        totalAnnouncements,
        attendanceCount,
        gradeCount,
      },
      recentActivity,
    });
  } catch (error) {
    return next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({ users });
  } catch (error) {
    return next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const payload = sanitizeUserPayload(req.body);

    if (!payload.name || !payload.email || !payload.password || !payload.role) {
      return res.status(400).json({
        message: "name, email, password, and role are required",
      });
    }

    const exists = await User.findOne({ email: payload.email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const user = await User.create({
      ...payload,
      email: payload.email.toLowerCase().trim(),
      name: payload.name.trim(),
    });

    return res.status(201).json({
      message: "User created successfully",
      user: await User.findById(user._id).select("-password"),
    });
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const payload = sanitizeUserPayload(req.body);
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (payload.name !== undefined) user.name = payload.name.trim();
    if (payload.email !== undefined) user.email = payload.email.toLowerCase().trim();
    if (payload.role !== undefined) user.role = payload.role;
    if (payload.isActive !== undefined) user.isActive = payload.isActive;
    if (payload.profile !== undefined) user.profile = payload.profile;
    if (payload.teacherDetails !== undefined) user.teacherDetails = payload.teacherDetails;
    if (payload.studentDetails !== undefined) user.studentDetails = payload.studentDetails;
    if (payload.password) user.password = payload.password;

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      user: await User.findById(user._id).select("-password"),
    });
  } catch (error) {
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

const listClasses = async (req, res, next) => {
  try {
    const classes = await Class.find()
      .populate("teacher", "name email role")
      .populate("students", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ classes });
  } catch (error) {
    return next(error);
  }
};

const createClass = async (req, res, next) => {
  try {
    const { name, section, subject, code, teacher, students, schedule, isActive } = req.body;

    if (!name || !section || !subject || !code || !teacher) {
      return res.status(400).json({
        message: "name, section, subject, code, and teacher are required",
      });
    }

    const classDoc = await Class.create({
      name,
      section,
      subject,
      code,
      teacher,
      students: Array.isArray(students) ? students : [],
      schedule,
      isActive: isActive ?? true,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      message: "Class created successfully",
      class: await Class.findById(classDoc._id)
        .populate("teacher", "name email role")
        .populate("students", "name email role")
        .populate("createdBy", "name email role"),
    });
  } catch (error) {
    return next(error);
  }
};

const updateClass = async (req, res, next) => {
  try {
    const classDoc = await Class.findById(req.params.id);

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    const updatableFields = ["name", "section", "subject", "code", "teacher", "students", "schedule", "isActive"];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        classDoc[field] = req.body[field];
      }
    });

    await classDoc.save();

    return res.status(200).json({
      message: "Class updated successfully",
      class: await Class.findById(classDoc._id)
        .populate("teacher", "name email role")
        .populate("students", "name email role")
        .populate("createdBy", "name email role"),
    });
  } catch (error) {
    return next(error);
  }
};

const deleteClass = async (req, res, next) => {
  try {
    const classDoc = await Class.findByIdAndDelete(req.params.id);

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    return res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

const listAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .populate("postedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ announcements });
  } catch (error) {
    return next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, audience, isActive } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "title and message are required" });
    }

    const announcement = await Announcement.create({
      title,
      message,
      audience: audience || "all",
      isActive: isActive ?? true,
      postedBy: req.user.id,
    });

    return res.status(201).json({
      message: "Announcement created successfully",
      announcement,
    });
  } catch (error) {
    return next(error);
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    ["title", "message", "audience", "isActive"].forEach((field) => {
      if (req.body[field] !== undefined) {
        announcement[field] = req.body[field];
      }
    });

    await announcement.save();

    return res.status(200).json({
      message: "Announcement updated successfully",
      announcement,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    return res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboardStats,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  listClasses,
  createClass,
  updateClass,
  deleteClass,
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
