const express = require("express");
const router = express.Router();
const {
  createTraining,
  getAllTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,
} = require("../Controllers/trainingController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router
  .route("/")
  .get(getAllTrainings)
  .post(authorize("Manager"), createTraining);

router
  .route("/:id")
  .get(getTrainingById)
  .put(authorize("Manager"), updateTraining)
  .delete(authorize("Manager"), deleteTraining);

module.exports = router;
