const express = require("express");
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../Controllers/employeeController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

router
  .route("/")
  .get(authorize("HR", "Manager"), getAllEmployees)
  .post(authorize("HR"), createEmployee);

router
  .route("/:id")
  .get(authorize("HR", "Manager"), getEmployeeById)
  .put(authorize("HR"), updateEmployee)
  .delete(authorize("HR"), deleteEmployee);

module.exports = router;
