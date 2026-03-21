/**
 * useCloudinaryUpload Hook
 * Reusable hook for Cloudinary image uploads with loading and error states
 */

import { useState, useCallback } from 'react';
import {
  uploadImageToCloudinary,
  uploadThumbnailToCloudinary,
  uploadDocumentToCloudinary
} from '@/utils/cloudinaryUpload';

export const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const uploadImage = useCallback(async (file, options = {}) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const response = await uploadImageToCloudinary(file, options);
      setProgress(100);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Image upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, []);

  const uploadThumbnail = useCallback(async (file, options = {}) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const response = await uploadThumbnailToCloudinary(file, options);
      setProgress(100);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Thumbnail upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, []);

  const uploadDocument = useCallback(async (file, options = {}) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const response = await uploadDocumentToCloudinary(file, options);
      setProgress(100);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Document upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploading,
    error,
    progress,
    uploadImage,
    uploadThumbnail,
    uploadDocument,
    clearError
  };
};

export default useCloudinaryUpload;
