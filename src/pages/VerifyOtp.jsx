import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import "../styles/auth.css";

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const mobile = location.state?.mobile || "";

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const getErrorMessage = async (response) => {
    const text = await response.text();

    try {
      const data = JSON.parse(text);

      if (data?.message) {
        switch (data.message.toLowerCase()) {
          case "otp expired":
            return "Your OTP has expired. Please request a new OTP.";
          case "invalid otp":
            return "The OTP you entered is incorrect. Please check it and try again.";
          case "otp already used":
            return "This OTP has already been used. Please request a new OTP.";
          default:
            return data.message;
        }
      }
    } catch {
      // Response was not JSON
    }

    return text || "OTP verification failed. Please try again.";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!mobile) {
      setMessage(
        "Your mobile number is missing. Please go back and register again."
      );
      setMessageType("error");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setMessage("Please enter a valid 6-digit OTP.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobile: mobile,
            otp: otp,
          }),
        }
      );

      if (!response.ok) {
        const friendlyMessage = await getErrorMessage(response);
        throw new Error(friendlyMessage);
      }

      const text = await response.text();
      let successMessage = "Your mobile number has been verified successfully.";

      try {
        const data = JSON.parse(text);
        if (data?.message) {
          successMessage = data.message;
        }
      } catch {
        if (text.trim()) {
          successMessage = text;
        }
      }

      setMessage(successMessage);
      setMessageType("success");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setMessage(
        error.message || "Something went wrong. Please try again."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  return (
    <div className="auth-page">
      <div className="auth-card otp-card">
        <div className="auth-icon">🔐</div>

        <h1>Verify your mobile number</h1>

        <p className="auth-subtitle">
          Enter the 6-digit verification code sent to
        </p>

        <p className="otp-mobile">
          +91 {mobile}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="otp">Verification code</label>

          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={handleOtpChange}
            disabled={loading}
            required
          />

          <button
            type="submit"
            className="auth-button"
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {message && (
          <div
            className={`auth-message ${messageType === "success"
                ? "auth-message-success"
                : "auth-message-error"
              }`}
          >
            <span className="message-icon">
              {messageType === "success" ? "✓" : "!"}
            </span>

            <span>{message}</span>
          </div>
        )}

        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/register")}
          disabled={loading}
        >
          Back to Registration
        </button>

        <p className="auth-footer">
          Never share your OTP with anyone.
        </p>
      </div>
    </div>
  );
}

export default VerifyOtp;
