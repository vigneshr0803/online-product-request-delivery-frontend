import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import CustomerNavbar from "../components/CustomerNavbar";
import ProductImage from "../components/ProductImage";
import "../styles/customer.css";
import "../styles/orders.css";

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/orders`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load orders"
        );
      }

      setOrders(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
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
    if (!status) {
      return "UNKNOWN";
    }

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (value) => {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const cancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel Order #${orderId}?`
    );

    if (!confirmed) {
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setCancellingOrderId(orderId);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/cancel`,
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

      setMessage(
        `Order #${orderId} cancelled successfully.`
      );

      await loadOrders();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setCancellingOrderId(null);
    }
  };

  if (loading) {
    return (
      <>
        <CustomerNavbar />

        <main className="orders-page">
          <div className="orders-loading">
            <div className="loading-spinner"></div>
            <h2>Loading your orders...</h2>
            <p>Please wait a moment.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <CustomerNavbar />

      <main className="orders-page">
        <div className="orders-page-header">
          <div>
            <span className="page-eyebrow">ORDER HISTORY</span>

            <h1>My Orders</h1>

            <p>Track and manage your recent purchases.</p>
          </div>

          {orders.length > 0 && (
            <div className="orders-count">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </div>
          )}
        </div>

        {message && (
          <div className="orders-error">
            <span>!</span>
            <p>{message}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="empty-orders card">
            <div className="empty-orders-icon">🛍️</div>

            <h2>No orders yet</h2>

            <p>
              Your orders will appear here after you make a purchase.
            </p>

            <button
              className="orders-primary-button"
              onClick={() => navigate("/products")}
            >
              Start Shopping
              <span>→</span>
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const totalItems =
                order.items?.reduce((total, item) => total + item.quantity, 0) || 0;

              const formattedDate = formatDate(
                order.orderDate || order.createdAt || order.created_at
              );

              return (
                <article className="customer-order-card" key={order.orderId}>
                  <div className="customer-order-header">
                    <div>
                      <span className="order-number-label">Order</span>

                      <h2>#{order.orderId}</h2>

                      {formattedDate && (
                        <p className="order-date">{formattedDate}</p>
                      )}
                    </div>

                    <span className={`order-status ${getStatusClass(order.status)}`}>
                      <span className="status-dot"></span>
                      {formatStatus(order.status)}
                    </span>
                  </div>

                  <div className="customer-order-items">
                    <div className="customer-order-items-header">
                      <h3>Items</h3>

                      <span>
                        {totalItems} {totalItems === 1 ? "item" : "items"}
                      </span>
                    </div>

                    {order.items?.map((item) => (
                      <div className="customer-order-item" key={item.productId}>
                        <div className="customer-order-image">
                          <ProductImage
                            imageUrl={item.imageUrl}
                            alt={item.productName}
                          />
                        </div>

                        <div className="customer-order-product-info">
                          <strong>{item.productName}</strong>

                          <span>Qty: {item.quantity}</span>

                          <span>
                            ₹{item.price} × {item.quantity}
                          </span>
                        </div>

                        <strong className="customer-order-item-total">
                          ₹{Number(item.totalPrice || 0).toFixed(2)}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="customer-order-footer">
                    <div className="customer-order-address">
                      <span>📍 Delivery Address</span>

                      <strong>{order.address}</strong>
                    </div>

                    <div className="customer-order-total">
                      <span>Total</span>

                      <strong>₹{Number(order.totalAmount || 0).toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="customer-order-action">
                    <button
                      className="view-order-button"
                      onClick={() => navigate(`/orders/${order.orderId}`)}
                    >
                      View Order Details
                      <span>→</span>
                    </button>

                    {(order.status === "NEW" ||
                      order.status === "CONFIRMED") && (
                        <button
                          className="cancel-order-button"
                          onClick={() =>
                            cancelOrder(order.orderId)
                          }
                          disabled={
                            cancellingOrderId === order.orderId
                          }
                        >
                          {cancellingOrderId === order.orderId
                            ? "Cancelling..."
                            : "Cancel Order"}
                        </button>
                      )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

export default MyOrders;
