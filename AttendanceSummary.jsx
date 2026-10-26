import React, { useState, useEffect } from "react";
import API from "../services/api";

const AttendanceSummary = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [data, setData] = useState({
    summary: {
      totalEmployees: 0,
      totalMarked: 0,
      presentCount: 0,
      lateCount: 0,
      halfDayCount: 0,
      absentCount: 0,
    },
    records: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = async (selectedDate) => {
    try {
      setLoading(true);
      const res = await API.get(`/attendance/summary?date=${selectedDate}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch attendance summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(date);
  }, [date]);

  const formatTime = (dateString) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="component-card">
      <div className="component-header">
        <div>
          <h3>Company Attendance Overview</h3>
          <p className="subtitle">Daily employee attendance tracking and real-time punch metrics</p>
        </div>

        <div className="filter-controls">
          <label htmlFor="filterDate" className="date-label">Date:</label>
          <input
            type="date"
            id="filterDate"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-inline"
          />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* KPI Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Staff</div>
          <div className="stat-value">{data.summary.totalEmployees}</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-label">Present</div>
          <div className="stat-value">{data.summary.presentCount}</div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-label">Late Arrivals</div>
          <div className="stat-value">{data.summary.lateCount}</div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-label">Half Day</div>
          <div className="stat-value">{data.summary.halfDayCount}</div>
        </div>
        <div className="stat-card stat-danger">
          <div className="stat-label">Unmarked / Absent</div>
          <div className="stat-value">{data.summary.absentCount}</div>
        </div>
      </div>

      {/* Attendance Detail Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Work Hours</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center">Loading attendance metrics...</td>
              </tr>
            ) : data.records.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">No attendance logged for {date}.</td>
              </tr>
            ) : (
              data.records.map((rec) => (
                <tr key={rec._id}>
                  <td>
                    <strong>{rec.employee?.name || "Unknown"}</strong>
                    <div className="text-muted">{rec.employee?.email}</div>
                  </td>
                  <td>{rec.employee?.department || "General"}</td>
                  <td>{formatTime(rec.checkIn)}</td>
                  <td>{formatTime(rec.checkOut)}</td>
                  <td>{rec.workHours ? `${rec.workHours} hrs` : "--"}</td>
                  <td>
                    <span
                      className={`badge ${
                        rec.status === "Present"
                          ? "badge-success"
                          : rec.status === "Late"
                          ? "badge-warning"
                          : "badge-info"
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td>{rec.notes || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceSummary;
