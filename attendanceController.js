const Attendance = require("../models/Attendance");
const User = require("../models/User");

// Helper to get formatted YYYY-MM-DD date string
const getTodayDateString = () => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

// @desc    Mark attendance (Check-in or Check-out)
// @route   POST /api/attendance/mark
// @access  Private (All authenticated users)
const markAttendance = async (req, res) => {
  try {
    const today = getTodayDateString();
    const userId = req.user._id;
    const now = new Date();

    let attendance = await Attendance.findOne({ employee: userId, date: today });

    if (!attendance) {
      // First action of the day: Check-in
      // If after 9:30 AM local time, can be marked as 'Late'
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const isLate = hours > 9 || (hours === 9 && minutes > 30);

      attendance = await Attendance.create({
        employee: userId,
        date: today,
        checkIn: now,
        status: isLate ? "Late" : "Present",
        notes: req.body.notes || (isLate ? "Late Check-in" : "On-time Check-in"),
      });

      return res.status(201).json({
        success: true,
        type: "CHECK_IN",
        message: "Checked in successfully",
        attendance,
      });
    }

    // If checkIn exists and checkOut has not been performed: Check-out
    if (attendance.checkIn && !attendance.checkOut) {
      attendance.checkOut = now;

      // Calculate work hours
      const diffMs = now.getTime() - new Date(attendance.checkIn).getTime();
      const diffHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
      attendance.workHours = diffHours;

      if (diffHours < 4) {
        attendance.status = "Half Day";
      }

      await attendance.save();

      return res.json({
        success: true,
        type: "CHECK_OUT",
        message: "Checked out successfully",
        attendance,
      });
    }

    // Both checkIn and checkOut exist already
    return res.status(400).json({
      message: "Attendance for today has already been completed with Check-in and Check-out",
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to mark attendance" });
  }
};

// @desc    Get logged-in user's attendance records
// @route   GET /api/attendance/my-attendance
// @access  Private
const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ employee: req.user._id })
      .sort({ date: -1 })
      .limit(30);

    const today = getTodayDateString();
    const todayRecord = records.find((r) => r.date === today) || null;

    res.json({
      success: true,
      todayRecord,
      count: records.length,
      records,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch attendance records" });
  }
};

// @desc    Get all employees' attendance summary / history
// @route   GET /api/attendance/summary
// @access  Private (HR, Manager)
const getAllAttendance = async (req, res) => {
  try {
    const { date, status, department } = req.query;
    const targetDate = date || getTodayDateString();

    let query = { date: targetDate };
    if (status) {
      query.status = status;
    }

    const records = await Attendance.find(query)
      .populate("employee", "name email department designation")
      .sort({ createdAt: -1 });

    // Optional filter by department on populated employee
    const filteredRecords = department
      ? records.filter((r) => r.employee && r.employee.department === department)
      : records;

    const totalEmployees = await User.countDocuments({ role: "Employee", status: "Active" });
    const presentCount = filteredRecords.filter((r) => r.status === "Present").length;
    const lateCount = filteredRecords.filter((r) => r.status === "Late").length;
    const halfDayCount = filteredRecords.filter((r) => r.status === "Half Day").length;
    const totalMarked = filteredRecords.length;
    const absentCount = Math.max(0, totalEmployees - totalMarked);

    res.json({
      success: true,
      date: targetDate,
      summary: {
        totalEmployees,
        totalMarked,
        presentCount,
        lateCount,
        halfDayCount,
        absentCount,
      },
      records: filteredRecords,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch attendance summary" });
  }
};

module.exports = {
  markAttendance,
  getMyAttendance,
  getAllAttendance,
};
