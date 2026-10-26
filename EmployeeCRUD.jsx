import React, { useState, useEffect } from "react";
import API from "../services/api";

const EmployeeCRUD = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const initialForm = {
    name: "",
    email: "",
    password: "",
    role: "Employee",
    department: "Engineering",
    designation: "Software Engineer",
    phone: "",
    salary: "",
    status: "Active",
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/employees?search=${searchTerm}`);
      setEmployees(res.data.employees || []);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to load employees",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowForm(true);
  };

  const handleEdit = (emp) => {
    setEditingId(emp._id);
    setFormData({
      name: emp.name,
      email: emp.email,
      password: "", // leave blank unless updating
      role: emp.role,
      department: emp.department,
      designation: emp.designation,
      phone: emp.phone || "",
      salary: emp.salary || "",
      status: emp.status || "Active",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    try {
      if (editingId) {
        // Update employee
        const payload = { ...formData };
        if (!payload.password) delete payload.password;

        await API.put(`/employees/${editingId}`, payload);
        setMessage({ text: "Employee updated successfully!", type: "success" });
      } else {
        // Create employee
        await API.post("/employees", formData);
        setMessage({ text: "Employee added successfully!", type: "success" });
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(initialForm);
      fetchEmployees();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Error saving employee record",
        type: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) return;

    try {
      await API.delete(`/employees/${id}`);
      setMessage({ text: "Employee removed successfully", type: "success" });
      fetchEmployees();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to delete employee",
        type: "error",
      });
    }
  };

  return (
    <div className="component-card">
      <div className="component-header">
        <div>
          <h3>Employee Directory & Management</h3>
          <p className="subtitle">Manage staff records, departments, roles, and status</p>
        </div>

        <div className="header-actions">
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-inline"
            style={{ width: "260px" }}
          />
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            + Add Employee
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {/* Form Drawer / Modal */}
      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h4>{editingId ? "Edit Employee Record" : "Add New Employee"}</h4>
              <button
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    disabled={!!editingId} // email shouldn't be changed during edit
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role">Role *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="Employee">Employee</option>
                    <option value="HR">HR Specialist</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="designation">Designation / Title</label>
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="salary">Salary ($/year)</label>
                  <input
                    type="number"
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  {editingId ? "Password (leave blank to keep current)" : "Password *"}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required={!editingId}
                  placeholder={editingId ? "Enter new password if updating" : "Min 6 characters"}
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update Employee" : "Save Employee"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employees Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name & Contact</th>
              <th>Role</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center">Loading employee records...</td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">No employees found.</td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp._id}>
                  <td>
                    <strong>{emp.name}</strong>
                    <div className="text-muted">{emp.email}</div>
                    {emp.phone && <small className="text-muted">{emp.phone}</small>}
                  </td>
                  <td><span className="badge badge-light">{emp.role}</span></td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>${Number(emp.salary || 0).toLocaleString()}</td>
                  <td>
                    <span
                      className={`badge ${
                        emp.status === "Active"
                          ? "badge-success"
                          : emp.status === "On Leave"
                          ? "badge-warning"
                          : "badge-danger"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleEdit(emp)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(emp._id)}
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

export default EmployeeCRUD;
