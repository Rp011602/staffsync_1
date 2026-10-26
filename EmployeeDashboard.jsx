import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Attendance from "../employee/Attendance";
import LeaveApply from "../employee/LeaveApply";
import LeaveList from "../employee/LeaveList";
import Announcements from "../employee/Announcements";

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("attendance");
  const [leaveRefreshKey, setLeaveRefreshKey] = useState(0);

  const handleLeaveApplied = () => {
    setLeaveRefreshKey((prev) => prev + 1);
    setActiveTab("leaves");
  };

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <header className="dashboard-navbar">
        <div className="navbar-brand">
          <h2>StaffSync <span className="portal-tag">Employee Portal</span></h2>
        </div>

        <div className="user-profile-badge">
          <div className="user-meta">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.designation} • {user?.department}</span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={logout}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          Punch & Attendance
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
          Announcements
        </button>
      </div>

      {/* Main Content Area */}
      <main className="dashboard-content">
        {activeTab === "attendance" && <Attendance />}

        {activeTab === "leaves" && (
          <div className="leaves-container">
            <LeaveApply onLeaveApplied={handleLeaveApplied} />
            <LeaveList refreshTrigger={leaveRefreshKey} />
          </div>
        )}

        {activeTab === "announcements" && <Announcements />}
      </main>
    </div>
  );
};

export default EmployeeDashboard;
