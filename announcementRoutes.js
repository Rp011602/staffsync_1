const express = require("express");
const router = express.Router();
const {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../Controllers/announcementController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getAllAnnouncements);
router.post("/", authorize("HR"), createAnnouncement);
router.put("/:id", authorize("HR"), updateAnnouncement);
router.delete("/:id", authorize("HR"), deleteAnnouncement);

module.exports = router;
