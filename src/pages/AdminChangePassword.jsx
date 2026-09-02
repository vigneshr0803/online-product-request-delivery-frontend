import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import AdminNavbar from "../components/AdminNavbar";
import "../styles/admin.css";
import "../styles/admin-security.css";

function AdminChangePassword() {
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [mobileStep, setMobileStep] = useState(1);
    const [newMobile, setNewMobile] = useState("");
    const [mobileOtp, setMobileOtp] = useState("");
    const [mobileMessage, setMobileMessage] = useState("");
    const [mobileLoading, setMobileLoading] = useState(false);
    const [mobileCurrentPassword, setMobileCurrentPassword] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");

        if (newPassword.length < 8) {
            setMessage(
                "New password must be at least 8 characters."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage(
                "New password and confirm password do not match."
            );
            return;
        }

        const token = sessionStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin-login");
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/admin/change-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword,
                        confirmPassword,
                    }),
                }
            );

            const data = await response.text();

            if (!response.ok) {
                throw new Error(
                    data || "Failed to change password"
                );
            }

            sessionStorage.removeItem("adminToken");

            setMessage(
                "Password changed successfully. Redirecting to Admin Login..."
            );

            setTimeout(() => {
                navigate("/admin-login", {
                    replace: true,
                });
            }, 1200);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setSaving(false);
        }
    };

    const sendMobileOtp = async (event) => {
        event.preventDefault();

        const token = sessionStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin-login");
            return;
        }

        setMobileMessage("");

        if (!newMobile.trim().match(/^\d{10,15}$/)) {
            setMobileMessage(
                "Please enter a valid mobile number."
            );
            return;
        }

        if (!mobileCurrentPassword.trim()) {
            setMobileMessage("Please enter your current password.");
            return;
        }

        setMobileLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/admin/change-mobile/send-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        currentPassword: mobileCurrentPassword,
                        newMobile: newMobile.trim(),
                    }),
                }
            );

            const data = await response.text();

            if (!response.ok) {
                throw new Error(
                    data || "Failed to send OTP"
                );
            }

            setMobileMessage("OTP sent successfully.");
            setMobileStep(2);
        } catch (error) {
            setMobileMessage(error.message);
        } finally {
            setMobileLoading(false);
        }
    };

    const verifyMobileOtp = async (event) => {
        event.preventDefault();

        const token = sessionStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin-login");
            return;
        }

        if (!mobileOtp || mobileOtp.length !== 6) {
            setMobileMessage("Please enter a 6-digit OTP.");
            return;
        }

        setMobileLoading(true);
        setMobileMessage("");

        try {
            const response = await fetch(
                `${API_URL}/api/auth/admin/change-mobile/verify-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        newMobile: newMobile.trim(),
                        otp: mobileOtp,
                    }),
                }
            );

            const data = await response.text();

            if (!response.ok) {
                throw new Error(
                    data || "Failed to verify OTP"
                );
            }

            sessionStorage.removeItem("adminToken");

            setMobileMessage(
                "Mobile number changed successfully. Redirecting to Admin Login..."
            );

            setTimeout(() => {
                navigate("/admin-login", {
                    replace: true,
                });
            }, 1200);
        } catch (error) {
            setMobileMessage(error.message);
        } finally {
            setMobileLoading(false);
        }
    };

    return (
        <div className="admin-security-page">

            <AdminNavbar />

            <main className="admin-security-content">

                <section className="admin-security-header">

                    <div>
                        <span className="admin-page-eyebrow">
                            ACCOUNT SECURITY
                        </span>

                        <h1>Change Password</h1>

                        <p>
                            Update your administrator account password
                            securely.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-security-back-button"
                        onClick={() => navigate("/admin")}
                    >
                        ← Dashboard
                    </button>

                </section>

                <section className="admin-security-card">

                    <div className="admin-security-card-heading">

                        <div className="admin-security-icon">
                            🔐
                        </div>

                        <div>
                            <h2>Administrator Password</h2>

                            <p>
                                Enter your current password and choose
                                a new secure password.
                            </p>
                        </div>

                    </div>

                    {message && (
                        <div
                            className={
                                message
                                    .toLowerCase()
                                    .includes("success")
                                    ? "admin-security-success"
                                    : "admin-security-error"
                            }
                        >
                            <span>
                                {message
                                    .toLowerCase()
                                    .includes("success")
                                    ? "✓"
                                    : "!"}
                            </span>

                            <p>{message}</p>
                        </div>
                    )}

                    <form
                        className="admin-security-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="admin-security-field">

                            <label htmlFor="current-password">
                                Current Password
                            </label>

                            <div className="password-input-wrapper">

                                <input
                                    id="current-password"
                                    type={
                                        showCurrent
                                            ? "text"
                                            : "password"
                                    }
                                    value={currentPassword}
                                    onChange={(event) =>
                                        setCurrentPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter current password"
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCurrent(
                                            (current) => !current
                                        )
                                    }
                                    className="password-visibility-button"
                                    aria-label={
                                        showCurrent
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showCurrent ? "🙈" : "👁️"}
                                </button>

                            </div>

                        </div>

                        <div className="admin-security-field">

                            <label htmlFor="new-password">
                                New Password
                            </label>

                            <div className="password-input-wrapper">

                                <input
                                    id="new-password"
                                    type={
                                        showNew
                                            ? "text"
                                            : "password"
                                    }
                                    value={newPassword}
                                    onChange={(event) =>
                                        setNewPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowNew(
                                            (current) => !current
                                        )
                                    }
                                    className="password-visibility-button"
                                    aria-label={
                                        showNew
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showNew ? "🙈" : "👁️"}
                                </button>

                            </div>

                            <span className="admin-security-hint">
                                Minimum 8 characters.
                            </span>

                        </div>

                        <div className="admin-security-field">

                            <label htmlFor="confirm-password">
                                Confirm New Password
                            </label>

                            <div className="password-input-wrapper">

                                <input
                                    id="confirm-password"
                                    type={
                                        showConfirm
                                            ? "text"
                                            : "password"
                                    }
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Re-enter new password"
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirm(
                                            (current) => !current
                                        )
                                    }
                                    className="password-visibility-button"
                                    aria-label={
                                        showConfirm
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showConfirm ? "🙈" : "👁️"}
                                </button>

                            </div>

                        </div>

                        <div className="admin-password-requirements">

                            <strong>
                                Password requirements
                            </strong>

                            <div className={
                                newPassword.length >= 8
                                    ? "requirement valid"
                                    : "requirement"
                            }>
                                <span>
                                    {newPassword.length >= 8
                                        ? "✓"
                                        : "•"}
                                </span>
                                At least 8 characters
                            </div>

                            <div className={
                                newPassword &&
                                    currentPassword !== newPassword
                                    ? "requirement valid"
                                    : "requirement"
                            }>
                                <span>
                                    {newPassword &&
                                        currentPassword !== newPassword
                                        ? "✓"
                                        : "•"}
                                </span>
                                Different from current password
                            </div>

                            <div className={
                                newPassword &&
                                    newPassword === confirmPassword
                                    ? "requirement valid"
                                    : "requirement"
                            }>
                                <span>
                                    {newPassword &&
                                        newPassword === confirmPassword
                                        ? "✓"
                                        : "•"}
                                </span>
                                Passwords match
                            </div>

                        </div>

                        <div className="admin-security-actions">

                            <button
                                type="button"
                                className="admin-security-cancel"
                                onClick={() => navigate("/admin")}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="admin-security-submit"
                                disabled={saving}
                            >
                                {saving
                                    ? "Changing Password..."
                                    : "Change Password"}
                            </button>

                        </div>

                    </form>

                </section>

                <section className="admin-security-card">

                    <div className="admin-security-card-heading">

                        <div className="admin-security-icon mobile">
                            📱
                        </div>

                        <div>
                            <h2>Change Mobile Number</h2>

                            <p>
                                Update the mobile number used for administrator login.
                            </p>
                        </div>

                    </div>

                    {mobileMessage && (
                        <div
                            className={
                                mobileMessage
                                    .toLowerCase()
                                    .includes("successfully")
                                    ? "admin-security-success"
                                    : "admin-security-error"
                            }
                        >
                            <span>
                                {mobileMessage
                                    .toLowerCase()
                                    .includes("successfully")
                                    ? "✓"
                                    : "!"}
                            </span>

                            <p>{mobileMessage}</p>
                        </div>
                    )}

                    {mobileStep === 1 && (
                        <form
                            className="admin-security-form"
                            onSubmit={sendMobileOtp}
                        >

                            <div className="admin-security-field">

                                <label htmlFor="new-admin-mobile">
                                    New Mobile Number
                                </label>

                                <input
                                    id="new-admin-mobile"
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={15}
                                    value={newMobile}
                                    onChange={(event) =>
                                        setNewMobile(
                                            event.target.value.replace(/\D/g, "")
                                        )
                                    }
                                    placeholder="Enter new mobile number"
                                    required
                                />

                                <span className="admin-security-hint">
                                    An OTP will be sent to this new number.
                                </span>

                            </div>

                            <div className="admin-security-field">

                                <label htmlFor="mobile-current-password">
                                    Current Password
                                </label>

                                <input
                                    id="mobile-current-password"
                                    type="password"
                                    value={mobileCurrentPassword}
                                    onChange={(event) =>
                                        setMobileCurrentPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter current admin password"
                                    required
                                />

                            </div>

                            <div className="admin-security-actions">

                                <button
                                    type="submit"
                                    className="admin-security-submit"
                                    disabled={mobileLoading}
                                >
                                    {mobileLoading
                                        ? "Sending OTP..."
                                        : "Send OTP"}
                                </button>

                            </div>

                        </form>
                    )}

                    {mobileStep === 2 && (
                        <form
                            className="admin-security-form"
                            onSubmit={verifyMobileOtp}
                        >

                            <div className="admin-security-field">

                                <label htmlFor="admin-mobile-otp">
                                    Verification OTP
                                </label>

                                <input
                                    id="admin-mobile-otp"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={mobileOtp}
                                    onChange={(event) =>
                                        setMobileOtp(
                                            event.target.value.replace(/\D/g, "")
                                        )
                                    }
                                    placeholder="Enter 6-digit OTP"
                                    required
                                />

                                <span className="admin-security-hint">
                                    OTP sent to {newMobile}
                                </span>

                            </div>

                            <div className="admin-security-actions">

                                <button
                                    type="button"
                                    className="admin-security-cancel"
                                    onClick={() => {
                                        setMobileStep(1);
                                        setMobileOtp("");
                                        setMobileMessage("");
                                    }}
                                    disabled={mobileLoading}
                                >
                                    Change Number
                                </button>

                                <button
                                    type="submit"
                                    className="admin-security-submit"
                                    disabled={mobileLoading}
                                >
                                    {mobileLoading
                                        ? "Verifying..."
                                        : "Verify & Change Number"}
                                </button>

                            </div>

                        </form>
                    )}

                </section>

                <div className="admin-security-note">

                    <span>🛡️</span>

                    <div>
                        <strong>
                            Security reminder
                        </strong>

                        <p>
                            After changing your password, your current
                            admin session will end and you will need to
                            sign in again with your new password.
                        </p>
                    </div>

                </div>

            </main>

        </div>
    );
}

export default AdminChangePassword;
