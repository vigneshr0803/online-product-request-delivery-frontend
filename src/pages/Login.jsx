import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobile,
            password,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data.message || "Invalid mobile number or password"
        );
      }

      const token =
        typeof data === "string"
          ? data
          : data.token;

      if (!token) {
        throw new Error(
          "Login succeeded but no token was returned."
        );
      }

      sessionStorage.setItem("token", token);
      sessionStorage.removeItem("adminToken");

      navigate("/products", { replace: true });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-login-page">

      {/* Brand section */}
      <section className="customer-login-brand">
        <div className="customer-brand-logo">
          🛒
        </div>

        <span className="customer-brand-label">
          PRODUCT DELIVERY
        </span>

        <h1>
          Fresh products.
          <br />
          Delivered simply.
        </h1>

        <p>
          Order fresh products from the comfort
          of your home and track your order
          every step of the way.
        </p>

        <div className="customer-benefits">

          <div className="customer-benefit">
            <span className="benefit-icon green">
              ✓
            </span>
            Fresh products
          </div>

          <div className="customer-benefit">
            <span className="benefit-icon blue">
              ✓
            </span>
            Easy ordering
          </div>

          <div className="customer-benefit">
            <span className="benefit-icon orange">
              ✓
            </span>
            Order tracking
          </div>

        </div>
      </section>

      {/* Login */}
      <section className="customer-login-container">

        <div className="customer-login-card">

          <div className="customer-login-icon">
            👋
          </div>

          <h2>Welcome back</h2>

          <p className="customer-login-subtitle">
            Sign in to continue shopping
          </p>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="customer-mobile">
                Mobile Number
              </label>

              <input
                id="customer-mobile"
                type="tel"
                value={mobile}
                onChange={(event) =>
                  setMobile(event.target.value)
                }
                placeholder="+91 9876543210"
                autoComplete="tel"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="customer-password">
                Password
              </label>

              <input
                id="customer-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="button"
              className="forgot-password-link"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>

            {message && (
              <div className="customer-login-error">
                <span>⚠</span>
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              className="customer-login-button"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Login to Continue"}
            </button>

          </form>

          <div className="customer-register-text">
            Don't have an account?
          </div>

          <button
            type="button"
            className="customer-register-button"
            onClick={() => navigate("/register")}
          >
            Create a new account
          </button>

          <button
            type="button"
            className="customer-admin-link"
            onClick={() => navigate("/admin-login")}
          >
            Admin Login
          </button>

        </div>

      </section>

    </div>
  );
}

export default Login;
