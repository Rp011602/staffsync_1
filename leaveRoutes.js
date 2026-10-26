const express = require("express");
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require("../Controllers/leaveController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", applyLeave);
router.get("/my-leaves", getMyLeaves);
router.get("/", authorize("HR", "Manager"), getAllLeaves);
router.put("/:id/status", authorize("HR", "Manager"), updateLeaveStatus);

module.exports = router;
