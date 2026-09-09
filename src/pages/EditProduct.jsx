import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_URL from "../config/api";
import { getImageUrl } from "../services/imageService";
import "../styles/admin.css";
import AdminNavbar from "../components/AdminNavbar";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    unit: "",
    availableQuantity: "",
    categoryId: "",
    active: true,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    loadProduct();
    loadCategories();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/products/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load product");
      }

      setFormData({
        name: data.name || "",
        description: data.description || "",
        price: data.price ?? "",
        unit: data.unit || "",
        availableQuantity: data.availableQuantity ?? "",
        categoryId: data.categoryId ?? "",
        active: data.active ?? true,
      });

      setImagePreview(
        data.imageUrl ? getImageUrl(data.imageUrl) : ""
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin-login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load categories");
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
    const { name, value, type, checked } = event.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin-login");
      return;
    }

    setSaving(true);
    setMessage("");

    const multipart = new FormData();
    multipart.append("name", formData.name);
    multipart.append("description", formData.description);
    multipart.append("price", formData.price);
    multipart.append("unit", formData.unit);
    multipart.append("availableQuantity", formData.availableQuantity);
    multipart.append("categoryId", formData.categoryId);
    multipart.append("active", formData.active);

    if (imageFile) {
      multipart.append("image", imageFile);
    }

    try {
      const response = await fetch(
        `${API_URL}/api/products/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: multipart,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update product");
      }

      setMessage("Product updated successfully.");

      setTimeout(() => {
        navigate("/admin/products");
      }, 700);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <h2>Loading product...</h2>;
  }

  return (
    <div className="admin-edit-product-page">
      <AdminNavbar />

      <main className="admin-edit-product-content">
        <div className="admin-form-page-header">
          <div>
            <span className="admin-page-eyebrow">
              INVENTORY MANAGEMENT
            </span>

            <h1>Edit Product</h1>

            <p>
              Update product information, stock, pricing and image.
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
              <div className="admin-form-section-icon blue">✏️</div>

              <div>
                <h2>Product Information</h2>

                <p>Update the details of this product.</p>
              </div>
            </div>

            <div className="admin-form-grid">
              <div className="admin-form-group full-width">
                <label htmlFor="edit-product-name">Product Name</label>

                <input
                  id="edit-product-name"
                  type="text"
                  name="name"
                  placeholder="Product name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group full-width">
                <label htmlFor="edit-product-description">Description</label>

                <textarea
                  id="edit-product-description"
                  name="description"
                  placeholder="Product description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  required
                />

                <span className="admin-form-hint">
                  Keep the product description clear and useful for customers.
                </span>
              </div>

              <div className="admin-form-group">
                <label htmlFor="edit-product-price">Price</label>

                <div className="input-with-symbol">
                  <span>₹</span>

                  <input
                    id="edit-product-price"
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="edit-product-unit">Unit</label>

                <input
                  id="edit-product-unit"
                  type="text"
                  name="unit"
                  placeholder="KG, Piece, Litre..."
                  value={formData.unit}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="edit-product-stock">Available Quantity</label>

                <input
                  id="edit-product-stock"
                  type="number"
                  min="0"
                  name="availableQuantity"
                  placeholder="0"
                  value={formData.availableQuantity}
                  onChange={handleChange}
                  required
                />

                <span className="admin-form-hint">
                  Current stock available to customers.
                </span>
              </div>

              <div className="admin-form-group">
                <label htmlFor="edit-product-category">Category</label>

                <select
                  id="edit-product-category"
                  name="categoryId"
                  value={formData.categoryId}
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
          </section>

          <section className="admin-form-card">
            <div className="admin-form-card-header">
              <div className="admin-form-section-icon orange">🖼️</div>

              <div>
                <h2>Product Image</h2>

                <p>Keep the current image or upload a new one.</p>
              </div>
            </div>

            <div className="admin-edit-image-area">
              <label
                className={`admin-image-upload-box ${imageError ? "has-error" : ""}`}
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt={formData.name || "Product"}
                      className="admin-image-preview"
                    />

                    <div className="image-change-overlay">
                      <span>✏️</span>
                      <strong>
                        {imageFile ? "Change New Image" : "Change Image"}
                      </strong>
                    </div>
                  </>
                ) : (
                  <div className="admin-upload-placeholder">
                    <div className="admin-upload-icon">🖼️</div>

                    <strong>Click to upload image</strong>

                    <span>JPG, PNG or WebP</span>

                    <span>Maximum 2 MB</span>

                    <span>Displayed in a 9:16 frame for customers</span>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  hidden
                />
              </label>

              <div className="admin-edit-image-info">
                {!imageFile && imagePreview && (
                  <div className="existing-image-info">
                    <span className="info-icon">✓</span>

                    <div>
                      <strong>Current image</strong>

                      <small>
                        No new image selected. The current image will be kept.
                      </small>
                    </div>
                  </div>
                )}

                {imageFile && !imageError && (
                  <div className="admin-image-ready">
                    <span>✓</span>

                    <div>
                      <strong>New image selected</strong>

                      <small>{imageFile.name}</small>
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
            </div>
          </section>

          <section className="admin-form-card">
            <div className="admin-form-card-header">
              <div className="admin-form-section-icon green">✓</div>

              <div>
                <h2>Product Availability</h2>

                <p>
                  Control whether customers can see and order this product.
                </p>
              </div>
            </div>

            <label
              className={`admin-active-toggle ${formData.active ? "is-active" : "is-inactive"
                }`}
            >
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />

              <span className="toggle-track">
                <span className="toggle-thumb"></span>
              </span>

              <span className="toggle-content">
                <strong>
                  {formData.active ? "Product is Active" : "Product is Inactive"}
                </strong>

                <small>
                  {formData.active
                    ? "Customers can see and order this product."
                    : "Customers cannot order this product."}
                </small>
              </span>
            </label>
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
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="button-spinner"></span>
                  Updating Product...
                </>
              ) : (
                <>✓ Update Product</>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default EditProduct;
