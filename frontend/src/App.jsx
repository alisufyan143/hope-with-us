import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import api from "./services/api";
// Import components
import HomePage from "./components/HomePage";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import UserDashboard from "./components/dashboard/UserDashboard";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import NewCaseStudy from "./components/user/NewCaseStudy";
import CaseStudyDetail from "./components/user/CaseStudyDetail";
import EditCaseStudy from "./components/user/EditCaseStudy";
import TransactionDetail from "./components/user/TransactionDetail";
import MessagePage from "./components/user/MessagePage";

// Private route component
const PrivateRoute = ({ children, requireAdmin = false }) => {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Get user info
        const res = await api.get("/auth/me");

        setIsAuthenticated(true);
        setIsAdmin(res.data.data.role === "admin");
        setLoading(false);
      } catch (err) {
        // Clear invalid token
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    verifyUser();
  }, [token]);

  // Show loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/user-dashboard" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private routes */}
        <Route
          path="/user-dashboard"
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute requireAdmin={true}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/message/:id"
          element={
            <PrivateRoute>
              <MessagePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/case-study/new"
          element={
            <PrivateRoute>
              <NewCaseStudy />
            </PrivateRoute>
          }
        />
        <Route
          path="/case-study/edit/*"
          element={
            <PrivateRoute>
              <EditCaseStudy />
            </PrivateRoute>
          }
        />
        <Route
          path="/case-study/*"
          element={
            <PrivateRoute>
              <CaseStudyDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/transaction/:id"
          element={
            <PrivateRoute>
              <TransactionDetail />
            </PrivateRoute>
          }
        />
        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
