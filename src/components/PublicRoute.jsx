import { Navigate } from "react-router-dom";

function PublicRoute({ children, admin = false }) {
  const customerToken = sessionStorage.getItem("token");
  const adminToken = sessionStorage.getItem("adminToken");

  // Admin public pages
  if (admin) {
    if (adminToken) {
      return <Navigate to="/admin" replace />;
    }

    // If customer is logged in, don't show admin login.
    if (customerToken) {
      return <Navigate to="/products" replace />;
    }

    return children;
  }

  // Customer public pages
  if (customerToken) {
    return <Navigate to="/products" replace />;
  }

  // If admin is logged in, don't show customer login.
  if (adminToken) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default PublicRoute;
