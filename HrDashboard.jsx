import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import EmployeeCRUD from "../hr/EmployeeCRUD";
import AttendanceSummary from "../hr/AttendanceSummary";
import LeaveApplications from "../hr/LeaveApplications";
import AnnouncementsManager from "../hr/AnnouncementsManager";

const HrDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("employees");

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <header className="dashboard-navbar">
        <div className="navbar-brand">
          <h2>StaffSync <span className="portal-tag hr-tag">HR Operations Center</span></h2>
        </div>

        <div className="user-profile-badge">
          <div className="user-meta">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">Human Resources Specialist</span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={logout}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === "employees" ? "active" : ""}`}
          onClick={() => setActiveTab("employees")}
        >
          Employees Directory
        </button>
        <button
          className={`tab-btn ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          Daily Attendance
        </button>
        <button
          className={`tab-btn ${activeTab === "leaves" ? "active" : ""}`}
          onClick={() => setActiveTab("leaves")}
        >
          Leave Requests
        </button>
        <button
          className={`tab-btn ${activeTab === "announcements" ? "active" : ""}`}
          onClick={() => setActiveTab("announcements")}
        >
          Announcements Manager
        </button>
      </div>

      {/* Main Content Area */}
      <main className="dashboard-content">
        {activeTab === "employees" && <EmployeeCRUD />}
        {activeTab === "attendance" && <AttendanceSummary />}
        {activeTab === "leaves" && <LeaveApplications />}
        {activeTab === "announcements" && <AnnouncementsManager />}
      </main>
    </div>
  );
};

export default HrDashboard;
