import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import "../styles/auth.css";

function AdminForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const sendOtp = async (event) => {
        event.preventDefault();

        setMessage("");

        if (!mobile.trim()) {
            setMessage("Please enter your admin mobile number.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/admin/forgot-password?mobile=${encodeURIComponent(
                    mobile.trim()
                )}`,
                {
                    method: "POST",
                }
            );

            const contentType = response.headers.get("content-type") || "";

            const data = contentType.includes("application/json")
                ? await response.json()
                : await response.text();

            if (!response.ok) {
                throw new Error(
                    typeof data === "string"
                        ? data
                        : data.message || "Failed to send OTP"
                );
            }

            setMessage(
                typeof data === "string"
                    ? data
                    : data.message || "OTP sent successfully"
            );

            setStep(2);
        } catch (error) {
            setMessage(error.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (event) => {
        event.preventDefault();

        if (otp.length !== 6) {
            setMessage("Please enter a 6-digit OTP.");
            return;
        }

        setMessage("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/admin/forgot-password/verify-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        mobile: mobile.trim(),
                        otp,
                    }),
                }
            );

            const data = await response.text();

            if (!response.ok) {
                throw new Error(data || "OTP verification failed");
            }

            setMessage("");
            setStep(3);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (event) => {
        event.preventDefault();

        if (newPassword.length < 8) {
            setMessage("Password must be at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        setMessage("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/admin/reset-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        mobile: mobile.trim(),
                        newPassword,
                    }),
                }
            );

            const data = await response.text();

            if (!response.ok) {
                throw new Error(data || "Failed to reset password");
            }

            navigate("/admin-login", {
                replace: true,
                state: {
                    message: "Admin password reset successfully. Please log in.",
                },
            });
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="customer-login-card">
                <div className="customer-login-icon">🔐</div>

                <span className="admin-login-label">ADMIN SECURITY</span>

                {step === 1 && (
                    <>
                        <h2>Reset admin password</h2>

                        <p className="customer-login-subtitle">
                            Enter your registered administrator mobile number.
                        </p>

                        <form onSubmit={sendOtp}>
                            <div className="form-group">
                                <label>Admin Mobile Number</label>

                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(event) => setMobile(event.target.value)}
                                    placeholder="Enter admin mobile"
                                    autoComplete="tel"
                                    required
                                />
                            </div>

                            {message && (
                                <div className="customer-login-error">{message}</div>
                            )}

                            <button
                                type="submit"
                                className="customer-login-button"
                                disabled={loading}
                            >
                                {loading ? "Sending OTP..." : "Send OTP"}
                            </button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2>Verify admin OTP</h2>

                        <p className="customer-login-subtitle">
                            Enter the 6-digit OTP sent to {mobile}.
                        </p>

                        <form onSubmit={verifyOtp}>
                            <div className="form-group">
                                <label>OTP</label>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(event) =>
                                        setOtp(event.target.value.replace(/\D/g, ""))
                                    }
                                    placeholder="Enter 6-digit OTP"
                                    required
                                />
                            </div>

                            {message && (
                                <div className="customer-login-error">{message}</div>
                            )}

                            <button
                                type="submit"
                                className="customer-login-button"
                                disabled={loading}
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </button>
                        </form>
                    </>
                )}

                {step === 3 && (
                    <>
                        <h2>Create new admin password</h2>

                        <p className="customer-login-subtitle">
                            Choose a new secure administrator password.
                        </p>

                        <form onSubmit={resetPassword}>
                            <div className="form-group">
                                <label>New Password</label>

                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Re-enter Password</label>

                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    placeholder="Re-enter new password"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            {confirmPassword && (
                                <div
                                    className={`password-match ${newPassword === confirmPassword ? "valid" : "invalid"
                                        }`}
                                >
                                    {newPassword === confirmPassword
                                        ? "✓ Passwords match"
                                        : "✕ Passwords do not match"}
                                </div>
                            )}

                            {message && (
                                <div className="customer-login-error">{message}</div>
                            )}

                            <button
                                type="submit"
                                className="customer-login-button"
                                disabled={loading}
                            >
                                {loading ? "Resetting..." : "Reset Admin Password"}
                            </button>
                        </form>
                    </>
                )}

                <button
                    type="button"
                    className="customer-admin-link"
                    onClick={() => navigate("/admin-login")}
                >
                    ← Back to Admin Login
                </button>
            </div>
        </div>
    );
}

export default AdminForgotPassword;
