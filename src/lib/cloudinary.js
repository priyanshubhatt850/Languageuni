/**
 * Cloudinary Configuration
 * Initialize and configure Cloudinary for image uploads
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;

// Validate Cloudinary configuration
const isConfigured = () => {
  return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
};

// Get Cloudinary configuration
const getCloudinaryConfig = () => {
  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
    apiKey: CLOUDINARY_API_KEY
  };
};

export {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_API_KEY,
  isConfigured,
  getCloudinaryConfig
};
