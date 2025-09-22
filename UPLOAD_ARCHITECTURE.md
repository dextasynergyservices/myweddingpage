# File Upload Architecture Documentation

## 📋 Overview

This document describes the complete file upload architecture for the wedding website platform, implemented to bypass Vercel's 4.5MB body parse limit and provide secure, scalable file uploads through direct Cloudinary integration.

## 🏗️ Architecture Summary

### Before (Problematic)

```
Browser → Vercel (4.5MB limit) → Cloudinary → Database
```

### After (Optimized)

```
Browser → Cloudinary (direct) → Database (metadata only)
Browser → Signature API → Browser → Cloudinary (signed) → Database
```

## 🎯 Implementation Phases

### ✅ Phase 1: Direct Gallery Uploads

- **Location**: `src/components/dashboard/Gallery.tsx`
- **Method**: Unsigned upload presets
- **Features**: Quality-preserving compression, toast notifications, delete functionality
- **File Types**: Photos and videos for wedding galleries
- **Size Limits**: Up to 50MB (with compression)

### ✅ Phase 2: Signed Uploads for Sensitive Content

- **Location**: `src/api/cloudinary/generate-signature/`
- **Method**: Server-generated signatures
- **Features**: User-specific folders, transformation presets, secure upload parameters
- **File Types**: Profile images, hero images, story images, logos

### ✅ Phase 3: General Image Upload Migration

- **Location**: `src/app/api/upload-image/route.ts`
- **Method**: Server-side authenticated uploads
- **Features**: Maintains API compatibility, adds user authentication, organized folder structure
- **Used By**: EditWeddingDetailsModal, GuestManagement, GiftRegistration

### ✅ Phase 4: URL Storage Endpoint Updates

- **Locations**:
  - `src/app/api/wedding-pages/hero-image/route.ts`
  - `src/app/api/wedding-pages/story-image/route.ts`
  - `src/app/api/wedding-pages/logo/route.ts`
- **Features**: URL validation, Cloudinary domain verification, trusted source checking

### ✅ Phase 5: Cleanup and Documentation

- **This document** and comprehensive error handling

## 📁 File Organization Structure

```
Cloudinary Folder Structure:
├── users/
│   ├── {userId}/
│   │   ├── profile/
│   │   │   └── profile_{userId}_{timestamp}
│   │   ├── wedding/
│   │   │   ├── hero/
│   │   │   │   └── hero_{userId}_{timestamp}
│   │   │   ├── story/
│   │   │   │   └── story_{userId}_{timestamp}
│   │   │   └── logo/
│   │   │       └── logo_{userId}_{timestamp}
│   │   ├── general/
│   │   │   └── general_{userId}_{timestamp}
│   │   └── gallery/
│   │       ├── photo_{timestamp}
│   │       └── video_{timestamp}
```

## 🔧 API Endpoints

### Upload Endpoints

#### 1. `/api/cloudinary/generate-signature` (POST)

**Purpose**: Generate secure upload signatures for client-side uploads
**Authentication**: Required (user session)
**Parameters**:

```json
{
  "uploadType": "profile|hero|story|logo|general",
  "fileName": "string",
  "fileSize": "number"
}
```

**Response**:

```json
{
  "signature": "string",
  "timestamp": "number",
  "api_key": "string",
  "cloud_name": "string",
  "folder": "string",
  "public_id": "string",
  "resource_type": "string"
}
```

#### 2. `/api/upload-image` (POST)

**Purpose**: General image upload with server-side processing
**Authentication**: Required (user session)
**Parameters**: FormData with `file` and optional `uploadType`
**File Limits**:

- Size: 10MB maximum
- Types: JPEG, PNG, GIF, WebP
- Transformations: Applied based on upload type

#### 3. `/api/gallery-upload` (POST)

**Purpose**: Gallery media uploads (photos/videos)
**Authentication**: Required (user session)
**Features**: Plan limit validation, compression, direct Cloudinary upload

#### 4. `/api/gallery/save-metadata` (POST)

**Purpose**: Save metadata after successful direct uploads
**Authentication**: Required (user session)
**Use**: Called after direct Cloudinary uploads to update database

### URL Storage Endpoints

#### 1. `/api/wedding-pages/hero-image` (POST/DELETE)

**Purpose**: Store/remove hero image URLs
**Validation**: Cloudinary domain + trusted sources

#### 2. `/api/wedding-pages/story-image` (POST/DELETE)

**Purpose**: Store/remove story image URLs
**Validation**: Cloudinary domain + trusted sources

