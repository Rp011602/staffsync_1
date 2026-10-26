import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute: Enforces authentication and Role-Based Access Control (RBAC)
 * @param {Array} allowedRoles - List of authorized roles (e.g. ['HR'], ['Manager'], ['Employee'])
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="fullscreen-loading">
        <div className="spinner"></div>
        <p>Verifying authentication credentials...</p>
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check: If route requires specific roles and current user's role is not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect user to their own authorized dashboard
    if (user.role === "HR") {
      return <Navigate to="/hr" replace />;
    } else if (user.role === "Manager") {
      return <Navigate to="/manager" replace />;
    } else {
      return <Navigate to="/employee" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
