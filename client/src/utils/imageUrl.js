/**
 * Resolves local upload image paths or external URLs dynamically.
 * Prepends the backend API URL from env if available and path is relative.
 * 
 * @param {string} imagePath - Path to the image
 * @returns {string} Fully resolved image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If it's already a full URL, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Dynamic host fallback
  const apiBase = import.meta.env.VITE_API_URL || '';
  return `${apiBase}${imagePath}`;
};
