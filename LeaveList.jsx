import React, { useState, useEffect } from "react";
import API from "../services/api";

const LeaveList = ({ refreshTrigger }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const res = await API.get("/leaves/my-leaves");
      setLeaves(res.data.leaves || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load leave history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, [refreshTrigger]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return <span className="badge badge-success">Approved</span>;
      case "Rejected":
        return <span className="badge badge-danger">Rejected</span>;
      default:
        return <span className="badge badge-warning">Pending Review</span>;
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
          <h3>My Leave History</h3>
          <p className="subtitle">Track approval statuses and feedback for your leave requests</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchMyLeaves}>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Period</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Reviewed By / Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center">Loading leave applications...</td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No leave applications found.</td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave._id}>
                  <td><strong>{leave.leaveType}</strong></td>
                  <td>
                    {new Date(leave.startDate).toLocaleDateString()} to{" "}
                    {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td>{calculateDays(leave.startDate, leave.endDate)} days</td>
                  <td>{leave.reason}</td>
                  <td>{getStatusBadge(leave.status)}</td>
                  <td>
                    {leave.reviewedBy ? (
                      <div>
                        <div>{leave.reviewedBy.name} ({leave.reviewedBy.role})</div>
                        {leave.reviewRemarks && (
                          <small className="text-muted">"{leave.reviewRemarks}"</small>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted">Awaiting decision</span>
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

export default LeaveList;
