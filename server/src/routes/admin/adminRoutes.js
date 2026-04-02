const express = require("express");
const { protect, authorize } = require("../../middleware/authMiddleware");
const {
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
} = require("../../controllers/admin/adminController");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/dashboard", getDashboardStats);
router.get("/users", listUsers);
router.post("/users", createUser);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/classes", listClasses);
router.post("/classes", createClass);
router.put("/classes/:id", updateClass);
router.delete("/classes/:id", deleteClass);

router.get("/announcements", listAnnouncements);
router.post("/announcements", createAnnouncement);
router.put("/announcements/:id", updateAnnouncement);
router.delete("/announcements/:id", deleteAnnouncement);

module.exports = router;
