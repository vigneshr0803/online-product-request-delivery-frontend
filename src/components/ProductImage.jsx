import { useState } from "react";
import { getImageUrl } from "../services/imageService";

function ProductImage({ imageUrl, alt, className = "" }) {
  const [hasError, setHasError] = useState(false);

  const src = getImageUrl(imageUrl);

  if (!src || hasError) {
    return (
      <div className={`product-image-placeholder ${className}`}>
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

export default ProductImage;
