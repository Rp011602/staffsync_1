import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("staffsync_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("staffsync_token");
      if (token) {
        try {
          const res = await API.get("/auth/me");
          setUser(res.data.user);
          localStorage.setItem("staffsync_user", JSON.stringify(res.data.user));
        } catch {
          localStorage.removeItem("staffsync_token");
          localStorage.removeItem("staffsync_user");
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("staffsync_token", token);
    localStorage.setItem("staffsync_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("staffsync_token");
    localStorage.removeItem("staffsync_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
