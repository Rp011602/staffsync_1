const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "staffsync_jwt_secret_key_2026"
      );

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User not found or deleted" });
      }

      next();
    } catch (error) {
      console.error("Auth Token Error:", error.message);
      return res.status(401).json({ message: "Not authorized, invalid or expired token" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

// Role-based access control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user?.role || "Unknown"}) is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
