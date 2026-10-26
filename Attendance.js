const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // Store as YYYY-MM-DD for easy daily grouping & querying
      required: true,
    },
    checkIn: {
      type: Date,
      default: Date.now,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Present", "Late", "Half Day", "Absent"],
      default: "Present",
    },
    workHours: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance entry for same employee on same date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
