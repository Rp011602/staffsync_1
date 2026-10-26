const User = require("../models/User");

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (HR/Manager)
const getAllEmployees = async (req, res) => {
  try {
    const { department, role, status, search } = req.query;
    let query = {};

    if (department) query.department = department;
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
      ];
    }

    const employees = await User.find(query).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, count: employees.length, employees });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch employees" });
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private (HR/Manager)
const getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select("-password");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch employee" });
  }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private (HR)
const createEmployee = async (req, res) => {
  try {
    const { name, email, password, role, department, designation, phone, salary, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Employee with this email already exists" });
    }

    const employee = await User.create({
      name,
      email,
      password,
      role: role || "Employee",
      department: department || "General",
      designation: designation || "Staff",
      phone: phone || "",
      salary: salary || 0,
      status: status || "Active",
    });

    const createdEmployee = await User.findById(employee._id).select("-password");
    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee: createdEmployee,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create employee" });
  }
};

// @desc    Update employee record
// @route   PUT /api/employees/:id
// @access  Private (HR)
const updateEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const { name, role, department, designation, phone, salary, status } = req.body;

    if (name) employee.name = name;
    if (role) employee.role = role;
    if (department) employee.department = department;
    if (designation) employee.designation = designation;
    if (phone !== undefined) employee.phone = phone;
    if (salary !== undefined) employee.salary = salary;
    if (status) employee.status = status;

    // If password update is supplied
    if (req.body.password && req.body.password.trim() !== "") {
      employee.password = req.body.password;
    }

    const updatedEmployee = await employee.save();
    const result = await User.findById(updatedEmployee._id).select("-password");

    res.json({
      success: true,
      message: "Employee updated successfully",
      employee: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update employee" });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (HR)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Prevent deleting self
    if (employee._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete employee" });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
