const User = require("../../models/User");
const Attendance = require("../../models/Attendance");
const Grade = require("../../models/Grade");
const Announcement = require("../../models/Announcement");
const Class = require("../../models/Class");

const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("studentDetails.class", "name section subject code teacher");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
};

const getMyAttendance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.studentDetails?.class) {
      return res.status(200).json({ attendance: [] });
    }

    const attendance = await Attendance.find({
      student: req.user.id,
      class: user.studentDetails.class,
    })
      .populate("class", "name section subject code")
      .populate("teacher", "name email role")
      .sort({ date: -1 });

    return res.status(200).json({ attendance });
  } catch (error) {
    return next(error);
  }
};

const getMyGrades = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.studentDetails?.class) {
      return res.status(200).json({ grades: [] });
    }

    const grades = await Grade.find({
      student: req.user.id,
      class: user.studentDetails.class,
    })
      .populate("class", "name section subject code")
      .populate("teacher", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ grades });
  } catch (error) {
    return next(error);
  }
};

const getMyAnnouncements = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const audience = user?.role || "student";

    const announcements = await Announcement.find({
      isActive: true,
      $or: [{ audience: "all" }, { audience }],
    })
      .populate("postedBy", "name email role")
      .sort({ publishedAt: -1 });

    return res.status(200).json({ announcements });
  } catch (error) {
    return next(error);
  }
};

const getMyClass = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "studentDetails.class",
      "name section subject code teacher students"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ classInfo: user.studentDetails?.class || null });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyProfile,
  getMyAttendance,
  getMyGrades,
  getMyAnnouncements,
  getMyClass,
};
