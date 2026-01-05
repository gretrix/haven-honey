# Deploy Fixes - Quick Guide

## What Was Fixed
1. ✅ Multiple review images now show correctly (was only showing 1 of 3)
2. ✅ Video uploads now display properly in admin and public pages
3. ✅ Fixed `/apinull` 404 errors from broken image URLs
4. ✅ Added comprehensive logging for debugging

## Files Changed
- `src/app/api/admin/review-submissions/route.ts` - Fixed image copying on approval
- `src/components/admin/ReviewSubmissionsModule.tsx` - Display all images
- `src/app/work/page.tsx` - Added video error logging
- `src/components/admin/WorkPhotosModule.tsx` - Display videos properly

## Deploy Steps

### Option 1: Quick Deploy (Recommended)
```bash
# Pull latest changes
git pull

# Install dependencies (if needed)
npm install

# Build production
npm run build

# Restart PM2
pm2 restart haven-honey
```

### Option 2: Manual Deploy
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

# Check logs
pm2 logs haven-honey --lines 50
```

## Verify Fixes

### 1. Test Multiple Images
1. Go to admin → Review Submissions
2. Find the submission with 3 images (from Kiran)
3. Click "View Details"
4. **Expected**: See all 3 images in a grid
5. Click "Approve"
6. Go to public /reviews page
7. **Expected**: See all 3 images in carousel

### 2. Test Video Upload
1. Go to admin → Work Photos
2. Find the video upload (Snapchat-584190557.mp4)
3. **Expected**: Video plays with controls
4. Go to public /work page
5. **Expected**: Video displays and plays

### 3. Check Console
1. Open browser console (F12)
2. Navigate through admin and public pages
3. **Expected**: No `/apinull` 404 errors
4. **Expected**: See 🔥 emoji logs for debugging

## Rollback Plan (If Needed)
```bash
# Revert to previous commit
git log --oneline  # Find previous commit hash
git reset --hard <previous-commit-hash>
npm run build
pm2 restart haven-honey
```

## Database Check (Optional)
```sql
-- Check if images are in review_images table
SELECT r.id, r.reviewer_name, COUNT(ri.id) as image_count
FROM reviews r
LEFT JOIN review_images ri ON r.id = ri.review_id
GROUP BY r.id
ORDER BY r.created_at DESC
LIMIT 10;

-- Check submission images
SELECT rs.id, rs.reviewer_name, COUNT(rsi.id) as image_count
FROM review_submissions rs
LEFT JOIN review_submission_images rsi ON rs.id = rsi.submission_id
GROUP BY rs.id
ORDER BY rs.created_at DESC
LIMIT 10;
```

## Monitoring
After deployment, monitor:
- PM2 logs: `pm2 logs haven-honey`
- Browser console for errors
- Test review submission with multiple images
- Test video upload and playback

## Support
If issues occur:
1. Check PM2 logs: `pm2 logs haven-honey --lines 100`
2. Check browser console for errors
3. Verify database tables exist (see SQL above)
4. Check file permissions on `/uploads` folder
