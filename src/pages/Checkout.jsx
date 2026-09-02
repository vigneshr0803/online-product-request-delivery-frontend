import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import { useCart } from "../context/CartContext";
import CustomerNavbar from "../components/CustomerNavbar";
import LocationPicker from "../components/LocationPicker";
import ProductImage from "../components/ProductImage";
import "../styles/customer.css";
import "../styles/cart.css";

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();

  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    loadSavedAddress();
  }, []);

  const loadSavedAddress = async () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load saved address"
        );
      }

      if (data.address?.trim()) {
        setAddress(data.address);
      }
    } catch (error) {
      console.error(
        "Failed to load profile address:",
        error
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

  const deliveryFee = 0;

  const totalAmount = subtotal + deliveryFee;

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!address.trim()) {
      setMessage("Please enter your delivery address.");
      return;
    }

    if (cartItems.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    const orderRequest = {
      address: address.trim(),
      items: cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderRequest),
        }
      );

      const contentType =
        response.headers.get("content-type");

      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data.message || "Failed to place order"
        );
      }

      clearCart();

      navigate("/order-success", {
        state: {
          order: data,
        },
      });
    } catch (error) {
      console.error("Place order error:", error);

      setMessage(
        error.message ||
        "Unable to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomerNavbar cartCount={cartCount} />

      <main className="checkout-page">
        <div className="checkout-header">
          <span className="page-eyebrow">
            SECURE CHECKOUT
          </span>

          <h1>Complete Your Order</h1>

          <p>
            Confirm your delivery details and review your
            order before placing it.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart card">
            <div className="empty-cart-icon">
              🛒
            </div>

            <h2>Your cart is empty</h2>

            <p>
              Add products before proceeding to checkout.
            </p>

            <button
              className="btn btn-primary"
              onClick={() => navigate("/products")}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="checkout-layout">
            <section className="checkout-card card">
              <div className="checkout-section-heading">
                <div className="checkout-section-icon">
                  📍
                </div>

                <div>
                  <h2>Delivery Details</h2>

                  <p>
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <form
                className="checkout-form"
                onSubmit={handlePlaceOrder}
              >
                <div className="form-group">
                  <LocationPicker
                    onAddressChange={setAddress}
                    initialAddress={address}
                  />

                  {profileLoading ? (
                    <span className="saved-address-hint">
                      Loading your saved delivery address...
                    </span>
                  ) : address ? (
                    <span className="saved-address-hint success">
                      ✓ Saved address loaded from your profile. You can edit it below.
                    </span>
                  ) : (
                    <span className="saved-address-hint">
                      No saved address found. Select a location or enter your address manually.
                    </span>
                  )}
                </div>

                {message && (
                  <div className="checkout-error">
                    <span className="checkout-error-icon">
                      !
                    </span>

                    <span>{message}</span>
                  </div>
                )}

                <div className="checkout-security-note">
                  <span>🔒</span>

                  <div>
                    <strong>Secure checkout</strong>

                    <span>
                      Your order information is protected.
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary place-order-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Placing Order..."
                    : "Place Order"}

                  {!loading && <span>→</span>}
                </button>
              </form>
            </section>

            <aside className="checkout-summary card">
              <div className="checkout-summary-header">
                <div>
                  <h2>Order Summary</h2>

                  <p>
                    {cartCount}{" "}
                    {cartCount === 1
                      ? "item"
                      : "items"}
                  </p>
                </div>
              </div>

              <div className="checkout-items">
                {cartItems.map((item) => {
                  const itemTotal =
                    item.product.price *
                    item.quantity;

                  return (
                    <div
                      className="checkout-product"
                      key={item.product.id}
                    >
                      <div className="checkout-product-image">
                        <ProductImage
                          imageUrl={
                            item.product.imageUrl
                          }
                          alt={item.product.name}
                        />
                      </div>

                      <div className="checkout-product-info">
                        <strong>
                          {item.product.name}
                        </strong>

                        <span>
                          {item.quantity} × ₹
                          {item.product.price}
                        </span>
                      </div>

                      <strong className="checkout-product-total">
                        ₹{itemTotal.toFixed(2)}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-price-summary">
                <div className="summary-row">
                  <span>Subtotal</span>

                  <span>
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="summary-row">
                  <span>Delivery</span>

                  <span className="free-delivery">
                    Free
                  </span>
                </div>

                <div className="summary-divider" />

                <div className="summary-row checkout-total-row">
                  <strong>Total</strong>

                  <strong>
                    ₹{totalAmount.toFixed(2)}
                  </strong>
                </div>
              </div>

              <div className="checkout-note">
                You will receive your order status through
                your account.
              </div>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

export default Checkout;
