import API_URL from "../config/api";

const API_BASE_URL = API_URL;

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
};
