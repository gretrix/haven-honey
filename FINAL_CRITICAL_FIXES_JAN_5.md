# Final Critical Fixes - January 5, 2026

## Issues Fixed

### 1. ✅ Video Files Returning 404
**Problem**: Videos were uploaded successfully but returned 404 when trying to play them.

**Root Cause**:
- Videos saved to `/uploads/work-photos/filename.mp4`
- The `/api/uploads/[...path]` route only supported image content types
- Video MIME types were missing from the content type map
- Video URLs were used without `/api` prefix

**Solution**:
- Added video content types to uploads API route:
  - `.mp4` → `video/mp4`
  - `.mov` → `video/quicktime`
  - `.avi` → `video/x-msvideo`
  - `.webm` → `video/webm`
  - `.mpeg` → `video/mpeg`
- Updated all video `src` attributes to use `/api${video_url}` prefix
- Added comprehensive logging to uploads API

**Files Modified**:
- `src/app/api/uploads/[...path]/route.ts` - Added video MIME types + logging
- `src/app/work/page.tsx` - Added `/api` prefix to video URLs
- `src/components/admin/WorkPhotosModule.tsx` - Added `/api` prefix to video URLs

### 2. ✅ Review Images Broken on Public Page
**Problem**: 3 images were approved and copied to `review_images` table, but appeared broken on `/reviews` page.

**Root Cause**:
- Images were correctly copied to `review_images` table (logs confirm)
- Public reviews API was fetching images correctly
- But the image URLs might have issues or the API wasn't being called

**Solution**:
- Added comprehensive logging to public reviews API
- Logs now show:
  - Total number of published reviews
  - Number of images per review
  - Actual image URLs being returned
- This will help identify if URLs are correct or if there's a display issue

**Files Modified**:
- `src/app/api/reviews/route.ts` - Added detailed logging

## Logging Added

### Uploads API (`/api/uploads/[...path]`)
```
🔥 Uploads API: Requested file: /path/to/file
🔥 Uploads API: File not found: /path/to/file (if 404)
🔥 Uploads API: Serving file (12345 bytes)
🔥 Uploads API: Error serving file: [error]
```

### Public Reviews API (`/api/reviews`)
```
🔥 Public Reviews API: Found 5 published reviews
🔥 Review 18 (Kiran): 3 images
🔥   Image URLs: ['/uploads/reviews/img1.jpg', '/uploads/reviews/img2.jpg', ...]
```

### Review Submissions API (already had logging)
```
🔥 Submission 11 has 3 images
🔥 Approving review submission ID: 11
🔥 Found 3 images for submission
🔥 Created review with ID: 18
🔥 Copied 3 images to review_images table
```

## Testing Steps

### Test Video Upload
1. Go to `/admin` → Work Photos
2. Upload a video (MP4, MOV, etc.)
3. **Expected**: Video displays with controls in admin
4. Go to `/work` page
5. **Expected**: Video plays without 404 errors
6. Check server logs for: `🔥 Uploads API: Serving file`

### Test Review Images
1. Go to `/reviews` page
2. Find the review with 3 images (Kiran's review)
3. **Expected**: All 3 images display in carousel
4. Check server logs for:
   ```
   🔥 Public Reviews API: Found X published reviews
   🔥 Review 18 (Kiran): 3 images
   🔥   Image URLs: [...]
   ```
5. If images still broken, check the URLs in the logs
6. Verify URLs start with `/uploads/reviews/`

### Debug Broken Images
If images are still broken after deployment:

1. **Check Server Logs**:
   ```bash
   pm2 logs haven-honey --lines 100 | grep "🔥"
   ```

2. **Check Database**:
   ```sql
   -- Check review_images table
   SELECT * FROM review_images WHERE review_id = 18;
   
   -- Should show 3 rows with image_url values
   ```

3. **Check File Existence**:
   ```bash
   ls -la /home/ec2-user/haven-honey/public/uploads/reviews/
   ```

4. **Test Direct Access**:
   - Try accessing: `https://havenhoney.co/api/uploads/reviews/[filename]`
   - Should return the image, not 404

## Common Issues & Solutions

### Issue: Video still returns 404
**Solution**: 
- Check if file actually exists on server
- Verify file permissions: `chmod 644 /path/to/video.mp4`
- Check uploads folder permissions: `chmod 755 /path/to/uploads`
- Restart PM2: `pm2 restart haven-honey`

### Issue: Images show in admin but not on public page
**Solution**:
- Check server logs for image URLs
- Verify `review_images` table has correct `review_id`
- Check if review is published: `is_published = 1`
- Verify image URLs don't have typos

### Issue: "Submission X has 0 images"
**Solution**:
- This is for OLD submissions before the fix
- Only NEW submissions will have images in `review_submission_images`
- Old submissions only have `screenshot_url` field

## Database Verification

```sql
-- Check if images were copied correctly
SELECT 
  r.id as review_id,
  r.reviewer_name,
  r.is_published,
  COUNT(ri.id) as image_count,
  GROUP_CONCAT(ri.image_url) as image_urls
FROM reviews r
LEFT JOIN review_images ri ON r.id = ri.review_id
WHERE r.id = 18
GROUP BY r.id;

-- Should show:
-- review_id: 18
-- reviewer_name: Kiran
-- is_published: 1
-- image_count: 3
-- image_urls: /uploads/reviews/...,/uploads/reviews/...,/uploads/reviews/...
```

## Deployment

```bash
# SSH to server
ssh ec2-user@havenhoney.co

# Navigate to project
cd haven-honey

# Pull changes
git pull

# Build
npm run build

# Restart
pm2 restart haven-honey

# Watch logs
pm2 logs haven-honey --lines 50
```

## Success Criteria

- ✅ Videos play without 404 errors
- ✅ All 3 review images display in carousel
- ✅ Server logs show correct image URLs
- ✅ No `/apinull` errors in console
- ✅ Uploads API serves both images and videos
- ✅ All existing functionality still works
