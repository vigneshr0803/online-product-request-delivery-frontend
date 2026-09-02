import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import "../styles/products.css";
import "../styles/customer.css";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import CustomerNavbar from "../components/CustomerNavbar";

function Products() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/categories`
        );

        if (!response.ok) {
          throw new Error("Failed to load categories");
        }

        const data = await response.json();

        setCategories(data);
      } catch (error) {
        console.error(
          "Failed to load categories:",
          error
        );
      }
    };

    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/products`
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

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" ||
      product.categoryId === Number(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <>
        <CustomerNavbar />
        <main className="products-page">
          <h2>Loading products...</h2>
        </main>
      </>
    );
  }

  return (
    <>
      <CustomerNavbar cartCount={cartCount} />

      <main className="products-page">
        <div className="products-header">
          <div className="products-title">
            <div>
              <h1>Fresh Products</h1>
              <p>
                Find what you need and add it to your cart.
              </p>
            </div>

            <span className="product-count">
              {filteredProducts.length} products
            </span>
          </div>

          <div className="product-filters">
            <div className="product-search">
              <span className="search-icon">⌕</span>

              <input
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <div className="category-list">
              <button
                className={
                  selectedCategory === "ALL"
                    ? "category-button active"
                    : "category-button"
                }
                onClick={() => setSelectedCategory("ALL")}
              >
                All
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  className={
                    Number(selectedCategory) === category.id
                      ? "category-button active"
                      : "category-button"
                  }
                  onClick={() =>
                    setSelectedCategory(String(category.id))
                  }
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {message && <p>{message}</p>}

        {filteredProducts.length === 0 ? (
          <div className="products-empty">
            <div className="empty-icon">🔎</div>

            <h2>No products found</h2>

            <p>
              Try another search or choose a different category.
            </p>

            <button
              className="btn btn-outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("ALL");
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default Products;
