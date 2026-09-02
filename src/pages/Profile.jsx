import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import CustomerNavbar from "../components/CustomerNavbar";
import "../styles/customer.css";

function Profile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        fullName: "",
        mobile: "",
        address: "",
        mobileVerified: false,
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
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
                    data.message || "Failed to load profile"
                );
            }

            setProfile({
                fullName: data.fullName || "",
                mobile: data.mobile || "",
                address: data.address || "",
                mobileVerified: data.mobileVerified ?? false,
            });
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setProfile((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSave = async (event) => {
        event.preventDefault();

        const token = sessionStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        setSaving(true);
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/api/users/me`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fullName: profile.fullName.trim(),
                        address: profile.address.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update profile"
                );
            }

            setProfile((current) => ({
                ...current,
                fullName: data.fullName || current.fullName,
                address: data.address || current.address,
                mobile: data.mobile || current.mobile,
                mobileVerified:
                    data.mobileVerified ?? current.mobileVerified,
            }));

            setMessage("Profile updated successfully.");
        } catch (error) {
            setMessage(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <CustomerNavbar />

                <main className="profile-page">
                    <div className="profile-loading">
                        <div className="loading-spinner"></div>
                        <h2>Loading your profile...</h2>
                        <p>Please wait a moment.</p>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <CustomerNavbar />

            <main className="profile-page">

                {/* HEADER */}

                <section className="profile-page-header">

                    <div>
                        <span className="page-eyebrow">
                            MY ACCOUNT
                        </span>

                        <h1>Profile</h1>

                        <p>
                            Manage your personal information and
                            delivery details.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="profile-back-button"
                        onClick={() => navigate("/products")}
                    >
                        ← Continue Shopping
                    </button>

                </section>

                {message && (
                    <div
                        className={
                            message.toLowerCase().includes("success")
                                ? "profile-success"
                                : "profile-error"
                        }
                    >
                        <span>
                            {message.toLowerCase().includes("success")
                                ? "✓"
                                : "!"}
                        </span>

                        <p>{message}</p>
                    </div>
                )}

                <div className="profile-layout">

                    {/* PERSONAL INFORMATION */}

                    <section className="profile-card">

                        <div className="profile-card-heading">

                            <div className="profile-card-icon blue">
                                👤
                            </div>

                            <div>
                                <h2>Personal Information</h2>

                                <p>
                                    Your account details
                                </p>
                            </div>

                        </div>

                        <form
                            className="profile-form"
                            onSubmit={handleSave}
                        >

                            <div className="profile-form-group">

                                <label htmlFor="profile-name">
                                    Full Name
                                </label>

                                <input
                                    id="profile-name"
                                    type="text"
                                    name="fullName"
                                    value={profile.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                />

                            </div>

                            <div className="profile-form-group">

                                <label htmlFor="profile-mobile">
                                    Mobile Number
                                </label>

                                <div className="profile-mobile-field">

                                    <input
                                        id="profile-mobile"
                                        type="tel"
                                        value={profile.mobile}
                                        readOnly
                                    />

                                    {profile.mobileVerified && (
                                        <span className="verified-badge">
                                            ✓ Verified
                                        </span>
                                    )}

                                </div>

                                <span className="profile-hint">
                                    Your verified mobile number cannot be
                                    changed here.
                                </span>

                            </div>

                            <div className="profile-form-group">

                                <label htmlFor="profile-address">
                                    Delivery Address
                                </label>

                                <textarea
                                    id="profile-address"
                                    name="address"
                                    value={profile.address}
                                    onChange={handleChange}
                                    placeholder="Enter your delivery address"
                                    rows="5"
                                    required
                                />

                                <span className="profile-hint">
                                    This address can be used when placing
                                    your orders.
                                </span>

                            </div>

                            <button
                                type="submit"
                                className="profile-save-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving Changes..."
                                    : "Save Changes"}
                            </button>

                        </form>

                    </section>

                    {/* SECURITY */}

                    <aside className="profile-security-card">

                        <div className="profile-card-heading">

                            <div className="profile-card-icon orange">
                                🔐
                            </div>

                            <div>
                                <h2>Account Security</h2>

                                <p>
                                    Keep your account protected.
                                </p>
                            </div>

                        </div>

                        <div className="security-item">

                            <div className="security-item-icon">
                                🔑
                            </div>

                            <div>
                                <strong>Password</strong>

                                <span>
                                    Change your account password when
                                    needed.
                                </span>
                            </div>

                        </div>

                        <button
                            type="button"
                            className="change-password-button"
                            onClick={() =>
                                navigate("/forgot-password")
                            }
                        >
                            Change Password →
                        </button>

                        <div className="security-item">

                            <div className="security-item-icon green">
                                📱
                            </div>

                            <div>
                                <strong>Mobile Verification</strong>

                                <span>
                                    {profile.mobileVerified
                                        ? "Your mobile number is verified."
                                        : "Your mobile number is not verified."}
                                </span>
                            </div>

                        </div>

                    </aside>

                </div>

            </main>
        </>
    );
}

export default Profile;
