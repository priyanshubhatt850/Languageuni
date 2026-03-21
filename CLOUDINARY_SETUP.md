# Cloudinary Integration Setup Guide

This guide explains how to set up Cloudinary for image and file uploads in the Language Uni project.

## Table of Contents
1. [Overview](#overview)
2. [Getting Cloudinary Credentials](#getting-cloudinary-credentials)
3. [Frontend Setup](#frontend-setup)
4. [Backend Setup](#backend-setup)
5. [Usage Examples](#usage-examples)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)

## Overview

The project uses Cloudinary for:
- **Image uploads**: Thumbnails, avatars, study materials
- **Document uploads**: PDFs, resumes
- **Auto-optimized delivery**: Responsive images with auto compression
- **Backend deletion**: Secure file deletion with authentication

### Architecture

```
Frontend (React)
├── uploadThumbnailToCloudinary()
├── uploadImageToCloudinary()
├── uploadDocumentToCloudinary()
└── optimizeImageUrl()
         ↓
Cloudinary Upload API (public, no auth needed)
         ↓
Cloudinary CDN
```

## Getting Cloudinary Credentials

### Step 1: Create a Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email

### Step 2: Get Your Credentials
1. Go to your [Cloudinary Dashboard](https://cloudinary.com/console)
2. You'll see your **Cloud Name** and **API Key** on the dashboard
3. Copy these values

### Step 3: Create an Upload Preset
1. In the Cloudinary Dashboard, go to **Settings** → **Upload**
2. Scroll to **Upload presets**
3. Click **Add upload preset**
4. Fill in the form:
   - **Name**: `language-uni` (or your preferred name)
   - **Unsigned**: Toggle this ON (allows client-side uploads without sending API secret to frontend)
   - **Folder**: Leave blank or set to `language-uni` for default folder
5. Click **Save**
6. Copy the preset name

### Optional: Get API Secret (for backend operations)
1. In Cloudinary Dashboard, go to **Settings** → **API Keys**
2. Look for **API Secret** - keep this safe, only use on backend!

## Frontend Setup

### Step 1: Update .env file

Copy `.env.example` and create `.env.local`:

```bash
# Frontend Configuration
VITE_API_URL=http://localhost:3000

# Cloudinary Configuration (get from Cloudinary Dashboard)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_here
VITE_CLOUDINARY_API_KEY=your_api_key_here  # Optional, for client-side operations
```

### Step 2: Verify Installation

The following files are already created:
- `src/lib/cloudinary.js` - Configuration
- `src/utils/cloudinaryUpload.js` - Upload utilities

### Step 3: Test Upload

1. Start your dev server: `npm run dev`
2. Go to Admin → Create Level
3. Try uploading a thumbnail image
4. You should see it upload successfully to Cloudinary

## Backend Setup

### Step 1: Update Backend .env file

```bash
# Cloudinary Backend Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here  # IMPORTANT: Keep this secret!
```

### Step 2: Install Cloudinary Package

```bash
cd Languageunibackend
npm install cloudinary
```

### Step 3: Initialize Cloudinary in app.js

Add to your `src/app.js`:

```javascript
const { initializeCloudinary, isCloudinaryConfigured } = require('./config/cloudinary');

// Initialize Cloudinary if configured
if (isCloudinaryConfigured()) {
  initializeCloudinary();
  console.log('✓ Cloudinary configured');
} else {
  console.warn('⚠ Cloudinary not fully configured. File deletion features will be disabled.');
}
```

### Step 4: Add Cloudinary Routes

Add to your `src/app.js` (after other route definitions):

```javascript
// Cloudinary routes (optional, for server-side operations)
const cloudinaryRoutes = require('./routes/cloudinary');
app.use('/api/cloudinary', cloudinaryRoutes);
```

### Step 5: Test Backend Endpoints

When configured, you can test:

```bash
# Delete a file (requires authentication)
curl -X POST http://localhost:3000/api/cloudinary/delete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"publicId":"language-uni/images/example"}'

# Get resources
curl http://localhost:3000/api/cloudinary/resources \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Usage Examples

### Frontend - Upload Thumbnail
```javascript
import { uploadThumbnailToCloudinary } from '@/utils/cloudinaryUpload';

const handleUpload = async (file) => {
  try {
    const response = await uploadThumbnailToCloudinary(file, {
      tags: ['course', 'level']
    });
    console.log('Uploaded:', response.file_url);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};
```

### Frontend - Upload Avatar Image
```javascript
import { uploadImageToCloudinary } from '@/utils/cloudinaryUpload';

const handleAvatarUpload = async (file) => {
  const response = await uploadImageToCloudinary(file, {
    folder: 'language-uni/instructor-avatars',
    tags: ['instructor', 'avatar']
  });
  return response.file_url;
};
```

### Frontend - Upload Document
```javascript
import { uploadDocumentToCloudinary } from '@/utils/cloudinaryUpload';

const handlePdfUpload = async (file) => {
  const response = await uploadDocumentToCloudinary(file, {
    folder: 'language-uni/documents',
    tags: ['resume', 'pdf']
  });
  return response.file_url;
};
```

### Frontend - Optimize Image URL
```javascript
import { optimizeImageUrl, getThumbnailUrl } from '@/utils/cloudinaryUpload';

// Auto quality and format
const optimized = optimizeImageUrl(url);

// Fixed size thumbnail
const thumbnail = getThumbnailUrl(url, {
  width: 300,
  height: 200,
  crop: 'fill'
});
```

### Backend - Delete File
```javascript
const { cloudinary } = require('./config/cloudinary');

const deleteCloudinaryFile = async (publicId) => {
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
};
```

## API Reference

### Frontend Functions

#### uploadToCloudinary(file, options)
General-purpose upload function.

**Parameters:**
- `file` (File): The file to upload
- `options` (Object):
  - `folder` (string): Cloudinary folder path
  - `tags` (Array<string>): Tags for the upload
  - `resourceType` (string): 'auto', 'image', 'video', 'raw'

**Returns:** Promise<Object>
```javascript
{
  file_url: string,          // Secure URL to the file
  public_id: string,         // Cloudinary public ID
  original_filename: string,
  format: string,            // File format (jpg, png, etc)
  width: number,             // Image width (if image)
  height: number,            // Image height (if image)
  bytes: number,             // File size in bytes
}
```

#### uploadImageToCloudinary(file, options)
Upload with image-specific optimizations.
- Default folder: `language-uni/images`
- Default tags: `['language-uni']`

#### uploadThumbnailToCloudinary(file, options)
Upload thumbnail images.
- Default folder: `language-uni/thumbnails`
- Adds `thumbnail` tag automatically

#### uploadDocumentToCloudinary(file, options)
Upload documents/files.
- Default folder: `language-uni/documents`
- Resource type: `raw`
- Adds `document` tag automatically

#### optimizeImageUrl(url, transformations)
Add Cloudinary transformations to a URL.

**Common transformations:**
```javascript
{
  width: 500,           // Set width
  height: 300,          // Set height
  crop: 'fill',         // fill, fit, pad, etc
  gravity: 'auto',      // Where to crop from
  quality: 'auto',      // Let Cloudinary decide
  fetch_format: 'auto', // Auto-convert format
  radius: 10            // Border radius
}
```

#### getThumbnailUrl(url, options)
Get optimized thumbnail URL.

**Options:**
- `width` (number): Default 300
- `height` (number): Default 200
- `crop` (string): Default 'fill'
- `gravity` (string): Default 'auto'

### Backend Functions

See `src/config/cloudinary.js` and `src/routes/cloudinary.js`

## Troubleshooting

### "Cloudinary is not configured" error

**Solution:** Check that you have set these env variables:
```
VITE_CLOUDINARY_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET
```

Run `npm run dev` after updating `.env.local`

### Upload fails with "Invalid preset"

**Solution:** 
1. Verify preset name in Cloudinary Dashboard → Settings → Upload
2. Ensure preset is marked as "Unsigned"
3. Check spelling in `.env.local`

### Images not optimizing

**Solution:** Cloudinary needs a few minutes to process images. Try:
1. Clear browser cache
2. Check the raw image URL in network tab
3. Images might be stored in different format

### File deletion doesn't work on backend

**Solution:**
1. Verify `CLOUDINARY_API_SECRET` is set (never expose this!)
2. Ensure user is authenticated
3. Check that `public_id` is correct

### Large files failing

**Solution:**
- Cloudinary free tier has upload limits
- Compress before uploading
- Use `resourceType: 'auto'` for proper type detection

### CORS errors on upload

**Solution:**
- This shouldn't happen with Cloudinary's API
- Check browser console for actual error
- Verify cloud name and preset

## Security Best Practices

1. **Never expose API Secret in frontend** - Only use in backend
2. **Use unsigned upload presets** for client-side uploads
3. **Add upload preset rules** to limit file types and sizes
4. **Use authentication** for file deletion endpoints
5. **Add tags** to uploads for organizing and auditing
6. **Set appropriate folder structure** to organize files

## Next Steps

1. Get your Cloudinary credentials (see Getting Started section)
2. Update `.env.local` with your credentials
3. Test upload on Admin pages
4. (Optional) Set up backend deletion if needed
5. Configure additional options in Cloudinary Dashboard as needed

## Support

For more information:
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Cloudinary URL Transformations](https://cloudinary.com/documentation/image_transformation_reference)
