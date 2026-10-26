import React, { useState, useEffect } from "react";
import API from "../services/api";

const AnnouncementsManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "Medium",
    targetAudience: "All",
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await API.get("/announcements");
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to load announcements",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    try {
      if (editingId) {
        await API.put(`/announcements/${editingId}`, formData);
        setMessage({ text: "Announcement updated successfully!", type: "success" });
        setEditingId(null);
      } else {
        await API.post("/announcements", formData);
        setMessage({ text: "Announcement published successfully!", type: "success" });
      }

      setFormData({
        title: "",
        content: "",
        priority: "Medium",
        targetAudience: "All",
      });
      fetchAnnouncements();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to save announcement",
        type: "error",
      });
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      content: item.content,
      priority: item.priority,
      targetAudience: item.targetAudience,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: "",
      content: "",
      priority: "Medium",
      targetAudience: "All",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    try {
      await API.delete(`/announcements/${id}`);
      setMessage({ text: "Announcement deleted successfully", type: "success" });
      fetchAnnouncements();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to delete announcement",
        type: "error",
      });
    }
  };

  return (
    <div className="component-card">
      <div className="component-header">
        <div>
          <h3>Announcements Management</h3>
          <p className="subtitle">Publish, update, or remove company-wide bulletins</p>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {/* Create / Edit Form */}
      <form onSubmit={handleSubmit} className="form-grid mb-4">
        <h4>{editingId ? "Edit Announcement" : "Create Announcement"}</h4>
        <div className="form-group">
          <label htmlFor="title">Headline / Title</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            placeholder="e.g. Annual Company Offsite 2026 Announcement"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority Level</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High (Urgent)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="targetAudience">Target Audience</label>
            <select
              id="targetAudience"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
            >
              <option value="All">All Employees</option>
              <option value="Employee">Staff Only</option>
              <option value="Manager">Managers Only</option>
              <option value="HR">HR Team Only</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            rows="4"
            required
            placeholder="Write announcement body details here..."
            value={formData.content}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingId ? "Save Changes" : "Publish Announcement"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancelEdit}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Announcements Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Audience</th>
              <th>Priority</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center">Loading announcements...</td>
              </tr>
            ) : announcements.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No announcements recorded.</td>
              </tr>
            ) : (
              announcements.map((item) => (
                <tr key={item._id}>
                  <td>
                    <strong>{item.title}</strong>
                    <div className="text-muted text-truncate" style={{ maxWidth: "350px" }}>
                      {item.content}
                    </div>
                  </td>
                  <td><span className="badge badge-light">{item.targetAudience}</span></td>
                  <td>
                    <span
                      className={`badge ${
                        item.priority === "High"
                          ? "badge-danger"
                          : item.priority === "Medium"
                          ? "badge-warning"
                          : "badge-info"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>
                    </div>
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

export default AnnouncementsManager;
