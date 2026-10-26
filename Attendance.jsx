import React, { useState, useEffect } from "react";
import API from "../services/api";

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await API.get("/attendance/my-attendance");
      setRecords(res.data.records || []);
      setTodayRecord(res.data.todayRecord || null);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to load attendance",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleMarkAttendance = async () => {
    try {
      setActionLoading(true);
      setMessage({ text: "", type: "" });
      const res = await API.post("/attendance/mark", {});
      setMessage({
        text: res.data.message || "Attendance marked successfully!",
        type: "success",
      });
      await fetchAttendance();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to mark attendance",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Present":
        return <span className="badge badge-success">Present</span>;
      case "Late":
        return <span className="badge badge-warning">Late</span>;
      case "Half Day":
        return <span className="badge badge-info">Half Day</span>;
      default:
        return <span className="badge badge-danger">Absent</span>;
    }
  };

  return (
    <div className="component-card">
      <div className="component-header">
        <div>
          <h3>Attendance Punch & History</h3>
          <p className="subtitle">Clock your work hours and review recent attendance logs</p>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {/* Clock in / out banner */}
      <div className="punch-banner">
        <div className="punch-info">
          <h4>Today's Shift: {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "short", day: "numeric" })}</h4>
          <p>
            {todayRecord ? (
              <>
                Checked In: <strong>{formatTime(todayRecord.checkIn)}</strong>
                {todayRecord.checkOut && (
                  <> | Checked Out: <strong>{formatTime(todayRecord.checkOut)}</strong> ({todayRecord.workHours} hrs)</>
                )}
              </>
            ) : (
              "You have not checked in yet today."
            )}
          </p>
        </div>

        <div className="punch-actions">
          {!todayRecord ? (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleMarkAttendance}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Clock In"}
            </button>
          ) : !todayRecord.checkOut ? (
            <button
              className="btn btn-warning btn-lg"
              onClick={handleMarkAttendance}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Clock Out"}
            </button>
          ) : (
            <div className="shift-completed">
              Shift Completed ({todayRecord.workHours} hrs)
            </div>
          )}
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Work Hours</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center">Loading logs...</td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No attendance logs found.</td>
              </tr>
            ) : (
              records.map((rec) => (
                <tr key={rec._id}>
                  <td><strong>{rec.date}</strong></td>
                  <td>{formatTime(rec.checkIn)}</td>
                  <td>{formatTime(rec.checkOut)}</td>
                  <td>{rec.workHours ? `${rec.workHours} hrs` : "--"}</td>
                  <td>{getStatusBadge(rec.status)}</td>
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

export default Attendance;
