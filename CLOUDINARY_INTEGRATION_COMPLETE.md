# Cloudinary Integration Summary

## ✅ What Was Done

Cloudinary API integration has been added to your entire project for image and file uploads. All the necessary code and configurations are in place and ready to use.

## 📦 Files Created

### Frontend (React)

**Configuration & Utilities:**
- `src/lib/cloudinary.js` - Cloudinary configuration loader
- `src/utils/cloudinaryUpload.js` - Upload utilities (image, thumbnail, document)

**Hooks & Components:**
- `src/hooks/useCloudinaryUpload.js` - Reusable upload hook with state management
- `src/components/common/ImageUpload.jsx` - Reusable image upload component

**Environment:**
- `.env.example` - Environment variables template (includes Cloudinary keys)

**Documentation:**
- `CLOUDINARY_SETUP.md` - Comprehensive setup guide
- `CLOUDINARY_QUICK_REFERENCE.md` - Quick reference guide

### Backend (Node.js)

**Configuration:**
- `src/config/cloudinary.js` - Backend Cloudinary configuration
- `src/routes/cloudinary.js` - API endpoints for deletion and resources

**Environment:**
- `Languageunibackend/.env.example` - Backend env template with Cloudinary

## 🔄 Files Modified

### Frontend Pages Updated

All these pages now use Cloudinary instead of WWClient.integrations.Core.UploadFile:

1. **AdminCreateLevel.jsx**
   - Updated thumbnail upload handler
   - Uses `uploadThumbnailToCloudinary()`

2. **AdminLevelMaterials.jsx**
   - Updated file upload handler
   - Uses `uploadDocumentToCloudinary()`

3. **AdminStudyMaterials.jsx**
   - Updated file upload handler
   - Uses `uploadDocumentToCloudinary()`

4. **InstructorOnboarding.jsx**
   - Updated avatar upload handler
   - Updated resume upload handler
   - Uses `uploadImageToCloudinary()` and `uploadDocumentToCloudinary()`

5. **StudentOnboarding.jsx**
   - Updated avatar upload handler
   - Uses `uploadImageToCloudinary()`

## 🚀 Quick Start

### 1. Get Cloudinary Credentials (2 minutes)
```bash
1. Go to cloudinary.com and sign up (free)
2. Copy your Cloud Name from dashboard
3. Create an Upload Preset (Settings → Upload → Add upload preset)
   - Name: "language-uni"
   - Toggle "Unsigned" ON
   - Save and copy the preset name
```

### 2. Add to Frontend .env.local
```bash
# Copy .env.example to .env.local and fill in:
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 3. Test It!
```bash
1. npm run dev
2. Go to Admin → Create Level
3. Try uploading a thumbnail
4. It should work! ✅
```

### 4. Backend Setup (Optional)
```bash
# Only needed if you want file deletion endpoints

1. npm install cloudinary  (in Languageunibackend folder)

2. Add to backend .env:
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

3. Add to app.js:
   const { initializeCloudinary } = require('./config/cloudinary');
   if (process.env.CLOUDINARY_CLOUD_NAME) {
     initializeCloudinary();
     app.use('/api/cloudinary', require('./routes/cloudinary'));
   }
```

## 📚 Available Functions

### Frontend Upload Functions

```javascript
// Image uploads
import { uploadImageToCloudinary } from '@/utils/cloudinaryUpload';
const response = await uploadImageToCloudinary(file, {
  folder: 'language-uni/images',
  tags: ['myapp']
});
// Returns: { file_url, public_id, width, height, ... }

// Thumbnail uploads
import { uploadThumbnailToCloudinary } from '@/utils/cloudinaryUpload';
const response = await uploadThumbnailToCloudinary(file);
// Auto-configured for thumbnails folder

// Document uploads
import { uploadDocumentToCloudinary } from '@/utils/cloudinaryUpload';
const response = await uploadDocumentToCloudinary(file);
// For PDFs, documents, etc.

