import { Navigate } from "react-router-dom";

function getTokenPayload(token) {
  try {
    const payload = token.split(".")[1];

    return JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
  } catch {
    return null;
  }
}

function ProtectedRoute({ children, admin = false }) {
  const customerToken = sessionStorage.getItem("token");
  const adminToken = sessionStorage.getItem("adminToken");

  if (admin) {
    if (!adminToken) {
      return <Navigate to="/admin-login" replace />;
    }

    const payload = getTokenPayload(adminToken);

    if (!payload || payload.role !== "ADMIN") {
      sessionStorage.removeItem("adminToken");

      return <Navigate to="/admin-login" replace />;
    }

    return children;
  }

  if (!customerToken) {
    return <Navigate to="/login" replace />;
  }

  const payload = getTokenPayload(customerToken);

  if (!payload) {
    sessionStorage.removeItem("token");

    return <Navigate to="/login" replace />;
  }

  if (payload.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default ProtectedRoute;
