import React, { useState, useEffect } from "react";
import API from "../services/api";

const TrainingManagement = () => {
  const [trainings, setTrainings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    title: "",
    description: "",
    trainer: "",
    department: "Engineering",
    startDate: "",
    endDate: "",
    status: "Planned",
    assignedEmployees: [],
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trainingsRes, employeesRes] = await Promise.all([
        API.get("/trainings"),
        API.get("/employees"),
      ]);
      setTrainings(trainingsRes.data.trainings || []);
      setEmployees(employeesRes.data.employees || []);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to load training data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmployeeToggle = (empId) => {
    const current = [...formData.assignedEmployees];
    const index = current.indexOf(empId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(empId);
    }
    setFormData({ ...formData, assignedEmployees: current });
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleEdit = (training) => {
    setEditingId(training._id);
    setFormData({
      title: training.title,
      description: training.description,
      trainer: training.trainer,
      department: training.department,
      startDate: training.startDate ? training.startDate.split("T")[0] : "",
      endDate: training.endDate ? training.endDate.split("T")[0] : "",
      status: training.status,
      assignedEmployees: training.assignedEmployees?.map((e) => (typeof e === "object" ? e._id : e)) || [],
    });
    setShowModal(true);
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

    try {
      if (editingId) {
        await API.put(`/trainings/${editingId}`, formData);
        setMessage({ text: "Training program updated successfully!", type: "success" });
      } else {
        await API.post("/trainings", formData);
        setMessage({ text: "Training program scheduled successfully!", type: "success" });
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(initialForm);
      fetchData();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to save training program",
        type: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this training program?")) return;

    try {
      await API.delete(`/trainings/${id}`);
      setMessage({ text: "Training program deleted successfully", type: "success" });
      fetchData();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to delete training",
        type: "error",
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "In Progress":
        return <span className="badge badge-warning">In Progress</span>;
      case "Completed":
        return <span className="badge badge-success">Completed</span>;
      case "Cancelled":
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge badge-info">Planned</span>;
    }
  };

  return (
    <div className="component-card">
      <div className="component-header">
        <div>
          <h3>Training & Professional Development</h3>
          <p className="subtitle">Design upskilling curriculums and assign team members</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          + Plan New Training
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {/* Modal / Form */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card modal-card-wide">
            <div className="modal-header">
              <h4>{editingId ? "Update Training Program" : "Plan New Training Program"}</h4>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Training Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    placeholder="e.g. Advanced React & State Management"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="trainer">Trainer / Instructor *</label>
                  <input
                    type="text"
                    id="trainer"
                    name="trainer"
                    required
                    placeholder="e.g. Dr. Sarah Jenkins"
                    value={formData.trainer}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="department">Target Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Program Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date *</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">End Date *</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Curriculum & Description *</label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  required
                  placeholder="Outline objectives, prerequisites, and learning goals..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              {/* Employee multi-select checklist */}
              <div className="form-group">
                <label>Assign Team Members ({formData.assignedEmployees.length} selected)</label>
                <div className="selection-list">
                  {employees.map((emp) => (
                    <label key={emp._id} className="selection-item">
                      <input
                        type="checkbox"
                        checked={formData.assignedEmployees.includes(emp._id)}
                        onChange={() => handleEmployeeToggle(emp._id)}
                      />
                      <span>
                        <strong>{emp.name}</strong> ({emp.department} - {emp.designation})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update Training" : "Schedule Training"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trainings Grid / Cards */}
      <div className="trainings-grid">
        {loading ? (
          <div className="loading-state">Loading training programs...</div>
        ) : trainings.length === 0 ? (
          <div className="empty-state">No training programs scheduled yet.</div>
        ) : (
          trainings.map((t) => (
            <div key={t._id} className="training-card">
              <div className="training-header">
                <div>
                  <h4>{t.title}</h4>
                  <span className="text-muted">Instructor: {t.trainer}</span>
                </div>
                {getStatusBadge(t.status)}
              </div>

              <p className="training-desc">{t.description}</p>

              <div className="training-info">
                <div>
                  <strong>Timeline:</strong>{" "}
                  {new Date(t.startDate).toLocaleDateString()} -{" "}
                  {new Date(t.endDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Target:</strong> {t.department}
                </div>
                <div>
                  <strong>Attendees:</strong> {t.assignedEmployees?.length || 0} staff enrolled
                </div>
              </div>

              <div className="training-card-actions">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => handleEdit(t)}
                >
                  Edit / Assign
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(t._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrainingManagement;
