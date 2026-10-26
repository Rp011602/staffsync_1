const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Training title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Training description is required"],
    },
    trainer: {
      type: String,
      required: [true, "Trainer name is required"],
    },
    department: {
      type: String,
      default: "All",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    status: {
      type: String,
      enum: ["Planned", "In Progress", "Completed", "Cancelled"],
      default: "Planned",
    },
    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Training", trainingSchema);
