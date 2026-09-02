import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_URL from "../config/api";
import "../styles/orders.css";
import "../styles/admin.css";
import "../styles/admin-order-details.css";
import AdminNavbar from "../components/AdminNavbar";
import ProductImage from "../components/ProductImage";

function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin-login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/orders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load order");
      }

      setOrder(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    const token = sessionStorage.getItem("adminToken");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/orders/${id}/status?status=${status}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setOrder(data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return <h2>Loading order...</h2>;
  }

  if (!order) {
    return <p>Order not found.</p>;
  }

  return (
    <div className="admin-order-details-page">

      <AdminNavbar />

      <main className="admin-order-details-content">

        {/* TOP BAR */}

        <div className="admin-order-details-top">
          <button
            className="admin-order-back-button"
            onClick={() => navigate("/admin/orders")}
          >
            ← Back to Orders
          </button>
        </div>

        {/* HEADER */}

        <section className="admin-order-details-header">

          <div>
            <span className="admin-page-eyebrow">
              ORDER DETAILS
            </span>

            <h1>
              Order #{order.orderId}
            </h1>

            <p>
              Placed on{" "}
              {formatDateTime(order.orderDate)}
            </p>
          </div>

          <span
            className={`admin-detail-status ${order.status
              ?.toLowerCase()
              .replaceAll("_", "-")
              }`}
          >
            <span className="status-dot"></span>

            {order.status
              ?.replaceAll("_", " ")
              .toLowerCase()
              .replace(/\b\w/g, (char) =>
                char.toUpperCase()
              )}
          </span>

        </section>

        {/* CUSTOMER + DELIVERY + TOTAL */}

        <section className="admin-detail-grid">

          {/* CUSTOMER */}

          <div className="admin-detail-card">

            <div className="admin-detail-card-heading">

              <div className="admin-detail-icon blue">
                👤
              </div>

              <div>
                <h2>Customer</h2>
                <span>Customer information</span>
              </div>

            </div>

            <div className="admin-customer-info">

              <strong>
                {order.customerName}
              </strong>

              <span>
                📱 {order.customerMobile}
              </span>

            </div>

          </div>

          {/* DELIVERY */}

          <div className="admin-detail-card">

            <div className="admin-detail-card-heading">

              <div className="admin-detail-icon orange">
                📍
              </div>

              <div>
                <h2>Delivery</h2>
                <span>Customer delivery address</span>
              </div>

            </div>

            <div className="admin-delivery-info">

              <p>
                {order.address}
              </p>

              <a
                className="admin-map-button"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  order.address || ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                📍 View on Map →
              </a>

            </div>

          </div>

          {/* TOTAL */}

          <div className="admin-detail-card">

            <div className="admin-detail-card-heading">

              <div className="admin-detail-icon green">
                ₹
              </div>

              <div>
                <h2>Order Total</h2>
                <span>Final order amount</span>
              </div>

            </div>

            <div className="admin-total-amount">
              ₹
              {Number(
                order.totalAmount || 0
              ).toFixed(2)}
            </div>

            <span className="admin-free-delivery">
              Free delivery
            </span>

          </div>

        </section>

        {/* STATUS */}

        {order.status !== "CANCELLED" &&
          order.status !== "REJECTED" && (
            <section className="admin-detail-card admin-order-status-card">

              <div className="admin-detail-card-heading">

                <div className="admin-detail-icon purple">
                  📦
                </div>

                <div>
                  <h2>Order Progress</h2>

                  <span>
                    Current delivery status
                  </span>
                </div>

              </div>

              <div className="admin-detail-timeline">

                {[
                  "NEW",
                  "CONFIRMED",
                  "OUT_FOR_DELIVERY",
                  "DELIVERED",
                ].map((status, index) => {

                  const currentIndex = [
                    "NEW",
                    "CONFIRMED",
                    "OUT_FOR_DELIVERY",
                    "DELIVERED",
                  ].indexOf(order.status);

                  const completed =
                    currentIndex >= index;

                  const current =
                    currentIndex === index;

                  const labels = {
                    NEW: "Order Placed",
                    CONFIRMED: "Confirmed",
                    OUT_FOR_DELIVERY:
                      "Out for Delivery",
                    DELIVERED: "Delivered",
                  };

                  return (
                    <div
                      className={`admin-detail-timeline-step ${completed
                        ? "completed"
                        : ""
                        } ${current
                          ? "current"
                          : ""
                        }`}
                      key={status}
                    >

                      <div className="admin-detail-timeline-marker">
                        {completed ? "✓" : ""}
                      </div>

                      <span>
                        {labels[status]}
                      </span>

                    </div>
                  );
                })}

              </div>

            </section>
          )}

        {/* CANCELLED / REJECTED */}

        {(order.status === "CANCELLED" ||
          order.status === "REJECTED") && (
            <section className="admin-special-status">

              <div className="admin-special-status-icon">
                !
              </div>

              <div>
                <h2>
                  {order.status === "CANCELLED"
                    ? "Order Cancelled"
                    : "Order Rejected"}
                </h2>

                <p>
                  This order is no longer in the
                  normal delivery process.
                </p>
              </div>

            </section>
          )}

        {/* ORDER ITEMS */}

        <section className="admin-detail-card admin-order-items-card">

          <div className="admin-detail-card-heading">

            <div className="admin-detail-icon teal">
              🛍️
            </div>

            <div>
              <h2>Order Items</h2>

              <span>
                {order.items?.reduce(
                  (total, item) =>
                    total + item.quantity,
                  0
                ) || 0}{" "}
                total items
              </span>
            </div>

          </div>

          <div className="admin-detail-items">

            {order.items?.map((item) => (

              <div
                className="admin-detail-item"
                key={item.productId}
              >

                <div className="admin-detail-item-image">
                  <ProductImage
                    imageUrl={item.imageUrl}
                    alt={item.productName}
                  />
                </div>

                <div className="admin-detail-item-info">

                  <strong>
                    {item.productName}
                  </strong>

                  <span>
                    Quantity: {item.quantity}
                  </span>

                  <span>
                    ₹{item.price} ×{" "}
                    {item.quantity}
                  </span>

                </div>

                <strong className="admin-detail-item-total">
                  ₹
                  {Number(
                    item.totalPrice || 0
                  ).toFixed(2)}
                </strong>

              </div>

            ))}

          </div>

        </section>

        {/* ACTIONS */}

        <section className="admin-order-detail-actions">

          {order.status === "NEW" && (
            <button
              className="admin-detail-confirm-button"
              onClick={() =>
                updateStatus("CONFIRMED")
              }
            >
              ✓ Confirm Order
            </button>
          )}

          {order.status === "CONFIRMED" && (
            <button
              className="admin-detail-delivery-button"
              onClick={() =>
                updateStatus(
                  "OUT_FOR_DELIVERY"
                )
              }
            >
              🚚 Out for Delivery
            </button>
          )}

          {order.status ===
            "OUT_FOR_DELIVERY" && (
              <button
                className="admin-detail-delivered-button"
                onClick={() =>
                  updateStatus("DELIVERED")
                }
              >
                ✓ Mark Delivered
              </button>
            )}

        </section>

        {message && (
          <div className="admin-order-detail-error">
            <span>!</span>
            <p>{message}</p>
          </div>
        )}

      </main>

    </div>
  );
}

export default AdminOrderDetails;
