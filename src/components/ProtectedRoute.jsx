import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const userData = localStorage.getItem("user");

  if (!userData) {
    return <Navigate to="/" replace />;
  }

  const user = JSON.parse(userData);

  // 🔐 Admin route protection
  if (location.pathname.startsWith("/admin") && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // 🔐 Employee should not access admin
  if (
    location.pathname.startsWith("/dashboard") &&
    user.role !== "employee"
  ) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default ProtectedRoute;