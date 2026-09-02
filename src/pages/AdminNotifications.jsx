import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import "../styles/admin.css";
import "../styles/admin-notifications.css";
import AdminNavbar from "../components/AdminNavbar";

function AdminNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin-login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load notifications");
      }

      setNotifications(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    const token = sessionStorage.getItem("adminToken");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.text();

      if (!response.ok) {
        throw new Error(data || "Failed to mark notification as read");
      }

      await loadNotifications();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const markAllAsRead = async () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin-login");
      return;
    }

    if (unreadNotifications.length === 0) {
      return;
    }

    try {
      await Promise.all(
        unreadNotifications.map(async (notification) => {
          const response = await fetch(
            `${API_URL}/api/admin/notifications/${notification.id}/read`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            const data = await response.text();
            throw new Error(
              data || "Failed to mark notifications as read"
            );
          }
        })
      );

      setMessage("All notifications marked as read.");

      await loadNotifications();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  );

  const readNotifications = notifications.filter(
    (notification) => notification.read
  );

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const renderNotification = (notification) => {
    const statusClass =
      notification.orderStatus
        ?.toLowerCase()
        .replaceAll("_", "-") || "unknown";

    const formattedStatus =
      notification.orderStatus
        ?.replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ) || "Unknown";

    return (
      <article
        className={`admin-notification-card ${notification.read ? "read" : "unread"
          }`}
        key={notification.id}
      >
        <div className="admin-notification-indicator">
          <span></span>
        </div>

        <div className="admin-notification-icon">
          {notification.read ? "✓" : "🔔"}
        </div>

        <div className="admin-notification-content">

          <div className="admin-notification-title-row">

            <div>
              <span className="admin-notification-type">
                {notification.type === "ORDER_CANCELLED"
                  ? "ORDER CANCELLED"
                  : "ORDER UPDATE"}
              </span>

              <h3>
                {notification.type === "ORDER_CANCELLED"
                  ? `Order #${notification.orderId} Cancelled`
                  : `New Order #${notification.orderId}`}
              </h3>
            </div>

            <span
              className={`admin-notification-status ${statusClass}`}
            >
              {formattedStatus}
            </span>

          </div>

          <p className="admin-notification-customer">
            {notification.customerName}
            {" • "}
            {notification.customerMobile}
          </p>

          <div className="admin-notification-details">

            <div>
              <span>Total</span>
              <strong>
                ₹
                {Number(
                  notification.totalAmount || 0
                ).toFixed(2)}
              </strong>
            </div>

            <div>
              <span>Delivery Address</span>
              <strong>
                {notification.address}
              </strong>
            </div>

          </div>

          <p className="admin-notification-time">
            {formatDateTime(
              notification.createdAt
            )}
          </p>

          <div className="admin-notification-actions">

            <button
              className="admin-notification-view-button"
              onClick={() =>
                navigate(
                  `/admin/orders/${notification.orderId}`
                )
              }
            >
              View Order →
            </button>

            {!notification.read && (
              <button
                className="admin-notification-read-button"
                onClick={() =>
                  markAsRead(notification.id)
                }
              >
                ✓ Mark as Read
              </button>
            )}

          </div>

        </div>

      </article>
    );
  };

  if (loading) {
    return <h2>Loading notifications...</h2>;
  }

  return (
    <div className="admin-notifications-page">

      <AdminNavbar
        unreadCount={unreadNotifications.length}
      />

      <main className="admin-notifications-content">

        {/* HEADER */}

        <section className="notifications-header">

          <div>
            <span className="admin-page-eyebrow">
              ACTIVITY CENTER
            </span>

            <h1>Notifications</h1>

            <p>
              Stay updated with important store activity
              and customer orders.
            </p>
          </div>

          <button
            className="notifications-back-button"
            onClick={() => navigate("/admin")}
          >
            ← Dashboard
          </button>

        </section>

        {/* SUMMARY */}

        <section className="notification-summary">

          <div className="summary-box unread-count">

            <div className="notification-summary-icon">
              🔔
            </div>

            <div>
              <strong>
                {unreadNotifications.length}
              </strong>

              <span>
                Unread
              </span>
            </div>

          </div>

          <div className="summary-box read-count">

            <div className="notification-summary-icon">
              ✓
            </div>

            <div>
              <strong>
                {readNotifications.length}
              </strong>

              <span>
                Read
              </span>
            </div>

          </div>

          <div className="summary-box total-count">

            <div className="notification-summary-icon">
              📋
            </div>

            <div>
              <strong>
                {notifications.length}
              </strong>

              <span>
                Total
              </span>
            </div>

          </div>

        </section>

        {/* MESSAGE */}

        {message && (
          <div className="notification-message">
            <span>✓</span>
            <p>{message}</p>
          </div>
        )}

        {/* UNREAD */}

        {unreadNotifications.length > 0 && (
          <section className="notification-section">

            <div className="notification-section-header">

              <div>
                <div className="section-heading-with-dot">
                  <span className="attention-dot"></span>

                  <h2>Needs Attention</h2>
                </div>

                <p>
                  Notifications that you haven't reviewed yet.
                </p>
              </div>

              <button
                className="mark-all-button"
                onClick={markAllAsRead}
              >
                ✓ Mark All as Read
              </button>

            </div>

            <div className="notifications-list">
              {unreadNotifications.map(
                renderNotification
              )}
            </div>

          </section>
        )}

        {/* READ HISTORY */}

        <section className="notification-section">

          <div className="notification-section-header">

            <div>
              <div className="section-heading-with-dot history">
                <span className="history-dot"></span>

                <h2>Notification History</h2>
              </div>

              <p>
                Previously reviewed notifications.
              </p>
            </div>

          </div>

          {readNotifications.length === 0 ? (
            <div className="notifications-empty">

              <div className="notifications-empty-icon">
                ✓
              </div>

              <h3>
                No read notifications
              </h3>

              <p>
                Notifications you mark as read will
                appear here.
              </p>

            </div>
          ) : (
            <div className="notifications-list">
              {readNotifications.map(
                renderNotification
              )}
            </div>
          )}

        </section>

        {/* NO NOTIFICATIONS */}

        {notifications.length === 0 && (
          <section className="notifications-empty">

            <div className="notifications-empty-icon">
              🔔
            </div>

            <h3>
              You're all caught up
            </h3>

            <p>
              New order notifications will appear here.
            </p>

            <button
              className="notifications-dashboard-button"
              onClick={() => navigate("/admin")}
            >
              Back to Dashboard
            </button>

          </section>
        )}

      </main>

    </div>
  );
}

export default AdminNotifications;
