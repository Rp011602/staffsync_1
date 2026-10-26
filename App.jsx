import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Pages
import Login from "./auth/Login";
import Register from "./auth/Register";

// Dashboard Pages
import EmployeeDashboard from "./pages/EmployeeDashboard";
import HrDashboard from "./pages/HrDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";

// Root redirect handler
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="fullscreen-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "HR") return <Navigate to="/hr" replace />;
  if (user.role === "Manager") return <Navigate to="/manager" replace />;
  return <Navigate to="/employee" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <div className="app-container">
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Employee Routes */}
            <Route
              path="/employee/*"
              element={
                <ProtectedRoute allowedRoles={["Employee"]}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected HR Routes */}
            <Route
              path="/hr/*"
              element={
                <ProtectedRoute allowedRoles={["HR"]}>
                  <HrDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Manager Routes */}
            <Route
              path="/manager/*"
              element={
                <ProtectedRoute allowedRoles={["Manager"]}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Default root path redirects to appropriate role dashboard or login */}
            <Route path="/" element={<RootRedirect />} />

            {/* Fallback route */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
