# Image Upload Feature Guide

## Overview

The platform now supports image uploads for jobs. Users can upload images when creating jobs, and these images are displayed in job listings and detail pages.

## Backend Implementation

### File Structure

- **`backend/core/file_upload.php`** - File upload handling functions
- **`backend/routes/upload.php`** - Upload API endpoints
- **`backend/storage/uploads/`** - Directory where images are stored

### Security Features

1. **File Type Validation**
   - Allowed extensions: jpg, jpeg, png, gif, webp
   - MIME type checking
   - Image validation using `getimagesize()`

2. **File Size Limit**
   - Maximum file size: 5MB

3. **Unique Filenames**
   - Random 32-character hex strings
   - Prevents filename conflicts
   - Prevents directory traversal attacks

4. **Storage Organization**
   - Images stored in `storage/uploads/{context}/`
   - Context-based organization (e.g., `jobs/`, `profiles/`)

### API Endpoints

#### Upload Image
```
POST /api/upload/image
Content-Type: multipart/form-data

Parameters:
- image: File (required)
- context: String (optional, default: 'general')
```

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "abc123...xyz.jpg",
    "path": "storage/uploads/jobs/abc123...xyz.jpg",
    "url": "http://localhost:5135/api/storage/uploads/jobs/abc123...xyz.jpg"
  }
}
```

#### Delete Image
```
DELETE /api/upload/image
Content-Type: application/json

Body:
{
  "path": "storage/uploads/jobs/abc123...xyz.jpg"
}
```

### Database Schema

The `jobs` table now includes an `image_path` column:

```sql
ALTER TABLE jobs ADD COLUMN image_path VARCHAR(500);
```

### Migration

If your database already exists, run:

```bash
cd backend
php storage/add_image_column.php
```

Or the column will be added automatically when you run the full migration.

## Frontend Implementation

### Components

#### ImageUpload Component
Located at: `frontend/components/ui/image-upload.js`

**Props:**
- `onImageUploaded`: Callback function when image is uploaded
- `currentImage`: Current image URL (for editing)
- `label`: Label text (default: 'Upload Image')

**Usage:**
```javascript
import { ImageUpload } from '@/components/ui/image-upload';

<ImageUpload
  onImageUploaded={(data) => {
    console.log('Image uploaded:', data);
    // data contains: { path, url, filename }
  }}
  currentImage={existingImageUrl}
  label="Job Image"
/>
```

### API Integration

The upload API is available in `frontend/lib/api.js`:

```javascript
import { uploadAPI } from '@/lib/api';

// Upload image
const formData = new FormData();
formData.append('image', file);
formData.append('context', 'jobs');

const response = await uploadAPI.uploadImage(formData);
```

### Job Creation with Image

The job creation form (`frontend/app/jobs/new/page.js`) now includes:

1. Image upload component
2. Image preview
3. Automatic upload when file is selected
4. Image path included in job creation

### Image Display

Images are displayed in:

1. **Job Listings** (`/jobs`)
   - Thumbnail at top of card
   - Full width, 192px height

2. **Job Details** (`/jobs/[id]`)
   - Large hero image
   - Responsive height (256px mobile, 384px desktop)

### Image URL Handling

Images are served through the API:

```javascript
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL}/api/${imagePath}`;
};
```

## Configuration

### Backend Configuration

In `backend/core/file_upload.php`:

```php
define('UPLOAD_DIR', __DIR__ . '/../storage/uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'webp']);
```

### Frontend Configuration

The API URL is configured in:
- `frontend/lib/api.js`
- `frontend/next.config.js`
- `frontend/.env.local`

## Usage Examples

### Upload Image in Job Creation

1. User clicks "Choose Image" or drags image
2. Image preview appears immediately
3. Image uploads automatically
4. Image path is saved with job

### Display Image in Job Listing

```javascript
{job.image_path && (
  <img
    src={getImageUrl(job.image_path)}
    alt={job.title}
    className="w-full h-48 object-cover"
  />
)}
```

## Troubleshooting

### Image Not Uploading

1. Check file size (must be < 5MB)
2. Check file type (must be image)
3. Check uploads directory permissions
4. Check backend logs

### Image Not Displaying

1. Verify image path in database
2. Check API URL configuration
3. Verify static file serving in `backend/index.php`
4. Check browser console for errors

### Permission Errors

Ensure uploads directory is writable:

```bash
chmod 755 backend/storage/uploads
chmod 755 backend/storage/uploads/jobs
```

## Future Enhancements

- Image resizing/optimization
- Multiple images per job
- Image cropping
- CDN integration
- User profile images
- Portfolio images for freelancers

## Security Notes

- All uploads are validated
- Filenames are sanitized
- File types are strictly checked
- Images are stored outside web root (relative to API)
- Consider adding virus scanning in production

