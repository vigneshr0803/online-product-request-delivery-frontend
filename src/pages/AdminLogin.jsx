import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import "../styles/auth.css";

function AdminLogin() {
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
        `${API_URL}/api/auth/admin/login`,
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

      const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data.message || "Invalid admin mobile number or password"
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

      sessionStorage.setItem("adminToken", token);
      sessionStorage.removeItem("token");

      navigate("/admin", { replace: true });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      {/* Left branding section */}
      <div className="admin-login-brand">
        <div className="brand-logo">🛒</div>

        <h1>Product Delivery</h1>

        <p>
          Manage products, orders and deliveries from one secure dashboard.
        </p>

        <div className="brand-features">
          <div>
            <span className="feature-icon green">✓</span>
            Product Management
          </div>

          <div>
            <span className="feature-icon blue">✓</span>
            Order Management
          </div>

          <div>
            <span className="feature-icon orange">✓</span>
            Delivery Tracking
          </div>
        </div>
      </div>

      {/* Login card */}
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-icon">🔐</div>

          <span className="admin-login-label">ADMIN PORTAL</span>

          <h2>Welcome Back</h2>

          <p className="admin-login-subtitle">
            Sign in to manage your application
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="admin-mobile">Mobile Number</label>

              <input
                id="admin-mobile"
                type="text"
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
                placeholder="Enter admin mobile"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-password">Password</label>

              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="button"
              className="forgot-password-link"
              onClick={() => navigate("/admin-forgot-password")}
            >
              Forgot admin password?
            </button>

            {message && (
              <div className="admin-login-error">
                <span>⚠</span>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in to Dashboard"}
            </button>
          </form>

          <div className="admin-security-note">
            <span>🛡️</span>
            Secure administrator access
          </div>

          <button
            type="button"
            className="back-to-customer"
            onClick={() => navigate("/login")}
          >
            ← Back to Customer Login
          </button>
        </div>
      </div>

    </div>
  );
}

export default AdminLogin;
