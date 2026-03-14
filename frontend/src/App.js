import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import ResumePage from "./pages/ResumePage";
import PromptsPage from "./pages/PromptsPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import { Toaster } from "./components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
export const AuthContext = React.createContext(null);

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    }
  };

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, API }}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={token ? <Navigate to="/dashboard" /> : <LoginPage />}
            />
            <Route
              path="/"
              element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard"
              element={token ? <DashboardLayout /> : <Navigate to="/login" />}
            >
              <Route index element={<DashboardPage />} />
              <Route path="resume" element={<ResumePage />} />
              <Route path="prompts" element={<PromptsPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </AuthContext.Provider>
  );
}

export default App;

import * as React from 'react';
