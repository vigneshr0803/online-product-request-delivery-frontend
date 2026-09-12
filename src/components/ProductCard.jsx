import { useState } from "react";
import ProductImageSlider from "./ProductImageSlider";

function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => {
    if (quantity < product.availableQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 0) {
      return {
        label: "Out of Stock",
        className: "out-of-stock",
      };
    }

    if (quantity <= 5) {
      return {
        label: "Low Stock",
        className: "low-stock",
      };
    }

    return {
      label: "In Stock",
      className: "in-stock",
    };
  };

  const stockStatus = getStockStatus(product.availableQuantity);

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <ProductImageSlider
          imageUrls={product.imageUrls}
          imageUrl={product.imageUrl}
          alt={product.name}
        />
      </div>

      <div className="product-card-content">
        <h2>{product.name}</h2>

        <p className="product-description">{product.description}</p>

        <p className="product-price">
          ₹{product.price} / {product.unit}
        </p>

        <div className="product-stock-section">
          <span className={`stock-badge ${stockStatus.className}`}>
            <span className="stock-dot"></span>
            {stockStatus.label}
          </span>

          {product.availableQuantity > 0 && (
            <span className="stock-count">
              {product.availableQuantity} available
            </span>
          )}
        </div>

        <div className="quantity-control">
          <button
            onClick={decreaseQuantity}
            disabled={
              product.availableQuantity <= 0 ||
              quantity <= 1
            }
          >
            −
          </button>
          <span>{quantity}</span>
          <button
            onClick={increaseQuantity}
            disabled={
              product.availableQuantity <= 0 ||
              quantity >= product.availableQuantity
            }
          >
            +
          </button>
        </div>

        <button
          className="add-cart-btn"
          onClick={() => onAddToCart(product, quantity)}
          disabled={product.availableQuantity <= 0}
        >
          {product.availableQuantity <= 0
            ? "Out of Stock"
            : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
