import { useLocation, useNavigate } from "react-router-dom";
import CustomerNavbar from "../components/CustomerNavbar";
import "../styles/customer.css";
import "../styles/order-success.css";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order;

  if (!order) {
    return (
      <>
        <CustomerNavbar />

        <main className="order-success-page">
          <div className="order-success-empty">

            <div className="order-success-empty-icon">
              📦
            </div>

            <h2>Order details unavailable</h2>

            <p>
              We couldn't find the order information for this page.
            </p>

            <button
              className="order-success-primary-button"
              onClick={() => navigate("/orders")}
            >
              Go to My Orders →
            </button>

          </div>
        </main>
      </>
    );
  }

  const formattedStatus =
    order.status
      ?.replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase()) ||
    "New";

  const statusClass =
    order.status
      ?.toLowerCase()
      .replaceAll("_", "-") || "new";

  return (
    <>
      <CustomerNavbar />

      <main className="order-success-page">

        <section className="order-success-container">

          <div className="order-success-hero">

            <div className="order-success-icon">
              ✓
            </div>

            <span className="order-success-eyebrow">
              ORDER CONFIRMED
            </span>

            <h1>
              Order Placed Successfully
            </h1>

            <p>
              Your order has been received and is now
              being processed.
            </p>

          </div>

          <section className="order-success-card">

            <div className="order-success-card-header">

              <div>
                <span className="order-success-card-label">
                  ORDER NUMBER
                </span>

                <h2>
                  #{order.orderId}
                </h2>
              </div>

              <span
                className={`order-success-status ${statusClass}`}
              >
                <span className="order-success-status-dot"></span>
                {formattedStatus}
              </span>

            </div>

            <div className="order-success-divider"></div>

            <div className="order-success-summary">

              <div className="order-success-summary-item">

                <span>Order ID</span>

                <strong>
                  #{order.orderId}
                </strong>

              </div>

              <div className="order-success-summary-item">

                <span>Total Amount</span>

                <strong className="order-success-total">
                  ₹
                  {Number(
                    order.totalAmount || 0
                  ).toFixed(2)}
                </strong>

              </div>

            </div>

            <div className="order-success-address">

              <div className="order-success-address-icon">
                📍
              </div>

              <div>

                <span>
                  Delivery Address
                </span>

                <strong>
                  {order.address}
                </strong>

              </div>

            </div>

          </section>

          <section className="order-success-next">

            <div className="order-success-next-heading">

              <div className="order-success-next-icon">
                🚚
              </div>

              <div>
                <h2>
                  What happens next?
                </h2>

                <p>
                  You can track your order from your account.
                </p>
              </div>

            </div>

            <div className="order-success-steps">

              <div className="order-success-step active">

                <div className="order-success-step-circle">
                  ✓
                </div>

                <div>
                  <strong>Order Placed</strong>
                  <span>Your order was received.</span>
                </div>

              </div>

              <div className="order-success-step">

                <div className="order-success-step-circle">
                  2
                </div>

                <div>
                  <strong>Order Confirmed</strong>
                  <span>We'll prepare your products.</span>
                </div>

              </div>

              <div className="order-success-step">

                <div className="order-success-step-circle">
                  3
                </div>

                <div>
                  <strong>Delivery</strong>
                  <span>Track it until it reaches you.</span>
                </div>

              </div>

            </div>

          </section>

          <div className="order-success-actions">

            <button
              className="order-success-primary-button"
              onClick={() =>
                navigate(`/orders/${order.orderId}`)
              }
            >
              View Order
              <span>→</span>
            </button>

            <button
              className="order-success-secondary-button"
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </button>

          </div>

          <div className="order-success-security">

            <span>🔒</span>

            <div>
              <strong>
                Your order is secure
              </strong>

              <p>
                Order details are saved to your account
                and can be viewed anytime.
              </p>
            </div>

          </div>

        </section>

      </main>
    </>
  );
}

export default OrderSuccess;