#### 3. `/api/wedding-pages/logo` (POST/DELETE)

**Purpose**: Store/remove logo URLs
**Validation**: Cloudinary domain + trusted sources

## 🛠️ Utility Functions

### Client-Side Utilities

#### `src/lib/signed-upload.ts`

- `uploadWithSignature()`: Direct client-to-Cloudinary upload with signature
- `validateUploadFile()`: Client-side file validation
- `uploadHelpers`: Convenience functions for different upload types

#### `src/hooks/useSignedUpload.ts`

- React hook for handling signed uploads
- Progress tracking, error handling, toast notifications
- Specialized hooks: `useProfileImageUpload`, `useHeroImageUpload`, etc.

#### `src/components/ui/SignedUpload.tsx`

- Reusable upload component with preview
- Drag & drop support, progress indication
- Specialized components: `ProfileImageUpload`, `HeroImageUpload`, etc.

### Server-Side Utilities

#### `src/lib/cloudinary.ts`

- Server-side Cloudinary configuration
- Helper functions for upload and deletion

## 🔒 Security Features

### Authentication

- All upload endpoints require valid user sessions
- User-specific folder isolation
- Plan limit enforcement

### URL Validation

- Cloudinary domain verification
- Trusted source whitelist
- Malicious URL detection

### File Validation

- File type restrictions
- Size limit enforcement
- Content-based validation

## 📊 File Size Limits & Transformations

### Upload Type Limits

| Upload Type | Size Limit | Transformations                | Use Case              |
| ----------- | ---------- | ------------------------------ | --------------------- |
| Profile     | 5MB        | 400x400, face-focused crop     | User avatars          |
| Hero        | 10MB       | 1200x800, optimized crop       | Wedding hero images   |
| Story       | 8MB        | 800x600, optimized crop        | Love story images     |
| Logo        | 2MB        | 200x200, fitted crop           | Wedding logos         |
| General     | 10MB       | Auto-optimization              | General uploads       |
| Gallery     | 50MB\*     | Quality-preserving compression | Wedding photos/videos |

\*Gallery uploads use intelligent compression to stay under 10MB Cloudinary limit

## 🔄 Error Handling

### Common Error Scenarios

1. **File too large**: Clear size limit messages with suggestions
2. **Invalid file type**: Supported format guidance
3. **Authentication failure**: Redirect to login
4. **Cloudinary API errors**: Fallback strategies
5. **Network failures**: Retry mechanisms

### Error Messages

- User-friendly language
- Actionable suggestions
- Tool recommendations for large files

## 🚀 Performance Optimizations

### Compression Strategy

- **Images**: Progressive quality reduction (70% minimum)
- **Videos**: WebM conversion with quality preservation
- **Dimension reduction**: Only when necessary
- **Format optimization**: Auto-format selection

### Upload Optimization

- Direct browser-to-Cloudinary (bypasses server)
- Progress tracking for better UX
- Parallel uploads for multiple files
- Intelligent retry on failure

## 🔍 Monitoring & Analytics

### Upload Tracking

- Success/failure rates by upload type
- File size distribution
- Compression effectiveness
- User adoption metrics

### Error Monitoring

- Upload failure analysis
- Common error patterns
- Performance bottlenecks

## 🧪 Testing

### Test Endpoints

- `/api/test-signed-upload`: Visual test interface for signed uploads
- `/api/cloudinary/test-signature`: Non-authenticated signature generation for testing

### Test Cases

- File size validation
- File type restrictions
- Authentication requirements
- Compression effectiveness
- Error handling

## 📚 Environment Variables

### Required Configuration

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client-side Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## 🔮 Future Enhancements

### Planned Features

1. **Progressive uploads**: Resume interrupted uploads
2. **Batch processing**: Multiple file selection with queue management
3. **Advanced compression**: AI-powered optimization
4. **CDN integration**: Edge-based processing
5. **Analytics dashboard**: Upload performance insights

### Scalability Considerations

- Move to signed uploads for all file types
- Implement upload queues for large files
- Add edge processing for global performance
- Consider WebAssembly for client-side processing

## 📞 Support & Maintenance

### Common Issues

1. **Signature mismatches**: Check environment variables
2. **Upload failures**: Verify Cloudinary configuration
3. **Size limit errors**: Guide users to compression tools
4. **Authentication issues**: Check session validity

### Maintenance Tasks

- Monitor Cloudinary usage quotas
- Update trusted domain lists
- Review and optimize transformations
- Performance monitoring and optimization

---

**Last Updated**: September 2025
**Version**: 2.0
**Status**: Production Ready ✅
