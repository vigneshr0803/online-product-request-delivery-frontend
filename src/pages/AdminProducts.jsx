import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import "../styles/admin.css";
import AdminNavbar from "../components/AdminNavbar";
import ProductImageSlider from "../components/ProductImageSlider";

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      setMessage("Admin login required.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this product?"
    );

    if (!confirmed) {
      return;
    }

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      setMessage("Admin login required.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.text();

      if (!response.ok) {
        throw new Error(
          data || "Failed to delete product"
        );
      }

      setMessage("Product deactivated successfully.");

      // Refresh the product list
      await loadProducts();

    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleActivate = async (productId) => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      setMessage("Admin login required.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/products/${productId}/activate`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.text();

      if (!response.ok) {
        throw new Error(data || "Failed to activate product");
      }

      setMessage("Product activated successfully.");

      await loadProducts();

    } catch (error) {
      setMessage(error.message);
    }
  };

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      product.name?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && product.active) ||
      (statusFilter === "INACTIVE" && !product.active);

    return matchesSearch && matchesStatus;
  });

  const getStockStatus = (quantity) => {
    if (quantity <= 0) {
      return {
        label: "Out of Stock",
        className: "admin-stock-out",
      };
    }

    if (quantity <= 5) {
      return {
        label: "Low Stock",
        className: "admin-stock-low",
      };
    }

    return {
      label: "In Stock",
      className: "admin-stock-good",
    };
  };

  if (loading) {
    return <h2>Loading products...</h2>;
  }

  return (
    <div className="admin-products-page">
      <AdminNavbar />

      <main className="admin-products-content">
        <section className="admin-products-header">
          <div>
            <span className="admin-page-eyebrow">INVENTORY MANAGEMENT</span>

            <h1>Manage Products</h1>

            <p>Manage your products, pricing, stock and availability.</p>
          </div>

          <button
            className="admin-add-product-button"
            onClick={() => navigate("/admin/products/add")}
          >
            <span>＋</span>
            Add Product
          </button>
        </section>

        {message && (
          <div className="admin-product-message">
            <span>✓</span>
            <p>{message}</p>
          </div>
        )}

        <section className="admin-products-toolbar">
          <div className="admin-product-search">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="admin-product-filters">
            <button
              className={
                statusFilter === "ALL"
                  ? "admin-filter-button active"
                  : "admin-filter-button"
              }
              onClick={() => setStatusFilter("ALL")}
            >
              All
            </button>

            <button
              className={
                statusFilter === "ACTIVE"
                  ? "admin-filter-button active"
                  : "admin-filter-button"
              }
              onClick={() => setStatusFilter("ACTIVE")}
            >
              Active
            </button>

            <button
              className={
                statusFilter === "INACTIVE"
                  ? "admin-filter-button active"
                  : "admin-filter-button"
              }
              onClick={() => setStatusFilter("INACTIVE")}
            >
              Inactive
            </button>
          </div>

          <span className="admin-product-result-count">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
          </span>
        </section>

        {filteredProducts.length === 0 ? (
          <section className="admin-products-empty">
            <div className="admin-products-empty-icon">🔎</div>

            <h2>No products found</h2>

            <p>Try another search or change the filter.</p>

            <button
              className="admin-clear-filter-button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
              }}
            >
              Clear Filters
            </button>
          </section>
        ) : (
          <section className="admin-products-grid">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.availableQuantity);

              return (
                <article className="admin-product-card" key={product.id}>
                  <div className="admin-product-image">
                    <ProductImageSlider
                      imageUrls={product.imageUrls}
                      imageUrl={product.imageUrl}
                      alt={product.name}
                    />
                  </div>

                  <div className="admin-product-info">
                    <div className="admin-product-top">
                      <h2>{product.name}</h2>

                      <span
                        className={
                          product.active
                            ? "admin-active-badge"
                            : "admin-inactive-badge"
                        }
                      >
                        <span className="status-dot"></span>
                        {product.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="admin-product-description">
                      {product.description || "No description available."}
                    </p>

                    <div className="admin-product-price">
                      ₹{Number(product.price || 0).toFixed(2)}
                      <span> / {product.unit}</span>
                    </div>

                    <div className="admin-product-stock-row">
                      <span
                        className={`admin-stock-badge ${stockStatus.className}`}
                      >
                        <span className="status-dot"></span>
                        {stockStatus.label}
                      </span>

                      <span className="admin-product-stock-count">
                        {product.availableQuantity} available
                      </span>
                    </div>
                  </div>

                  <div className="admin-product-actions">
                    <button
                      className="admin-edit-product-button"
                      onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                    >
                      ✏ Edit
                    </button>

                    {product.active ? (
                      <button
                        className="admin-deactivate-button"
                        onClick={() => handleDeactivate(product.id)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        className="admin-activate-button"
                        onClick={() => handleActivate(product.id)}
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminProducts;
