import React, { useState, useEffect } from "react";
import API from "../services/api";

const LeaveApplications = () => {
  const [leaves, setLeaves] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    leaveId: null,
    status: "",
    remarks: "",
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const url = filterStatus ? `/leaves?status=${filterStatus}` : "/leaves";
      const res = await API.get(url);
      setLeaves(res.data.leaves || []);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to load leave requests",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus]);

  const openReviewModal = (leaveId, status) => {
    setReviewModal({
      isOpen: true,
      leaveId,
      status,
      remarks: "",
    });
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/leaves/${reviewModal.leaveId}/status`, {
        status: reviewModal.status,
        reviewRemarks: reviewModal.remarks,
      });

      setMessage({
        text: `Leave request marked as ${reviewModal.status}`,
        type: "success",
      });
      setReviewModal({ isOpen: false, leaveId: null, status: "", remarks: "" });
      fetchLeaves();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to update leave status",
        type: "error",
      });
    }
  };

  const calculateDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e - s);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="component-card">
      <div className="component-header">
        <div>
          <h3>Leave Applications Review (HR)</h3>
          <p className="subtitle">Review, approve, or reject employee time-off requests</p>
        </div>

        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-inline"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending Only</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {/* Review Remarks Modal */}
      {reviewModal.isOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h4>Confirm Action: {reviewModal.status}</h4>
              <button
                className="close-btn"
                onClick={() => setReviewModal({ ...reviewModal, isOpen: false })}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleStatusSubmit} className="form-grid">
              <div className="form-group">
                <label htmlFor="remarks">HR Remarks / Feedback (Optional)</label>
                <textarea
                  id="remarks"
                  rows="3"
                  placeholder="e.g. Approved based on department coverage..."
                  value={reviewModal.remarks}
                  onChange={(e) =>
                    setReviewModal({ ...reviewModal, remarks: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className={`btn ${
                    reviewModal.status === "Approved" ? "btn-success" : "btn-danger"
                  }`}
                >
                  Confirm {reviewModal.status}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setReviewModal({ ...reviewModal, isOpen: false })}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leaves Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Dates</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center">Loading leave requests...</td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">No leave applications found.</td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave._id}>
                  <td>
                    <strong>{leave.employee?.name || "Unknown"}</strong>
                    <div className="text-muted">{leave.employee?.department}</div>
                  </td>
                  <td>{leave.leaveType}</td>
                  <td>
                    {new Date(leave.startDate).toLocaleDateString()} -{" "}
                    {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td>{calculateDays(leave.startDate, leave.endDate)} days</td>
                  <td>{leave.reason}</td>
                  <td>
                    <span
                      className={`badge ${
                        leave.status === "Approved"
                          ? "badge-success"
                          : leave.status === "Rejected"
                          ? "badge-danger"
                          : "badge-warning"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>
                  <td>
                    {leave.status === "Pending" ? (
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => openReviewModal(leave._id, "Approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => openReviewModal(leave._id, "Rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="text-muted">
                        <small>Decided</small>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveApplications;
