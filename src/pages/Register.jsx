import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import "../styles/auth.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    password: "",
    address: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    if (formData.password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.text();

      if (!response.ok) {
        throw new Error(data || "Registration failed");
      }

      navigate("/verify-otp", {
        state: {
          mobile: formData.mobile,
        },
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <div className="register-page">

      {/* Left side */}
      <section className="register-brand">

        <div className="customer-brand-logo">
          🛒
        </div>

        <span className="customer-brand-label">
          PRODUCT DELIVERY
        </span>

        <h1>
          Fresh shopping,
          <br />
          made simple.
        </h1>

        <p>
          Create your account and start ordering
          fresh products delivered to your doorstep.
        </p>

        <div className="register-benefits">

          <div className="register-benefit">
            <span className="benefit-icon green">
              ✓
            </span>
            Quick and easy registration
          </div>

          <div className="register-benefit">
            <span className="benefit-icon blue">
              ✓
            </span>
            OTP verified account
          </div>

          <div className="register-benefit">
            <span className="benefit-icon orange">
              ✓
            </span>
            Track your orders
          </div>

        </div>

      </section>

      {/* Form */}
      <section className="register-container">

        <div className="register-card">

          <div className="register-icon">
            ✨
          </div>

          <h2>Create your account</h2>

          <p className="register-subtitle">
            Join Product Delivery and start shopping.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="full-name">
                Full Name
              </label>

              <input
                id="full-name"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-mobile">
                Mobile Number
              </label>

              <input
                id="register-mobile"
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter your mobile number"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password">
                Password
              </label>

              <input
                id="register-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">
                Re-enter Password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Re-enter your password"
                required
              />
            </div>

            {confirmPassword && (
              <div
                className={`password-match ${formData.password === confirmPassword
                    ? "valid"
                    : "invalid"
                  }`}
              >
                {formData.password === confirmPassword
                  ? "✓ Passwords match"
                  : "✕ Passwords do not match"}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="register-address">
                Delivery Address
              </label>

              <textarea
                id="register-address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your delivery address"
                required
              />
            </div>

            {message && (
              <div className="customer-login-error">
                <span>⚠</span>
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              className="register-submit-button"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          <p className="register-login-text">
            Already have an account?
          </p>

          <button
            type="button"
            className="register-login-button"
            onClick={() => navigate("/login")}
          >
            ← Back to Login
          </button>

        </div>

      </section>

    </div>
  );
}

export default Register;
