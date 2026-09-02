import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import "../styles/admin.css";
import AdminNavbar from "../components/AdminNavbar";

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin-login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load dashboard");
      }

      setDashboard(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return <h2>Loading dashboard...</h2>;
  }

  if (message) {
    return <p>{message}</p>;
  }

  return (
    <div className="admin-dashboard-page">
      <AdminNavbar unreadCount={dashboard.unreadNotifications} />

      <main className="admin-dashboard-content">
        <section className="admin-dashboard-header">
          <div>
            <span className="admin-page-eyebrow">ADMINISTRATION</span>

            <h1>Admin Dashboard</h1>

            <p>Here's an overview of your store and recent activity.</p>
          </div>

          <button
            className="admin-logout-button"
            onClick={() => {
              sessionStorage.removeItem("adminToken");
              navigate("/admin-login", {
                replace: true,
              });
            }}
          >
            <span>↪</span>
            Logout
          </button>
        </section>

        <section className="dashboard-stats">
          <div className="dashboard-stat-card stat-orders">
            <div className="dashboard-stat-icon">📦</div>

            <div className="dashboard-stat-content">
              <span>Total Orders</span>
              <strong>{dashboard.totalOrders}</strong>
              <small>All orders</small>
            </div>
          </div>

          <div className="dashboard-stat-card stat-new-orders">
            <div className="dashboard-stat-icon">🔔</div>

            <div className="dashboard-stat-content">
              <span>New Orders</span>
              <strong>{dashboard.newOrders}</strong>
              <small>Waiting for action</small>
            </div>
          </div>

          <div className="dashboard-stat-card stat-products">
            <div className="dashboard-stat-icon">🛍️</div>

            <div className="dashboard-stat-content">
              <span>Active Products</span>
              <strong>{dashboard.activeProducts}</strong>
              <small>Currently available</small>
            </div>
          </div>

          <div className="dashboard-stat-card stat-notifications">
            <div className="dashboard-stat-icon">🔔</div>

            <div className="dashboard-stat-content">
              <span>Unread Notifications</span>
              <strong>{dashboard.unreadNotifications}</strong>
              <small>
                {dashboard.unreadNotifications > 0 ? "Need your attention" : "All caught up"}
              </small>
            </div>
          </div>
        </section>

        <section className="dashboard-quick-actions">
          <div className="dashboard-section-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Manage your store quickly.</p>
            </div>
          </div>

          <div className="quick-action-grid">
            <button
              className="quick-action-card action-products"
              onClick={() => navigate("/admin/products")}
            >
              <span className="quick-action-icon">🛍️</span>

              <span>
                <strong>Manage Products</strong>
                <small>Add, edit or deactivate products</small>
              </span>

              <span className="quick-action-arrow">→</span>
            </button>

            <button
              className="quick-action-card action-add"
              onClick={() => navigate("/admin/products/add")}
            >
              <span className="quick-action-icon">➕</span>

              <span>
                <strong>Add Product</strong>
                <small>Add a new product to your store</small>
              </span>

              <span className="quick-action-arrow">→</span>
            </button>

            <button
              className="quick-action-card action-orders"
              onClick={() => navigate("/admin/orders")}
            >
              <span className="quick-action-icon">📦</span>

              <span>
                <strong>Manage Orders</strong>
                <small>Review and update orders</small>
              </span>

              <span className="quick-action-arrow">→</span>
            </button>

            <button
              className="quick-action-card action-notifications"
              onClick={() => navigate("/admin/notifications")}
            >
              <span className="quick-action-icon">🔔</span>

              <span>
                <strong>Notifications</strong>
                <small>View customer order alerts</small>
              </span>

              {dashboard.unreadNotifications > 0 && (
                <span className="quick-action-badge">{dashboard.unreadNotifications}</span>
              )}

              <span className="quick-action-arrow">→</span>
            </button>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <h2>Recent Orders</h2>
              <p>Latest customer orders requiring attention.</p>
            </div>

            <button className="dashboard-view-all" onClick={() => navigate("/admin/orders")}>
              View All →
            </button>
          </div>

          {dashboard.recentOrders.length === 0 ? (
            <div className="dashboard-empty card">
              <div className="dashboard-empty-icon">📦</div>

              <h3>No orders yet</h3>
              <p>Customer orders will appear here.</p>
            </div>
          ) : (
            <div className="recent-orders-list">
              {dashboard.recentOrders.map((order) => {
                const statusClass = order.status?.toLowerCase().replaceAll("_", "-");

                return (
                  <div className="recent-order-card" key={order.orderId}>
                    <div className="recent-order-main">
                      <div className="recent-order-number">
                        <span>ORDER</span>
                        <strong>#{order.orderId}</strong>
                      </div>

                      <div className="recent-order-customer">
                        <strong>{order.customerName}</strong>
                        <span>Customer</span>
                      </div>
                    </div>

                    <div className="recent-order-date">
                      <span>Placed</span>
                      <strong>{formatDateTime(order.orderDate)}</strong>
                    </div>

                    <div className="recent-order-amount">
                      <span>Total</span>
                      <strong>₹{Number(order.totalAmount || 0).toFixed(2)}</strong>
                    </div>

                    <span className={`admin-order-status ${statusClass}`}>
                      <span className="status-dot"></span>
                      {order.status
                        ?.replaceAll("_", " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                    </span>

                    <button
                      className="recent-order-view"
                      onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                    >
                      View
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
