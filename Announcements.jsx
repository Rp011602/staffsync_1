import React, { useState, useEffect } from "react";
import API from "../services/api";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await API.get("/announcements");
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return <span className="badge badge-danger">High Priority</span>;
      case "Medium":
        return <span className="badge badge-warning">Medium</span>;
      default:
        return <span className="badge badge-info">General</span>;
    }
  };

  return (
    <div className="component-card">
      <div className="component-header">
        <div>
          <h3>Company Announcements</h3>
          <p className="subtitle">Stay updated with latest news and company directives</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchAnnouncements}>
          Refresh
        </button>
      </div>

      {loading && <div className="loading-state">Loading announcements...</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && announcements.length === 0 && (
        <div className="empty-state">No announcements posted at this time.</div>
      )}

      <div className="announcements-list">
        {announcements.map((item) => (
          <div key={item._id} className="announcement-card">
            <div className="announcement-top">
              <h4>{item.title}</h4>
              <div className="announcement-tags">
                {getPriorityBadge(item.priority)}
                <span className="badge badge-light">Audience: {item.targetAudience}</span>
              </div>
            </div>
            <p className="announcement-content">{item.content}</p>
            <div className="announcement-meta">
              <span>Posted by: {item.createdBy?.name || "HR Department"}</span>
              <span>•</span>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
