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

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
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

      const existingImageUrls =
        Array.isArray(data.imageUrls) && data.imageUrls.length > 0
          ? data.imageUrls
          : data.imageUrl
            ? [data.imageUrl]
            : [];

      setImagePreviews(
        existingImageUrls.map((url) => getImageUrl(url))
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
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    setImageError("");

    if (selectedFiles.length > 3) {
      setImageError("You can select a maximum of 3 images.");
      event.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const validFiles = [];

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setImageError(
          "Only JPG, PNG and WebP images are allowed."
        );
        event.target.value = "";
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setImageError(
          `Image "${file.name}" must be less than or equal to 2 MB.`
        );
        event.target.value = "";
        return;
      }

      validFiles.push(file);
    }

    const newPreviews = validFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setImageFiles(validFiles);
    setImagePreviews(newPreviews);

    event.target.value = "";
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

    imageFiles.forEach((file) => {
      multipart.append("images", file);
    });

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
                <h2>Product Images</h2>

                <p>
                  Upload up to 3 images for this product.
                </p>
              </div>
            </div>

            <div className="admin-edit-image-area">

              <div className="admin-image-preview-grid">

                {imagePreviews.map((preview, index) => (
                  <div
                    className="admin-image-preview-card"
                    key={`${preview}-${index}`}
                  >
                    <img
                      src={preview}
                      alt={`${formData.name || "Product"} ${index + 1}`}
                      className="admin-image-preview"
                    />

                    {imageFiles.length > 0 && (
                      <button
                        type="button"
                        className="admin-image-remove-button"
                        onClick={() => {
                          URL.revokeObjectURL(imagePreviews[index]);

                          setImageFiles((currentFiles) =>
                            currentFiles.filter(
                              (_, fileIndex) => fileIndex !== index
                            )
                          );

                          setImagePreviews((currentPreviews) =>
                            currentPreviews.filter(
                              (_, previewIndex) =>
                                previewIndex !== index
                            )
                          );
                        }}
                      >
                        ×
                      </button>
                    )}

                    <span className="admin-image-number">
                      Image {index + 1}
                    </span>
                  </div>
                ))}

                {imageFiles.length === 0 || imagePreviews.length < 3 ? (
                  <label className="admin-image-add-card">

                    <div className="admin-upload-placeholder">
                      <div className="admin-upload-icon">＋</div>

                      <strong>
                        {imagePreviews.length === 0
                          ? "Add product images"
                          : "Replace images"}
                      </strong>

                      <span>
                        Select 1–3 images
                      </span>

                      <span>JPG, PNG or WebP</span>

                      <span>Maximum 2 MB each</span>

                      <span>Any aspect ratio</span>
                    </div>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleImageChange}
                      hidden
                    />

                  </label>
                ) : null}

              </div>

              {imageFiles.length > 0 && !imageError && (
                <div className="admin-image-ready">
                  <span>✓</span>

                  <div>
                    <strong>
                      {imageFiles.length} new image
                      {imageFiles.length === 1 ? "" : "s"} selected
                    </strong>

                    <small>
                      Saving will replace the current product images.
                    </small>
                  </div>
                </div>
              )}

              {imageFiles.length === 0 && imagePreviews.length > 0 && (
                <div className="admin-image-ready">
                  <span>✓</span>

                  <div>
                    <strong>Current product images</strong>

                    <small>
                      Select new images above to replace them.
                    </small>
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
