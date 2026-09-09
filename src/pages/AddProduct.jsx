import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import "../styles/admin.css";
import AdminNavbar from "../components/AdminNavbar";

function AddProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formDataState, setFormDataState] = useState({
    name: "",
    description: "",
    price: "",
    unit: "",
    availableQuantity: "",
    categoryId: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      setMessage("Admin login required.");
      navigate("/admin-login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/categories`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load categories"
        );
      }

      setCategories(data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageError("");
    setImagePreview("");
    setImageFile(null);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setImageError("Only JPG, PNG and WebP images are allowed.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image must be less than or equal to 2 MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(objectUrl);
  };

  const handleChange = (event) => {
    setFormDataState({
      ...formDataState,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      setMessage("Admin login required.");
      navigate("/admin-login");
      return;
    }

    setLoading(true);
    setMessage("");

    if (!imageFile) {
      setMessage("Please select a product image.");
      setLoading(false);
      return;
    }

    const multipart = new FormData();
    multipart.append("name", formDataState.name);
    multipart.append("description", formDataState.description);
    multipart.append("price", formDataState.price);
    multipart.append("unit", formDataState.unit);
    multipart.append("availableQuantity", formDataState.availableQuantity);
    multipart.append("categoryId", formDataState.categoryId);
    multipart.append("image", imageFile);

    try {
      const response = await fetch(
        `${API_URL}/api/products`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: multipart,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create product"
        );
      }

      setMessage("Product created successfully.");

      setTimeout(() => {
        navigate("/admin/products");
      }, 700);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-add-product-page">
      <AdminNavbar />

      <main className="admin-add-product-content">
        <div className="admin-form-page-header">
          <div>
            <span className="admin-page-eyebrow">INVENTORY MANAGEMENT</span>

            <h1>Add New Product</h1>

            <p>
              Add a product to your store with pricing, stock and product information.
            </p>
          </div>

          <button
            type="button"
            className="admin-back-button"
            onClick={() => navigate("/admin/products")}
          >
            ← Back to Products
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
              {message.toLowerCase().includes("success") ? "✓" : "!"}
            </span>

            <p>{message}</p>
          </div>
        )}

        <form className="admin-product-form" onSubmit={handleSubmit}>
          <section className="admin-form-card">
            <div className="admin-form-card-header">
              <div className="admin-form-section-icon blue">🛍️</div>

              <div>
                <h2>Product Information</h2>
                <p>Enter the basic details of your product.</p>
              </div>
            </div>

            <div className="admin-form-grid">
              <div className="admin-form-group full-width">
                <label htmlFor="product-name">Product Name</label>

                <input
                  id="product-name"
                  type="text"
                  name="name"
                  placeholder="e.g. Wireless Mouse"
                  value={formDataState.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group full-width">
                <label htmlFor="product-description">Description</label>

                <textarea
                  id="product-description"
                  name="description"
                  placeholder="Describe the product..."
                  value={formDataState.description}
                  onChange={handleChange}
                  rows="5"
                  required
                />

                <span className="admin-form-hint">
                  Give customers a clear description of the product.
                </span>
              </div>

              <div className="admin-form-group">
                <label htmlFor="product-price">Price</label>

                <div className="input-with-symbol">
                  <span>₹</span>

                  <input
                    id="product-price"
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    placeholder="0.00"
                    value={formDataState.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="product-unit">Unit</label>

                <input
                  id="product-unit"
                  type="text"
                  name="unit"
                  placeholder="KG, Piece, Litre..."
                  value={formDataState.unit}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="product-stock">Available Quantity</label>

                <input
                  id="product-stock"
                  type="number"
                  min="0"
                  name="availableQuantity"
                  placeholder="0"
                  value={formDataState.availableQuantity}
                  onChange={handleChange}
                  required
                />

                <span className="admin-form-hint">
                  Current stock available for customers.
                </span>
              </div>

              <div className="admin-form-group">
                <label htmlFor="product-category">Category</label>

                <select
                  id="product-category"
                  name="categoryId"
                  value={formDataState.categoryId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              className="add-category-link"
              onClick={() => navigate("/admin/categories/add")}
            >
              ＋ Add New Category
            </button>
          </section>

          <section className="admin-form-card">
            <div className="admin-form-card-header">
              <div className="admin-form-section-icon orange">🖼️</div>

              <div>
                <h2>Product Image</h2>
                <p>Add a clear image customers can see.</p>
              </div>
            </div>

            <div className="admin-image-upload-area">
              <label
                className={`admin-image-upload-box ${imageError ? "has-error" : ""}`}
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="admin-image-preview"
                    />

                    <div className="image-change-overlay">
                      <span>✏️</span>
                      <strong>Change Image</strong>
                    </div>
                  </>
                ) : (
                  <div className="admin-upload-placeholder">
                    <div className="admin-upload-icon">🖼️</div>

                    <strong>Click to upload product image</strong>

                    <span>JPG, PNG or WebP</span>
                    <span>Maximum 2 MB</span>
                    <span>Portrait 9:16 or narrower</span>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  hidden
                />
              </label>

              {imagePreview && !imageError && (
                <div className="admin-image-ready">
                  <span>✓</span>
                  <div>
                    <strong>Image ready</strong>
                    <small>{imageFile?.name}</small>
                  </div>
                </div>
              )}

              {imageError && (
                <div className="admin-image-error">
                  <span>!</span>
                  {imageError}
                </div>
              )}
            </div>
          </section>

          <div className="admin-product-form-actions">
            <button
              type="button"
              className="admin-cancel-button"
              onClick={() => navigate("/admin/products")}
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
                  Creating Product...
                </>
              ) : (
                <>
                  ＋ Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AddProduct;
