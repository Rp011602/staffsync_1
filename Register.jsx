import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Employee",
    department: "Engineering",
    designation: "Software Engineer",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters long");
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        designation: formData.designation,
        phone: formData.phone,
      };

      const res = await API.post("/auth/register", payload);
      const { user, token } = res.data;
      login(user, token);

      if (user.role === "HR") {
        navigate("/hr");
      } else if (user.role === "Manager") {
        navigate("/manager");
      } else {
        navigate("/employee");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="brand-logo">StaffSync</div>
          <h2>Create an Account</h2>
          <p>Register as an Employee, HR Specialist, or Team Manager</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Work Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="e.g. john@staffsync.io"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">Account Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Employee">Employee</option>
                <option value="HR">HR Specialist</option>
                <option value="Manager">Department Manager</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="designation">Designation / Job Title</label>
              <input
                type="text"
                id="designation"
                name="designation"
                placeholder="e.g. Frontend Developer"
                value={formData.designation}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already registered? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
