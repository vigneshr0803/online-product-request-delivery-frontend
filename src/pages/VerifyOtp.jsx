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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!mobile) {
      setMessage("Mobile number is missing. Please register again.");
      return;
    }

    if (otp.length !== 6) {
      setMessage("Please enter a 6-digit OTP.");
      return;
    }

    setLoading(true);
    setMessage("");

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

      const data = await response.text();

      if (!response.ok) {
        throw new Error(data || "OTP verification failed");
      }

      setMessage(data);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Verify OTP</h1>

      <p>OTP sent to: {mobile}</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default VerifyOtp;
