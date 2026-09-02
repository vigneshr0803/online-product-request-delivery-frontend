import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

function AdminNavbar({ unreadCount = 0 }) {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("adminToken");
    navigate("/admin-login", { replace: true });
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-brand" onClick={() => navigate("/admin")}>
        Product Delivery
      </div>

      <div className="admin-nav-links">
        <button onClick={() => navigate("/admin")}>Dashboard</button>

        <button onClick={() => navigate("/admin/products")}>Products</button>

        <button onClick={() => navigate("/admin/orders")}>Orders</button>

        <button
          className="notification-nav-button"
          onClick={() => navigate("/admin/notifications")}
        >
          Notifications
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>

        <button onClick={() => navigate("/admin/change-password")}>
          🔐 Security
        </button>

        <ThemeToggle />

        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

export default AdminNavbar;
