const Announcement = require("../models/Announcement");

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private (All authenticated users)
const getAllAnnouncements = async (req, res) => {
  try {
    const userRole = req.user?.role || "Employee";

    // Show announcements targeted to "All" or specifically matching user's role
    const announcements = await Announcement.find({
      $or: [{ targetAudience: "All" }, { targetAudience: userRole }],
    })
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: announcements.length, announcements });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch announcements" });
  }
};

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private (HR)
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority, targetAudience } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const announcement = await Announcement.create({
      title,
      content,
      priority: priority || "Medium",
      targetAudience: targetAudience || "All",
      createdBy: req.user._id,
    });

    const populated = await Announcement.findById(announcement._id).populate(
      "createdBy",
      "name email role"
    );

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      announcement: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create announcement" });
  }
};

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private (HR)
const updateAnnouncement = async (req, res) => {
  try {
    const { title, content, priority, targetAudience } = req.body;

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (priority) announcement.priority = priority;
    if (targetAudience) announcement.targetAudience = targetAudience;

    await announcement.save();

    const populated = await Announcement.findById(announcement._id).populate(
      "createdBy",
      "name email role"
    );

    res.json({
      success: true,
      message: "Announcement updated successfully",
      announcement: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update announcement" });
  }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private (HR)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete announcement" });
  }
};

module.exports = {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
