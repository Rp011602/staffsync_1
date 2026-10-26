import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ManagerLeaveApplications from "../manager/LeaveApplications";
import TrainingManagement from "../manager/TrainingManagement";

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("trainings");

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <header className="dashboard-navbar">
        <div className="navbar-brand">
          <h2>StaffSync <span className="portal-tag manager-tag">Management Hub</span></h2>
        </div>

        <div className="user-profile-badge">
          <div className="user-meta">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">Department Manager • {user?.department}</span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={logout}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === "trainings" ? "active" : ""}`}
          onClick={() => setActiveTab("trainings")}
        >
          Training Programs
        </button>
        <button
          className={`tab-btn ${activeTab === "leaves" ? "active" : ""}`}
          onClick={() => setActiveTab("leaves")}
        >
          Team Leave Approvals
        </button>
      </div>

      {/* Main Content Area */}
      <main className="dashboard-content">
        {activeTab === "trainings" && <TrainingManagement />}
        {activeTab === "leaves" && <ManagerLeaveApplications />}
      </main>
    </div>
  );
};

export default ManagerDashboard;
