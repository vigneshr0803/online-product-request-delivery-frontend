import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import "../styles/admin.css";
import "../styles/admin-orders.css";
import AdminNavbar from "../components/AdminNavbar";
import ProductImage from "../components/ProductImage";

function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin-login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/orders`,
        {
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

  if (loading) {
    return <h2>Loading orders...</h2>;
  }

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";

    return new Date(dateTime).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const updateOrderStatus = async (orderId, status) => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin-login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/orders/${orderId}/status?status=${status}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update order status"
        );
      }

      setMessage(`Order #${orderId} updated to ${status}.`);

      await loadOrders();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      String(order.orderId).includes(search) ||
      order.customerName
        ?.toLowerCase()
        .includes(search) ||
      order.customerMobile
        ?.toLowerCase()
        .includes(search) ||
      order.address
        ?.toLowerCase()
        .includes(search);

    const matchesStatus =
      statusFilter === "ALL" ||
      order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const groupedOrders = filteredOrders.reduce((groups, order) => {
    const mobile = order.customerMobile;

    if (!groups[mobile]) {
      groups[mobile] = {
        customerName: order.customerName,
        orders: [],
      };
    }

    groups[mobile].orders.push(order);

    return groups;
  }, {});

  return (
    <div className="admin-orders-page">
      <AdminNavbar />

      <main className="admin-orders-content">
        <section className="admin-orders-header">
          <div>
            <span className="admin-page-eyebrow">
              ORDER MANAGEMENT
            </span>

            <h1>Manage Orders</h1>

            <p>
              Review customer orders and manage their
              delivery status.
            </p>
          </div>

          <button
            className="admin-orders-back-button"
            onClick={() => navigate("/admin")}
          >
            ← Dashboard
          </button>
        </section>

        <section className="admin-orders-toolbar">
          <div className="admin-orders-search">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Search order, customer, mobile or address..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <div className="admin-orders-filters">
            {[
              "ALL",
              "NEW",
              "CONFIRMED",
              "OUT_FOR_DELIVERY",
              "DELIVERED",
              "CANCELLED",
              "REJECTED",
            ].map((status) => (
              <button
                key={status}
                className={
                  statusFilter === status
                    ? "admin-order-filter active"
                    : "admin-order-filter"
                }
                onClick={() => setStatusFilter(status)}
              >
                {status === "ALL"
                  ? "All"
                  : status
                    .replaceAll("_", " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (char) =>
                      char.toUpperCase()
                    )}
              </button>
            ))}
          </div>

          <span className="admin-orders-count">
            {filteredOrders.length}{" "}
            {filteredOrders.length === 1 ? "order" : "orders"}
          </span>
        </section>

        {message && (
          <div className="admin-orders-message">
            <span>✓</span>
            <p>{message}</p>
          </div>
        )}

        {Object.entries(groupedOrders).length === 0 ? (
          <section className="admin-orders-empty">
            <div className="admin-orders-empty-icon">
              📦
            </div>

            <h2>
              {orders.length === 0
                ? "No orders yet"
                : "No matching orders"}
            </h2>

            <p>
              {orders.length === 0
                ? "Customer orders will appear here."
                : "Try another search or change the status filter."}
            </p>

            {orders.length > 0 && (
              <button
                className="admin-clear-orders-button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                }}
              >
                Clear Filters
              </button>
            )}
          </section>
        ) : (
          <div className="admin-customer-groups">
            {Object.entries(groupedOrders).map(
              ([mobile, customer]) => (
                <section
                  className="admin-customer-group"
                  key={mobile}
                >
                  <div className="admin-customer-group-header">
                    <div className="customer-profile-icon">
                      {customer.customerName
                        ?.charAt(0)
                        ?.toUpperCase() || "C"}
                    </div>

                    <div>
                      <h2>{customer.customerName}</h2>
                      <span>📱 {mobile}</span>
                    </div>

                    <div className="customer-order-count">
                      {customer.orders.length}{" "}
                      {customer.orders.length === 1
                        ? "order"
                        : "orders"}
                    </div>
                  </div>

                  <div className="customer-orders">
                    {customer.orders.map((order) => {
                      const statusClass = order.status
                        ?.toLowerCase()
                        .replaceAll("_", "-");

                      return (
                        <article
                          className="admin-order-card"
                          key={order.orderId}
                        >
                          <div className="admin-order-header">
                            <div>
                              <span className="admin-order-label">
                                ORDER
                              </span>

                              <h3>
                                #{order.orderId}
                              </h3>

                              <p>
                                {formatDateTime(
                                  order.orderDate
                                )}
                              </p>
                            </div>

                            <span
                              className={`admin-order-status-badge ${statusClass}`}
                            >
                              <span className="status-dot"></span>

                              {order.status
                                ?.replaceAll("_", " ")
                                .toLowerCase()
                                .replace(
                                  /\b\w/g,
                                  (char) =>
                                    char.toUpperCase()
                                )}
                            </span>
                          </div>

                          <div className="admin-order-summary">
                            <div className="admin-order-address">
                              <span>
                                📍 Delivery Address
                              </span>

                              <strong>
                                {order.address}
                              </strong>

                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  order.address || ""
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View on Map →
                              </a>
                            </div>

                            <div className="admin-order-total">
                              <span>Total</span>

                              <strong>
                                ₹
                                {Number(
                                  order.totalAmount || 0
                                ).toFixed(2)}
                              </strong>
                            </div>
                          </div>

                          <div className="admin-order-items-section">
                            <div className="admin-order-items-heading">
                              <h4>Order Items</h4>

                              <span>
                                {order.items?.reduce(
                                  (total, item) =>
                                    total +
                                    item.quantity,
                                  0
                                ) || 0}{" "}
                                items
                              </span>
                            </div>

                            <div className="admin-order-items">
                              {order.items?.map(
                                (item) => (
                                  <div
                                    className="admin-order-item"
                                    key={item.productId}
                                  >
                                    <div className="admin-order-item-image">
                                      <ProductImage
                                        imageUrl={
                                          item.imageUrl
                                        }
                                        alt={
                                          item.productName
                                        }
                                      />
                                    </div>

                                    <div className="admin-order-item-info">
                                      <strong>
                                        {
                                          item.productName
                                        }
                                      </strong>

                                      <span>
                                        Qty:{" "}
                                        {item.quantity}
                                      </span>
                                    </div>

                                    <div className="admin-order-item-price">
                                      <span>
                                        ₹{item.price}
                                      </span>

                                      <strong>
                                        ₹
                                        {Number(
                                          item.totalPrice ||
                                          0
                                        ).toFixed(2)}
                                      </strong>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          <div className="admin-order-actions">
                            <button
                              className="admin-view-order-button"
                              onClick={() =>
                                navigate(
                                  `/admin/orders/${order.orderId}`
                                )
                              }
                            >
                              View Details →
                            </button>

                            {order.status === "NEW" && (
                              <button
                                className="admin-status-confirm-button"
                                onClick={() =>
                                  updateOrderStatus(
                                    order.orderId,
                                    "CONFIRMED"
                                  )
                                }
                              >
                                ✓ Confirm Order
                              </button>
                            )}

                            {order.status === "CONFIRMED" && (
                              <button
                                className="admin-status-delivery-button"
                                onClick={() =>
                                  updateOrderStatus(
                                    order.orderId,
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
                                  className="admin-status-delivered-button"
                                  onClick={() =>
                                    updateOrderStatus(
                                      order.orderId,
                                      "DELIVERED"
                                    )
                                  }
                                >
                                  ✓ Mark Delivered
                                </button>
                              )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminOrders;
