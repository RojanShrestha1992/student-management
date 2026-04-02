const express = require("express");
const { protect, authorize } = require("../../middleware/authMiddleware");
const {
  getMyClasses,
  getClassStudents,
  markAttendance,
  getAttendanceForClass,
  upsertGrade,
  getGradesForClass,
} = require("../../controllers/teacher/teacherController");
const { getMyAnnouncements } = require("../../controllers/student/studentController");

const router = express.Router();

router.use(protect, authorize("teacher"));

router.get("/classes", getMyClasses);
router.get("/classes/:classId/students", getClassStudents);
router.get("/classes/:classId/attendance", getAttendanceForClass);
router.post("/attendance", markAttendance);
router.get("/classes/:classId/grades", getGradesForClass);
router.post("/grades", upsertGrade);
router.get("/announcements", getMyAnnouncements);

module.exports = router;
