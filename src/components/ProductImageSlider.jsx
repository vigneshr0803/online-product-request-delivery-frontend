import { useEffect, useState } from "react";
import { getImageUrl } from "../services/imageService";

function ProductImageSlider({
    imageUrls = [],
    imageUrl,
    alt,
    className = "",
}) {
    const images =
        Array.isArray(imageUrls) && imageUrls.length > 0
            ? imageUrls
            : imageUrl
                ? [imageUrl]
                : [];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [failedImages, setFailedImages] = useState([]);

    useEffect(() => {
        setCurrentIndex(0);
        setFailedImages([]);
    }, [imageUrls, imageUrl]);

    if (images.length === 0) {
        return (
            <div className={`product-image-slider ${className}`}>
                <div className="product-image-placeholder">
                    <span>Image unavailable</span>
                </div>
            </div>
        );
    }

    const safeIndex =
        currentIndex >= images.length ? 0 : currentIndex;

    const currentImage = images[safeIndex];
    const src = getImageUrl(currentImage);

    const handleImageError = () => {
        setFailedImages((current) => {
            if (current.includes(safeIndex)) {
                return current;
            }

            return [...current, safeIndex];
        });
    };

    const goToPrevious = () => {
        setCurrentIndex((current) =>
            current === 0 ? images.length - 1 : current - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((current) =>
            current === images.length - 1 ? 0 : current + 1
        );
    };

    const imageFailed = failedImages.includes(safeIndex);

    return (
        <div className={`product-image-slider ${className}`}>
            <div className="product-image-frame">
                {imageFailed || !src ? (
                    <div className="product-image-placeholder">
                        <span>Image unavailable</span>
                    </div>
                ) : (
                    <img
                        src={src}
                        alt={`${alt || "Product"} image ${safeIndex + 1}`}
                        className="product-slider-image"
                        onError={handleImageError}
                    />
                )}

                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            className="product-slider-arrow product-slider-arrow-left"
                            onClick={goToPrevious}
                            aria-label="Previous product image"
                        >
                            ‹
                        </button>

                        <button
                            type="button"
                            className="product-slider-arrow product-slider-arrow-right"
                            onClick={goToNext}
                            aria-label="Next product image"
                        >
                            ›
                        </button>
                    </>
                )}

                {images.length > 1 && (
                    <div className="product-slider-dots">
                        {images.map((_, index) => (
                            <button
                                type="button"
                                key={index}
                                className={
                                    index === safeIndex
                                        ? "product-slider-dot active"
                                        : "product-slider-dot"
                                }
                                onClick={() => setCurrentIndex(index)}
                                aria-label={`Show product image ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductImageSlider;
