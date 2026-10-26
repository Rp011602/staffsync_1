const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./Routes/authRoutes");
const employeeRoutes = require("./Routes/employeeRoutes");
const leaveRoutes = require("./Routes/leaveRoutes");
const attendanceRoutes = require("./Routes/attendanceRoutes");
const announcementRoutes = require("./Routes/announcementRoutes");
const trainingRoutes = require("./Routes/trainingRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/trainings", trainingRoutes);

app.get("/", (req, res) => {
  res.send("HRM Backend Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));