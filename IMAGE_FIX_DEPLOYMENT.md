# 🖼️ Image Loading Fix - Deployment Guide

## ✅ What Was Fixed

**Problem:** Uploaded images (blog, reviews, work photos) weren't showing immediately after upload. Required `pm2 restart` to see them.

**Root Cause:** Next.js caches the `/public` folder at build time. New files added after build aren't recognized until restart.

**Solution:** Changed all image URLs to use the `/api/uploads/` API route instead of direct static file access. This bypasses Next.js static file caching.

---

## 🚀 Deploy to Production (EC2)

### Step 1: SSH into Your Server

```bash
ssh -i "your-key.pem" ec2-user@your-ec2-ip
```

### Step 2: Navigate to Project

```bash
cd /home/ec2-user/haven-honey
```

### Step 3: Pull Latest Changes

```bash
git pull origin main
```

You should see:
```
Updating 31383c4..2536051
Fast-forward
 src/app/life-with-linda/[slug]/page.tsx | 2 +-
 src/app/life-with-linda/page.tsx        | 2 +-
 src/app/reviews/page.tsx                | 4 ++--
 src/app/work/page.tsx                   | 4 ++--
 4 files changed, 6 insertions(+), 6 deletions(-)
```

### Step 4: Install Dependencies (if needed)

```bash
npm install
```

### Step 5: Build the Application

```bash
npm run build
```

Wait for build to complete (should take 30-60 seconds).

### Step 6: Restart PM2

```bash
pm2 restart haven-honey
```

### Step 7: Verify

```bash
pm2 logs haven-honey --lines 50
```

Look for:
- ✅ No errors
- ✅ Server running on port 3000

---

## 🧪 Test the Fix

### Test 1: Upload a New Review
1. Go to `https://havenhoney.co/admin`
2. Login with password
3. Click **Reviews** tab
4. Click **"+ New Review"**
5. Upload a screenshot
6. Fill in details
7. Check **"Published"**
8. Click **"Create Review"**
9. Go to `https://havenhoney.co/reviews`
10. **✅ Image should appear immediately!** (No restart needed)

### Test 2: Upload a New Blog Post
1. Go to `https://havenhoney.co/admin`
2. Click **Blog** tab
3. Click **"✏️ New Blog Post"**
4. Add title and content
5. Upload featured image
6. Set status to **"Published"**
7. Click **"Create Post"**
8. Go to `https://havenhoney.co/life-with-linda`
9. **✅ Image should appear immediately!**

### Test 3: Upload Work Photo
1. Go to `https://havenhoney.co/admin`
2. Click **Work Photos** tab
3. Click **"+ New Work Photo"**
4. Upload image
5. Fill in details
6. Check **"Published"**
7. Click **"Create Work Photo"**
8. Go to `https://havenhoney.co/work`
9. **✅ Image should appear immediately!**

---

## 🔍 How It Works Now

### Before (Broken):
```
Upload image → Saved to /public/uploads/blog/image.jpg
Frontend requests → /uploads/blog/image.jpg
Next.js → "File not in cache, 404"
After PM2 restart → Next.js re-scans public folder → Image appears ✅
```

### After (Fixed):
```
Upload image → Saved to /public/uploads/blog/image.jpg
Frontend requests → /api/uploads/blog/image.jpg
API route → Reads file from disk directly → Returns image ✅
No restart needed! 🎉
```

---

## 📝 Technical Details

### Changed Files:
1. `src/app/reviews/page.tsx` - Reviews page
2. `src/app/work/page.tsx` - Work photos page
3. `src/app/life-with-linda/page.tsx` - Blog listing
4. `src/app/life-with-linda/[slug]/page.tsx` - Individual blog post

### What Changed:
```tsx
// BEFORE (broken)
<img src={review.screenshot_url} />
// Example: /uploads/reviews/image.jpg

// AFTER (fixed)
<img src={`/api${review.screenshot_url}`} />
// Example: /api/uploads/reviews/image.jpg
```

### API Route (Already Existed):
`src/app/api/uploads/[...path]/route.ts`

This route:
- Reads files directly from disk
- Returns proper content-type headers
- Adds cache headers for performance
- Works with any file in `/public/uploads/`

---

## 🎯 Benefits

✅ **Instant image display** - No restart needed  
✅ **Better UX** - Linda can see images immediately after upload  
✅ **No caching issues** - API route always reads fresh from disk  
✅ **Performance** - Still cached by browser (31536000 seconds = 1 year)  
✅ **Backward compatible** - Old images still work  

---

## 🐛 Troubleshooting

### Images Still Not Showing?

**1. Check if file was uploaded:**
```bash
ls -la /home/ec2-user/haven-honey/public/uploads/reviews/
ls -la /home/ec2-user/haven-honey/public/uploads/work-photos/
ls -la /home/ec2-user/haven-honey/public/uploads/blog/
```

**2. Check file permissions:**
```bash
chmod 755 /home/ec2-user/haven-honey/public/uploads/
chmod 644 /home/ec2-user/haven-honey/public/uploads/**/*
```

**3. Check PM2 logs:**
```bash
pm2 logs haven-honey --err --lines 100
```

**4. Check Nginx logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**5. Test API route directly:**
```bash
curl https://havenhoney.co/api/uploads/reviews/test-image.jpg
```

Should return image data or 404 if file doesn't exist.

---

## 🔄 Rollback (If Needed)

If something goes wrong:

```bash
cd /home/ec2-user/haven-honey
git reset --hard 31383c4
npm run build
pm2 restart haven-honey
```

This reverts to the previous version (before the fix).

---

## ✅ Deployment Checklist

- [ ] SSH into EC2 server
- [ ] Navigate to project directory
- [ ] Pull latest changes (`git pull origin main`)
- [ ] Install dependencies (`npm install`)
- [ ] Build application (`npm run build`)
- [ ] Restart PM2 (`pm2 restart haven-honey`)
- [ ] Check logs (`pm2 logs haven-honey`)
- [ ] Test review upload
- [ ] Test blog post upload
- [ ] Test work photo upload
- [ ] Verify images appear immediately
- [ ] Check browser console for errors
- [ ] Test on mobile device

---

## 📞 Support

If you encounter issues:

1. Check PM2 logs: `pm2 logs haven-honey`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify file permissions in `/public/uploads/`
4. Test API route directly with curl
5. Check browser console for 404 errors

---

**Deployed by:** Kiro AI  
**Date:** December 19, 2024  
**Commit:** 2536051  
**Status:** ✅ Ready for Production