// URL optimization
import { optimizeImageUrl, getThumbnailUrl } from '@/utils/cloudinaryUpload';
const optimized = optimizeImageUrl(url);
const thumb = getThumbnailUrl(url, { width: 300, height: 200 });
```

### Reusable Hook

```javascript
import useCloudinaryUpload from '@/hooks/useCloudinaryUpload';

const MyComponent = () => {
  const { uploadImage, uploading, error } = useCloudinaryUpload();
  
  const handleUpload = async (file) => {
    const response = await uploadImage(file);
    console.log(response.file_url);
  };
  
  return (
    <button onClick={() => handleUpload(file)} disabled={uploading}>
      {uploading ? 'Uploading...' : 'Upload'}
    </button>
  );
};
```

### Reusable Component

```javascript
import ImageUpload from '@/components/common/ImageUpload';

<ImageUpload
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  uploadType="avatar"
  maxSize={5}
  label="Profile Picture"
/>
```

## 🗂️ Folder Structure

Uploads are organized automatically:
```
language-uni/
├── images/          # General images
├── thumbnails/      # Course/level thumbnails
├── documents/       # PDFs and documents
├── instructor-avatars/  # Instructor profiles
├── instructor-resumes/  # Resume PDFs
└── student-avatars/     # Student profiles
```

## 🔐 Security

✅ **Frontend is safe:**
- Uses unsigned uploads (no API secret exposed)
- File validation before upload
- Size limits enforced

✅ **Backend is secure:**
- API secret stored in backend .env (never exposed)
- Authentication required for deletion
- Proper error handling

## 📖 Documentation

For detailed information, see:

1. **CLOUDINARY_QUICK_REFERENCE.md** - Quick answers
2. **CLOUDINARY_SETUP.md** - Complete setup guide
3. **src/utils/cloudinaryUpload.js** - Function documentation
4. **src/hooks/useCloudinaryUpload.js** - Hook documentation
5. **src/components/common/ImageUpload.jsx** - Component documentation

## 🔍 Troubleshooting

### Problem: "Cloudinary is not configured"
**Solution:** Make sure `.env.local` has `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` set, then restart dev server.

### Problem: Upload fails with "Invalid preset"
**Solution:** Check the preset name matches exactly what you created in Cloudinary Dashboard (Settings → Upload).

### Problem: Uploads work but images don't show
**Solution:** Wait a moment for Cloudinary to process. Clear browser cache. Check network tab for actual URL.

## ✨ What's Next?

1. Add Cloudinary credentials when ready
2. Test uploads on existing pages (they're already integrated!)
3. Add image uploads to other pages using the reusable hook/component
4. Set up backend file deletion if needed
5. Configure additional Cloudinary features in dashboard as needed

## 📝 Integration Pattern

When adding Cloudinary to other pages:

```javascript
// 1. Import the upload function
import { uploadImageToCloudinary } from '@/utils/cloudinaryUpload';

// 2. In your upload handler
const handleUpload = async (file) => {
  try {
    const response = await uploadImageToCloudinary(file, {
      folder: 'language-uni/my-folder',
      tags: ['my-feature']
    });
    // Use response.file_url
    updateData({ image_url: response.file_url });
  } catch (error) {
    toast.error(error.message);
  }
};

// OR use the reusable hook
import useCloudinaryUpload from '@/hooks/useCloudinaryUpload';
const { uploadImage, uploading, error } = useCloudinaryUpload();

// OR use the reusable component
import ImageUpload from '@/components/common/ImageUpload';
<ImageUpload value={imageUrl} onChange={setImageUrl} />
```

## 🎯 What's Already Integrated?

✅ AdminCreateLevel - thumbnail uploads
✅ AdminLevelMaterials - material file uploads
✅ AdminStudyMaterials - study file uploads
✅ InstructorOnboarding - avatar & resume uploads
✅ StudentOnboarding - avatar uploads

## 🤝 Support

Check the documentation files for:
- API reference
- Function signatures
- Usage examples
- Troubleshooting
- Security best practices
- Cloudinary dashboard setup

## 🎉 You're All Set!

Everything is configured and ready. Just add your Cloudinary credentials and you're good to go!
