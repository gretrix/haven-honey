# 🚨 URGENT FIXES - January 2026

## Critical Issues Found & Fixes

### 🔴 Issue 1: Video Upload - Database Error

**Error**: `Column 'image_url' cannot be null`

**Root Cause**: The database column `image_url` is NOT NULL, but videos don't have an image URL.

**IMMEDIATE FIX** - Run this SQL command RIGHT NOW:

```bash
mysql -u your_username -p haven_honey < database/hotfix_image_url_nullable.sql
```

Or run this directly in MySQL:
```sql
USE haven_honey;
ALTER TABLE work_photos MODIFY COLUMN image_url VARCHAR(500) NULL;
```

**Test After Fix**:
1. Go to `/admin` → Work Photos
2. Add New → Select "🎥 Video"
3. Upload a video file
4. Should upload successfully

---

### 🔴 Issue 2: Mobile Menu Not Showing

**Problem**: Hamburger icon shows, but clicking it doesn't display menu items

**Debug Steps Added**:
- Console logs added to track menu state
- Z-index increased to z-[200] for backdrop, z-[300] for menu
- Added logs to show when menu is rendering

**How to Debug**:
1. Open website on mobile
2. Open browser console (F12)
3. Click hamburger menu
4. Look for these logs:
   - `🔥 Toggle menu clicked, current state: false`
   - `🔥 New menu state: true`
   - `🔥 Rendering mobile menu panel, links: [...]`

**If you see the logs but no menu**:
- Check if there's a CSS issue overriding the menu
- Check if another element has higher z-index
- Try on different browser

**Rebuild and test**:
```bash
npm run build
pm2 restart haven-honey
```

---

### 🔴 Issue 3: Multiple Images Not Uploading

**Debug Steps Added**:
- Client-side logs to track selected files
- API logs to see what's received
- FormData inspection

**How to Debug**:
1. Go to `/submit-review`
2. Upload 3-5 images
3. Open browser console
4. Submit form
5. Look for these logs:
   - `🔥 Form submit - selectedFiles: 3`
   - `🔥 Appending 3 files to FormData`
   - `🔥 Sending request with FormData`

**On server side**, check PM2 logs:
```bash
pm2 logs haven-honey
```

Look for:
- `🔥 API: Parsing FormData for images...`
- `🔥 API: Checking field "screenshot": Found`
- `🔥 API: Checking field "screenshot_1": Found`
- `🔥 API: Total images received: 3`

---

## 🛠️ Deployment Steps

### 1. Pull Latest Code
```bash
cd /home/ec2-user/haven-honey
git pull origin main
```

### 2. Fix Database Schema
```bash
mysql -u your_username -p haven_honey < database/hotfix_image_url_nullable.sql
```

### 3. Install Dependencies (if needed)
```bash
npm install
```

### 4. Build
```bash
npm run build
```

### 5. Restart Application
```bash
pm2 restart haven-honey
```

### 6. Check Logs
```bash
pm2 logs haven-honey --lines 100
```

---

## 🔍 Debugging Checklist

### Mobile Menu
- [ ] See "🔥 Toggle menu clicked" in console?
- [ ] See "🔥 Rendering mobile menu panel" in console?
- [ ] Menu state changes from false to true?
- [ ] Try different browsers (Chrome, Safari, Firefox)
- [ ] Try in incognito mode
- [ ] Check if any JavaScript errors in console

### Video Upload
- [ ] Database migration applied? (image_url nullable)
- [ ] See upload logs in PM2?
- [ ] File size under 50MB?
- [ ] File type supported (MP4, MOV, WebM)?
- [ ] Check PM2 logs for "🔥 Work Photos API - Received:"
- [ ] Check if video file is being received
- [ ] Check if imageUrl is null and videoUrl has value

### Multiple Images
- [ ] See selectedFiles count in console?
- [ ] See files being appended in console?
- [ ] Check PM2 logs for API receiving images
- [ ] Verify all field names (screenshot, screenshot_1, screenshot_2, etc.)
- [ ] Check if files array is populated correctly

---

## 📝 Console Log Reference

