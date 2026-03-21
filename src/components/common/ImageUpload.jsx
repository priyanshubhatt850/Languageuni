/**
 * ImageUpload Component
 * Reusable image upload component with preview and Cloudinary integration
 * 
 * Usage:
 * <ImageUpload
 *   value={imageUrl}
 *   onChange={(url) => setImageUrl(url)}
 *   uploadType="image"  // 'image', 'thumbnail', 'avatar'
 *   maxSize={5}  // MB
 *   aspect={false}  // Keep aspect ratio
 * />
 */

import React, { useState, useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { toast } from 'sonner';

export const ImageUpload = ({
  value,
  onChange,
  uploadType = 'image',
  maxSize = 5,
  label = 'Upload Image',
  acceptedFormats = 'image/*',
  showPreview = true,
  className = '',
  disabled = false
}) => {
  const fileInputRef = useRef(null);
  const { uploadImage, uploading, error } = useCloudinaryUpload();

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    try {
      const options = {
        tags: [uploadType]
      };

      if (uploadType === 'avatar') {
        options.folder = 'language-uni/avatars';
      } else if (uploadType === 'thumbnail') {
        options.folder = 'language-uni/thumbnails';
      }

      const response = await uploadImage(file, options);
      onChange(response.file_url);
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error(error || 'Upload failed');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && <Label>{label}</Label>}

      {showPreview && value && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={uploading}
            className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded opacity-0 hover:opacity-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!value && (
        <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
          {uploading ? (
            <>
              <div className="animate-spin">
                <Camera className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-sm font-medium">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 text-slate-400" />
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs text-slate-500">or drag and drop</span>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats}
            onChange={handleFileSelect}
            disabled={uploading || disabled}
            className="hidden"
          />
        </label>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <p className="text-xs text-slate-500">
        Max size: {maxSize}MB • Formats: {acceptedFormats}
      </p>
    </div>
  );
};

export default ImageUpload;
