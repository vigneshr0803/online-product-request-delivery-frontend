import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import "../styles/customer.css";

function CustomerNavbar({ cartCount = 0 }) {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <nav className="customer-navbar">
      <div
        className="customer-brand"
        onClick={() => navigate("/products")}
      >
        <span className="brand-icon">🛒</span>
        <span>Product Delivery</span>
      </div>

      <div className="customer-nav-links">
        <button
          className="nav-link active"
          onClick={() => navigate("/products")}
        >
          Products
        </button>

        <button
          className="nav-link"
          onClick={() => navigate("/orders")}
        >
          My Orders
        </button>

        <button
          className="nav-link cart-link"
          onClick={() => navigate("/cart")}
        >
          Cart
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </button>

        <button
          className="nav-link"
          onClick={() => navigate("/profile")}
        >
          👤 Profile
        </button>

        <ThemeToggle />

        <button className="nav-link logout-link" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default CustomerNavbar;
