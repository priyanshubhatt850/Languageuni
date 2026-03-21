/**
 * Cloudinary Upload Utility
 * Handles image and file uploads to Cloudinary
 */

import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, isConfigured } from '@/lib/cloudinary';

/**
 * Upload file to Cloudinary
 * @param {File} file - The file to upload
 * @param {Object} options - Upload options
 * @param {String} options.folder - Cloudinary folder path
 * @param {Array<String>} options.tags - Tags to assign to the upload
 * @param {String} options.resourceType - Resource type: 'auto', 'image', 'video', 'raw'
 * @param {Boolean} options.eager - Apply eager transformations
 * @returns {Promise<Object>} Upload response with file_url and public_id
 */
export const uploadToCloudinary = async (file, options = {}) => {
  // Check if Cloudinary is configured
  if (!isConfigured()) {
    throw new Error('Cloudinary is not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file');
  }

  if (!file) {
    throw new Error('No file provided');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  // Add optional parameters
  if (options.folder) {
    formData.append('folder', options.folder);
  }

  if (options.tags && Array.isArray(options.tags)) {
    formData.append('tags', options.tags.join(','));
  }

  if (options.resourceType) {
    formData.append('resource_type', options.resourceType);
  }

  // For public uploads without authentication
  const resourceType = options.resourceType || 'auto';
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    const data = await response.json();

    return {
      file_url: data.secure_url,
      public_id: data.public_id,
      original_filename: data.original_filename,
      format: data.format,
      width: data.width,
      height: data.height,
      bytes: data.bytes,
      ...data
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Upload image to Cloudinary with specific image optimizations
 * @param {File} file - Image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload response
 */
export const uploadImageToCloudinary = async (file, options = {}) => {
  const defaultOptions = {
    folder: 'language-uni/images',
    resourceType: 'image',
    ...options,
    tags: [
      'language-uni',
      options.tags || []
    ].flat().filter(Boolean)
  };

  return uploadToCloudinary(file, defaultOptions);
};

/**
 * Upload thumbnail image to Cloudinary
 * @param {File} file - Thumbnail image file
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload response
 */
export const uploadThumbnailToCloudinary = async (file, options = {}) => {
  const defaultOptions = {
    folder: 'language-uni/thumbnails',
    tags: ['thumbnail'],
    ...options
  };

  return uploadImageToCloudinary(file, defaultOptions);
};

/**
 * Upload document/file to Cloudinary
 * @param {File} file - Document file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload response
 */
export const uploadDocumentToCloudinary = async (file, options = {}) => {
  const defaultOptions = {
    folder: 'language-uni/documents',
    resourceType: 'raw',
    ...options,
    tags: [
      'document',
      options.tags || []
    ].flat().filter(Boolean)
  };

  return uploadToCloudinary(file, defaultOptions);
};

/**
 * Delete file from Cloudinary (requires authentication on backend)
 * Note: Client-side deletion requires authentication. Use backend endpoint instead.
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) {
    throw new Error('No public ID provided');
  }

  try {
    // This is a placeholder - actual deletion should be done on the backend
    // using the Cloudinary API with proper authentication
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ publicId })
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }

    return await response.json();
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw error;
  }
};

/**
 * Optimize image URL with Cloudinary transformations
 * @param {String} url - Original Cloudinary URL
 * @param {Object} transformations - Transformation parameters
 * @returns {String} Optimized image URL
 */
export const optimizeImageUrl = (url, transformations = {}) => {
  if (!url || !url.includes('cloudinary')) {
    return url;
  }

  const defaultTransformations = {
    quality: 'auto',
    fetch_format: 'auto',
    ...transformations
  };

  const params = Object.entries(defaultTransformations)
    .map(([key, value]) => `${key}_${value}`)
    .join(',');

  if (!params) return url;

  // Insert transformations into Cloudinary URL
  return url.replace('/upload/', `/upload/${params}/`);
};

/**
 * Get thumbnail URL with optimizations
 * @param {String} url - Original Cloudinary URL
 * @param {Object} options - Thumbnail options
 * @returns {String} Optimized thumbnail URL
 */
export const getThumbnailUrl = (url, options = {}) => {
  const {
    width = 300,
    height = 200,
    crop = 'fill',
    gravity = 'auto'
  } = options;

  return optimizeImageUrl(url, {
    width,
    height,
    crop,
    gravity,
    quality: 'auto',
    fetch_format: 'auto'
  });
};
