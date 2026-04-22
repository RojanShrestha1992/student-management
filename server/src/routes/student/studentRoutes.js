const express = require("express");
const { protect, authorize } = require("../../middleware/authMiddleware");
const {
  getMyProfile,
  getMyAttendance,
  getMyGrades,
  getMyAnnouncements,
  getMyClass,
  getMyMaterials,
} = require("../../controllers/student/studentController");

const router = express.Router();

router.use(protect, authorize("student"));

router.get("/me", getMyProfile);
router.get("/class", getMyClass);
router.get("/attendance", getMyAttendance);
router.get("/grades", getMyGrades);
router.get("/announcements", getMyAnnouncements);
router.get("/materials", getMyMaterials);

module.exports = router;
