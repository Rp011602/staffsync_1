const Leave = require("../models/Leave");

// @desc    Apply for a leave
// @route   POST /api/leaves
// @access  Private (Employee, HR, Manager)
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: "End date cannot be earlier than start date" });
    }

    const leave = await Leave.create({
      employee: req.user._id,
      leaveType,
      startDate,
      endDate,
      reason,
      status: "Pending",
    });

    const populatedLeave = await Leave.findById(leave._id).populate(
      "employee",
      "name email department designation"
    );

    res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      leave: populatedLeave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to submit leave application" });
  }
};

// @desc    Get logged in user's leave history
// @route   GET /api/leaves/my-leaves
// @access  Private
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id })
      .populate("reviewedBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch your leave history" });
  }
};

// @desc    Get all leave applications (for HR & Manager)
// @route   GET /api/leaves
// @access  Private (HR, Manager)
const getAllLeaves = async (req, res) => {
  try {
    const { status, leaveType } = req.query;
    let query = {};

    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const leaves = await Leave.find(query)
      .populate("employee", "name email department designation")
      .populate("reviewedBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch leave applications" });
  }
};

// @desc    Approve or reject leave application
// @route   PUT /api/leaves/:id/status
// @access  Private (HR, Manager)
const updateLeaveStatus = async (req, res) => {
  try {
    const { status, reviewRemarks } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value. Must be Approved or Rejected" });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave application not found" });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    if (reviewRemarks !== undefined) {
      leave.reviewRemarks = reviewRemarks;
    }

    await leave.save();

    const updatedLeave = await Leave.findById(leave._id)
      .populate("employee", "name email department designation")
      .populate("reviewedBy", "name email role");

    res.json({
      success: true,
      message: `Leave application has been ${status.toLowerCase()}`,
      leave: updatedLeave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update leave status" });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
};
