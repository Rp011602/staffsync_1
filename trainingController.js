const Training = require("../models/Training");

// @desc    Create a new training program
// @route   POST /api/trainings
// @access  Private (Manager)
const createTraining = async (req, res) => {
  try {
    const { title, description, trainer, department, startDate, endDate, status, assignedEmployees } =
      req.body;

    if (!title || !description || !trainer || !startDate || !endDate) {
      return res.status(400).json({ message: "Please fill all required training fields" });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: "End date cannot be earlier than start date" });
    }

    const training = await Training.create({
      title,
      description,
      trainer,
      department: department || "All",
      startDate,
      endDate,
      status: status || "Planned",
      assignedEmployees: assignedEmployees || [],
      createdBy: req.user._id,
    });

    const populated = await Training.findById(training._id)
      .populate("assignedEmployees", "name email department designation")
      .populate("createdBy", "name email role");

    res.status(201).json({
      success: true,
      message: "Training program created successfully",
      training: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create training program" });
  }
};

// @desc    Get all trainings (or filtered by status/department)
// @route   GET /api/trainings
// @access  Private (Manager, HR, Employee)
const getAllTrainings = async (req, res) => {
  try {
    const { status, department } = req.query;
    let query = {};

    if (status) query.status = status;
    if (department) query.department = department;

    // If Employee, only show trainings assigned to them or department wide
    if (req.user.role === "Employee") {
      query.$or = [{ assignedEmployees: req.user._id }, { department: "All" }];
    }

    const trainings = await Training.find(query)
      .populate("assignedEmployees", "name email department designation")
      .populate("createdBy", "name email role")
      .sort({ startDate: 1 });

    res.json({ success: true, count: trainings.length, trainings });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch training programs" });
  }
};

// @desc    Get training by ID
// @route   GET /api/trainings/:id
// @access  Private
const getTrainingById = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate("assignedEmployees", "name email department designation")
      .populate("createdBy", "name email role");

    if (!training) {
      return res.status(404).json({ message: "Training program not found" });
    }

    res.json({ success: true, training });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch training program" });
  }
};

// @desc    Update training program & assigned employees
// @route   PUT /api/trainings/:id
// @access  Private (Manager)
const updateTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Training program not found" });
    }

    const {
      title,
      description,
      trainer,
      department,
      startDate,
      endDate,
      status,
      assignedEmployees,
    } = req.body;

    if (title) training.title = title;
    if (description) training.description = description;
    if (trainer) training.trainer = trainer;
    if (department) training.department = department;
    if (startDate) training.startDate = startDate;
    if (endDate) training.endDate = endDate;
    if (status) training.status = status;
    if (assignedEmployees) training.assignedEmployees = assignedEmployees;

    await training.save();

    const populated = await Training.findById(training._id)
      .populate("assignedEmployees", "name email department designation")
      .populate("createdBy", "name email role");

    res.json({
      success: true,
      message: "Training program updated successfully",
      training: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update training program" });
  }
};

// @desc    Delete training program
// @route   DELETE /api/trainings/:id
// @access  Private (Manager)
const deleteTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Training program not found" });
    }

    await Training.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Training program deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete training program" });
  }
};

module.exports = {
  createTraining,
  getAllTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,
};
