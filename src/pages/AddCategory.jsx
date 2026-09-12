import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import "../styles/admin.css";
import AdminNavbar from "../components/AdminNavbar";

function AddCategory() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin-login");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create category"
        );
      }

      setMessage("Category created successfully.");

      setTimeout(() => {
        navigate("/admin/products/add");
      }, 700);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-add-category-page">
      <AdminNavbar />

      <main className="admin-add-category-content">
        <div className="admin-form-page-header">
          <div>
            <span className="admin-page-eyebrow">
              INVENTORY MANAGEMENT
            </span>

            <h1>Add Category</h1>

            <p>
              Create a category to organize your products.
            </p>
          </div>

          <button
            type="button"
            className="admin-back-button"
            onClick={() => navigate("/admin/products/add")}
          >
            ← Back to Add Product
          </button>
        </div>

        {message && (
          <div
            className={
              message.toLowerCase().includes("success")
                ? "admin-form-success"
                : "admin-form-error"
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

        <form
          className="admin-category-form"
          onSubmit={handleSubmit}
        >
          <section className="admin-form-card">
            <div className="admin-form-card-header">
              <div className="admin-form-section-icon blue">
                🗂️
              </div>

              <div>
                <h2>Category Information</h2>

                <p>
                  Enter the basic details for your new category.
                </p>
              </div>
            </div>

            <div className="admin-category-fields">
              <div className="admin-form-group">
                <label htmlFor="category-name">
                  Category Name
                </label>

                <input
                  id="category-name"
                  type="text"
                  name="name"
                  placeholder="e.g. Papad, Snacks, Beverages"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <span className="admin-form-hint">
                  Choose a short and clear name customers will
                  understand.
                </span>
              </div>

              <div className="admin-form-group">
                <label htmlFor="category-description">
                  Description
                </label>

                <textarea
                  id="category-description"
                  name="description"
                  placeholder="Describe what products belong to this category..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                />

                <span className="admin-form-hint">
                  A short description helps you manage your
                  categories more easily.
                </span>
              </div>
            </div>
          </section>

          <div className="admin-category-form-actions">
            <button
              type="button"
              className="admin-cancel-button"
              onClick={() => navigate("/admin/products/add")}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-create-product-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Creating Category...
                </>
              ) : (
                <>
                  ＋ Create Category
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AddCategory;
