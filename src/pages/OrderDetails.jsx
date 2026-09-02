import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_URL from "../config/api";
import "../styles/orders.css";
import "../styles/customer.css";
import CustomerNavbar from "../components/CustomerNavbar";
import ProductImage from "../components/ProductImage";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/orders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load order"
        );
      }

      setOrder(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel Order #${order.orderId}?`
    );

    if (!confirmed) {
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setCancelling(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/orders/${order.orderId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.text();

      if (!response.ok) {
        throw new Error(
          data || "Failed to cancel order"
        );
      }

      setOrder({
        ...order,
        status: "CANCELLED",
      });

      setMessage("Order cancelled successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "NEW":
        return "status-new";
      case "CONFIRMED":
        return "status-confirmed";
      case "OUT_FOR_DELIVERY":
        return "status-delivery";
      case "DELIVERED":
        return "status-delivered";
      case "CANCELLED":
        return "status-cancelled";
      case "REJECTED":
        return "status-rejected";
      default:
        return "status-default";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusIndex = (status) => {
    switch (status) {
      case "NEW":
        return 0;
      case "CONFIRMED":
        return 1;
      case "OUT_FOR_DELIVERY":
        return 2;
      case "DELIVERED":
        return 3;
      case "CANCELLED":
      case "REJECTED":
        return -1;
      default:
        return 0;
    }
  };

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const currentStatusIndex = getStatusIndex(order?.status);

  if (loading) {
    return <h2>Loading order...</h2>;
  }

  if (message) {
    return <p>{message}</p>;
  }

  if (!order) {
    return <p>Order not found.</p>;
  }

  return (
    <>
      <CustomerNavbar />

      <main className="order-details-page">
        <div className="order-details-top">
          <button
            className="order-back-button"
            onClick={() => navigate("/orders")}
          >
            ← Back to My Orders
          </button>
        </div>

        <>
          <section className="order-details-header card">
            <div>
              <span className="page-eyebrow">ORDER DETAILS</span>

              <h1>Order #{order.orderId}</h1>

              {(order.orderDate || order.createdAt || order.created_at) && (
                <p>
                  Placed on {formatDate(order.orderDate || order.createdAt || order.created_at)}
                </p>
              )}
            </div>

            <span className={`order-status order-status-large ${getStatusClass(order.status)}`}>
              <span className="status-dot"></span>
              {formatStatus(order.status)}
            </span>
          </section>

          {order.status !== "CANCELLED" && order.status !== "REJECTED" && (
            <section className="order-tracking-card card">
              <div className="order-section-title">
                <div>
                  <h2>Order Status</h2>
                  <p>Track your order from placement to delivery.</p>
                </div>
              </div>

              <div className="order-timeline">
                {[
                  { label: "Order Placed", icon: "✓" },
                  { label: "Confirmed", icon: "✓" },
                  { label: "Out for Delivery", icon: "🚚" },
                  { label: "Delivered", icon: "✓" },
                ].map((step, index) => {
                  const completed = currentStatusIndex >= index;
                  const current = currentStatusIndex === index;

                  return (
                    <div
                      className={`timeline-step ${completed ? "completed" : ""} ${current ? "current" : ""}`}
                      key={step.label}
                    >
                      <div className="timeline-marker">
                        {completed ? step.icon : ""}
                      </div>

                      <div className="timeline-content">
                        <strong>{step.label}</strong>
                        {current && <span>Current status</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {(order.status === "CANCELLED" || order.status === "REJECTED") && (
            <section className="order-special-status card">
              <div className="special-status-icon">!</div>

              <div>
                <h2>{formatStatus(order.status)}</h2>
                <p>This order is no longer in the normal delivery process.</p>
              </div>
            </section>
          )}

          <section className="order-details-card card">
            <div className="order-section-title">
              <div>
                <h2>Order Items</h2>
                <p>Products included in this order.</p>
              </div>

              <span className="order-item-count">
                {order.items?.length || 0} {order.items?.length === 1 ? "product" : "products"}
              </span>
            </div>

            <div className="order-details-items">
              {order.items?.map((item) => (
                <div className="order-details-item" key={item.productId}>
                  <div className="order-detail-product-image">
                    <ProductImage
                      imageUrl={item.imageUrl}
                      alt={item.productName}
                    />
                  </div>

                  <div className="order-detail-product-info">
                    <h3>{item.productName}</h3>
                    <span>Quantity: {item.quantity}</span>

                    {item.price !== undefined && (
                      <span>
                        ₹{item.price} × {item.quantity}
                      </span>
                    )}
                  </div>

                  <strong className="order-detail-item-total">
                    ₹{Number(item.totalPrice || 0).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          {(order.status === "NEW" || order.status === "CONFIRMED") && (
            <div className="order-action-row">
              <button
                className="cancel-order-button"
                onClick={cancelOrder}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          )}

          <div className="order-details-bottom">
            <section className="order-address-card card">
              <div className="order-section-title">
                <div>
                  <h2>Delivery Address</h2>
                  <p>Your saved delivery location.</p>
                </div>

                <span className="address-icon">📍</span>
              </div>

              <div className="saved-address">{order.address}</div>

              <a
                className="map-button"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  order.address || ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                📍 View on Map
              </a>
            </section>

            <section className="order-summary-card card">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Items</span>
                <span>
                  {order.items?.reduce((total, item) => total + item.quantity, 0) || 0}
                </span>
              </div>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{Number(order.totalAmount || 0).toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Delivery</span>
                <span className="free-delivery">Free</span>
              </div>

              <div className="summary-divider" />

              <div className="summary-row order-final-total">
                <strong>Total</strong>
                <strong>₹{Number(order.totalAmount || 0).toFixed(2)}</strong>
              </div>
            </section>
          </div>
        </>

        {!loading && !order && (
          <div className="order-not-found card">
            <div className="empty-orders-icon">📦</div>
            <h2>Order not found</h2>
            <p>We couldn't find this order.</p>
            <button className="orders-primary-button" onClick={() => navigate("/orders")}>
              Back to My Orders
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export default OrderDetails;
