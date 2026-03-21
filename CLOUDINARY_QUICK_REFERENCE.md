# Cloudinary Quick Reference

## Getting Started

1. **Sign up** at [cloudinary.com](https://cloudinary.com)
2. **Get credentials** from Dashboard (Cloud Name, API Key, Upload Preset)
3. **Add to .env.local**:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```
4. **Done!** Uploads should work automatically

## Where Cloudinary is Used

### Frontend (React Pages)
- ✅ **AdminCreateLevel** - Course level thumbnails
- ✅ **AdminLevelMaterials** - Learning material files
- ✅ **AdminStudyMaterials** - Study material files  
- ✅ **InstructorOnboarding** - Avatar & resume uploads
- ✅ **StudentOnboarding** - Avatar uploads

### Backend (Optional)
- 📁 `src/routes/cloudinary.js` - Delete & resource endpoints
- 📁 `src/config/cloudinary.js` - Configuration

## Common Tasks

### Upload Image to Cloudinary
```javascript
import { uploadImageToCloudinary } from '@/utils/cloudinaryUpload';

const response = await uploadImageToCloudinary(file, {
  folder: 'language-uni/my-folder',
  tags: ['myapp']
});
// response.file_url contains the public URL
```

### Upload Document/PDF
```javascript
import { uploadDocumentToCloudinary } from '@/utils/cloudinaryUpload';

const response = await uploadDocumentToCloudinary(file, {
  tags: ['document']
});
```

### Optimize Image URL
```javascript
import { optimizeImageUrl, getThumbnailUrl } from '@/utils/cloudinaryUpload';

// Auto quality
const url = optimizeImageUrl(originalUrl);

// Fixed size thumbnail
const thumb = getThumbnailUrl(originalUrl, {
  width: 300,
  height: 200
});
```

## Files You'll Need to Update

When adding Cloudinary to other pages, import and use:

```javascript
// For image uploads
import { uploadImageToCloudinary } from '@/utils/cloudinaryUpload';

// For document uploads
import { uploadDocumentToCloudinary } from '@/utils/cloudinaryUpload';

// For thumbnails
import { uploadThumbnailToCloudinary } from '@/utils/cloudinaryUpload';

// For URL optimization
import { optimizeImageUrl, getThumbnailUrl } from '@/utils/cloudinaryUpload';
```

Then replace your old upload calls:
```javascript
// OLD - Remove this
const { file_url } = await WWClient.integrations.Core.UploadFile(file);

// NEW - Use this
const response = await uploadImageToCloudinary(file);
const file_url = response.file_url;
```

## Cloudinary Dashboard

- **Cloud Name**: Found on dashboard homepage
- **API Key**: Found on dashboard → Settings → API Keys
- **Upload Preset**: Create in Settings → Upload → Upload Presets
  - Name it something like: `language-uni`
  - Toggle "Unsigned" ON
  - Click Save

## Backend Setup (Optional)

If you want server-side file deletion:

1. Install package:
   ```bash
   cd Languageunibackend
   npm install cloudinary
   ```

2. Add to `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. Initialize in `app.js`:
   ```javascript
   const { initializeCloudinary } = require('./config/cloudinary');
   initializeCloudinary();
   app.use('/api/cloudinary', require('./routes/cloudinary'));
   ```

## Folder Organization

Uploads are automatically organized:
- `language-uni/images/` - General images
- `language-uni/thumbnails/` - Course/level thumbnails
- `language-uni/documents/` - PDFs and files
- `language-uni/instructor-avatars/` - Instructor profiles
- `language-uni/instructor-resumes/` - Instructor resumes
- `language-uni/student-avatars/` - Student profiles

## Image Transformations

Cloudinary automatically optimizes all images:
- Auto compression
- Auto format conversion (WebP where supported)
- Responsive delivery

Add custom transformations:
```javascript
optimizeImageUrl(url, {
  width: 300,
  height: 200,
  crop: 'fill',
  quality: 'auto',
  fetch_format: 'auto'
})
```

## Troubleshooting

| Error | Solution |
|-------|----------|
| "Cloudinary is not configured" | Add env variables and restart dev server |
| "Invalid upload preset" | Check preset name in Cloudinary Dashboard |
| Upload fails | Check file size/type, ensure preset is "Unsigned" |
| Images not showing | Wait a moment for processing, check browser cache |

## Documentation

- **Full Setup Guide**: `CLOUDINARY_SETUP.md`
- **API Reference**: `src/utils/cloudinaryUpload.js`
- **Cloudinary Docs**: https://cloudinary.com/documentation
