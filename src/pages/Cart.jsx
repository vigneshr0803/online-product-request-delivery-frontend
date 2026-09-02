import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CustomerNavbar from "../components/CustomerNavbar";
import ProductImage from "../components/ProductImage";
import "../styles/customer.css";
import "../styles/cart.css";

function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
  } = useCart();

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

  return (
    <>
      <CustomerNavbar cartCount={cartCount} />

      <main className="cart-page">
        <div className="cart-header">
          <div>
            <span className="page-eyebrow">
              SHOPPING CART
            </span>

            <h1>Your Cart</h1>

            <p>
              Review your products before placing your order.
            </p>
          </div>

          <button
            className="btn btn-outline"
            onClick={() => navigate("/products")}
          >
            ← Continue Shopping
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart card">
            <div className="empty-cart-icon">
              🛒
            </div>

            <h2>Your cart is empty</h2>

            <p>
              You haven't added any products yet.
            </p>

            <button
              className="btn btn-primary"
              onClick={() => navigate("/products")}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items card">
              <div className="cart-items-header">
                <h2>Items in your cart</h2>

                <span>
                  {cartCount}{" "}
                  {cartCount === 1 ? "item" : "items"}
                </span>
              </div>

              {cartItems.map((item) => {
                const itemTotal =
                  item.product.price *
                  item.quantity;

                const availableStock =
                  item.product.availableQuantity;

                return (
                  <div
                    className="cart-item"
                    key={item.product.id}
                  >
                    <div className="cart-product-image">
                      <ProductImage
                        imageUrl={
                          item.product.imageUrl
                        }
                        alt={item.product.name}
                      />
                    </div>

                    <div className="cart-product-info">
                      <h3>
                        {item.product.name}
                      </h3>

                      <p>
                        ₹{item.product.price}
                        {" / "}
                        {item.product.unit}
                      </p>

                      {availableStock <= 5 &&
                        availableStock > 0 && (
                          <span className="cart-low-stock">
                            Only {availableStock} left
                          </span>
                        )}

                      {availableStock <= 0 && (
                        <span className="cart-out-stock">
                          Out of stock
                        </span>
                      )}
                    </div>

                    <div className="cart-quantity">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity - 1
                          )
                        }
                        disabled={
                          item.quantity <= 1
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity + 1
                          )
                        }
                        disabled={
                          item.quantity >=
                          availableStock
                        }
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-price">
                      <strong>
                        ₹{itemTotal.toFixed(2)}
                      </strong>

                      <button
                        type="button"
                        className="remove-cart-button"
                        onClick={() =>
                          removeFromCart(
                            item.product.id
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </section>

            <aside className="cart-summary card">
              <div className="cart-summary-title">
                <h2>Order Summary</h2>
              </div>

              <div className="summary-row">
                <span>
                  Items
                </span>

                <span>
                  {cartCount}
                </span>
              </div>

              <div className="summary-row">
                <span>
                  Subtotal
                </span>

                <span>
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="summary-row">
                <span>
                  Delivery
                </span>

                <span>
                  Free
                </span>
              </div>

              <div className="summary-divider" />

              <div className="summary-row cart-total-row">
                <strong>
                  Total
                </strong>

                <strong>
                  ₹{subtotal.toFixed(2)}
                </strong>
              </div>

              <button
                className="btn btn-primary checkout-btn"
                onClick={() =>
                  navigate("/checkout")
                }
              >
                Proceed to Checkout
                <span>→</span>
              </button>

              <p className="secure-checkout">
                🔒 Secure checkout
              </p>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

export default Cart;
