const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getMyAttendance,
  getAllAttendance,
} = require("../Controllers/attendanceController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/mark", markAttendance);
router.get("/my-attendance", getMyAttendance);
router.get("/summary", authorize("HR", "Manager"), getAllAttendance);

module.exports = router;
