import React, { useState } from "react";
import API from "../services/api";

const LeaveApply = ({ onLeaveApplied }) => {
  const [formData, setFormData] = useState({
    leaveType: "Casual Leave",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      return setMessage({
        text: "End date cannot be earlier than start date",
        type: "error",
      });
    }

    setLoading(true);

    try {
      const res = await API.post("/leaves", formData);
      setMessage({
        text: res.data.message || "Leave application submitted successfully!",
        type: "success",
      });
      setFormData({
        leaveType: "Casual Leave",
        startDate: "",
        endDate: "",
        reason: "",
      });
      if (onLeaveApplied) onLeaveApplied();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to submit leave application",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component-card">
      <div className="component-header">
        <div>
          <h3>Apply for Leave</h3>
          <p className="subtitle">Submit a new time-off request for HR or Manager approval</p>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label htmlFor="leaveType">Leave Type</label>
          <select
            id="leaveType"
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            required
          >
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Paid Leave">Paid Leave</option>
            <option value="Maternity/Paternity">Maternity/Paternity</option>
            <option value="Unpaid Leave">Unpaid Leave</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reason">Reason for Leave</label>
          <textarea
            id="reason"
            name="reason"
            rows="3"
            placeholder="Briefly state the reason for your time-off request..."
            value={formData.reason}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Submitting Request..." : "Submit Leave Application"}
        </button>
      </form>
    </div>
  );
};

export default LeaveApply;
