const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "staffsync_jwt_secret_key_2026",
    {
      expiresIn: "30d",
    }
  );
};

// @desc    Register a new user (Employee, HR, Manager)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department, designation, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Role assignment: Default to Employee if not provided; restrict HR registration if preferred
    const assignedRole = role && ["Employee", "HR", "Manager"].includes(role) ? role : "Employee";

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      department: department || "General",
      designation: designation || "Staff",
      phone: phone || "",
    });

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        phone: user.phone,
      },
      token: generateToken(user._id),
      message: "Registration successful",
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          designation: user.designation,
          phone: user.phone,
          status: user.status,
        },
        token: generateToken(user._id),
        message: "Login successful",
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