### What You Should See (Mobile Menu)
```
🔥 Toggle menu clicked, current state: false
🔥 New menu state: true
🔥 Rendering mobile menu panel, links: [{href: '/...', label: '...'}, ...]
```

### What You Should See (Multiple Images - Client)
```
🔥 Form submit - selectedFiles: 3 [File, File, File]
🔥 Appending 3 files to FormData
🔥 Appending file 0: screenshot image1.jpg
🔥 Appending file 1: screenshot_1 image2.jpg
🔥 Appending file 2: screenshot_2 image3.jpg
🔥 Sending request with FormData
🔥 Response status: 200
```

### What You Should See (Multiple Images - Server)
```
🔥 API: Parsing FormData for images...
🔥 API: Checking field "screenshot": Found (image1.jpg, 234567 bytes)
🔥 API: Checking field "screenshot_1": Found (image2.jpg, 345678 bytes)
🔥 API: Checking field "screenshot_2": Found (image3.jpg, 456789 bytes)
🔥 API: Checking field "screenshot_3": Not found
🔥 API: Total images received: 3
```

### What You Should See (Video Upload - Server)
```
🔥 Work Photos API - Received:
  - media_type: video
  - category: Meal Prep
  - image: null
  - video: my-video.mp4 (5234567 bytes)
🔥 Uploading video file...
🔥 Video upload result: { success: true, url: '/uploads/work-photos/...' }
🔥 Video uploaded successfully to: /uploads/work-photos/my-video-12345.mp4
🔥 About to insert into database with values:
  - category: Meal Prep
  - mediaType: video
  - caption: My Video
  - description: ...
  - imageUrl: null
  - videoUrl: /uploads/work-photos/my-video-12345.mp4
  - formattedDate: 2026-01-05
  - isPublished: true
  - displayOrder: 0
```

---

## 🚨 If Issues Persist

### Mobile Menu Not Showing
1. Check if Navigation component is imported correctly on all pages
2. Verify framer-motion is installed: `npm list framer-motion`
3. Check for conflicting CSS
4. Try clearing browser cache completely
5. Check if AnimatePresence is working (try removing it temporarily)

### Video Upload Still Failing
1. **VERIFY DATABASE SCHEMA**:
   ```sql
   DESCRIBE work_photos;
   ```
   - Check if `image_url` shows `NULL` in the "Null" column (should be "YES")

2. Check PM2 logs for the exact error
3. Verify video file is under 50MB
4. Try uploading MP4 format specifically

### Multiple Images Still Not Working
1. Check if files are being selected (console log should show)
2. Verify FormData is being created correctly
3. Check API logs to see what's being received
4. Test with just 1 image first
5. Then test with 2 images
6. Then test with 3+ images

---

## 🔧 Quick Tests

### Test 1: Mobile Menu
```bash
# After deployment, test on mobile:
1. Open havenhoney.co on phone
2. Click hamburger icon
3. Menu should slide in from right
4. Should see: Home, Reviews, My Work, Blog, Contact button
```

### Test 2: Video Upload
```bash
# After database fix:
1. Login to admin
2. Work Photos → Add New
3. Select "Video" type
4. Upload small MP4 file
5. Should succeed
6. Check /work page - video should play
```

### Test 3: Multiple Images
```bash
# After deployment:
1. Go to /submit-review
2. Click upload area
3. Select 3 images
4. See 3 previews
5. Remove 1 preview
6. Submit
7. Check admin - should have 2 images
```

---

## 📞 Emergency Contact

If none of this works:
1. Send PM2 logs: `pm2 logs haven-honey --lines 200 > logs.txt`
2. Send browser console screenshot
3. Send database schema: `mysql -u root -p -e "DESCRIBE haven_honey.work_photos;" > schema.txt`

---

## ✅ Success Criteria

You'll know everything is fixed when:
- [ ] Mobile menu slides in when clicking hamburger
- [ ] Video uploads successfully (no database error)
- [ ] Multiple images (3+) upload and display correctly
- [ ] No horizontal scrolling on mobile
- [ ] All console logs show expected behavior

---

**Last Updated**: January 2026
**Status**: DEBUGGING IN PROGRESS

