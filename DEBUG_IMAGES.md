# 🔍 Debug Broken Images - Step by Step

## Run These Commands on EC2 to Debug:

### 1. Check if files physically exist on disk:
```bash
cd /home/ec2-user/haven-honey

# Check blog image from database
ls -lah public/uploads/blog/Picsart-24-02-12-01-44-43-108-1766089348226-n8q9bu.jpg

# List all uploads
echo "=== Reviews ==="
ls -lah public/uploads/reviews/
echo "=== Work Photos ==="
ls -lah public/uploads/work-photos/
echo "=== Blog ==="
ls -lah public/uploads/blog/
```

### 2. Check directory permissions:
```bash
ls -lah public/ | grep uploads
```

**Should show:**
```
drwxr-xr-x  5 ec2-user ec2-user  4096 Dec 18 20:22 uploads
```

### 3. Check file permissions:
```bash
ls -lah public/uploads/blog/
```

**Should show:**
```
-rw-r--r-- 1 ec2-user ec2-user 123456 Dec 18 20:22 Picsart-....jpg
```

### 4. Test if Next.js can read the file:
```bash
# Test direct file access
curl http://localhost:3000/uploads/blog/Picsart-24-02-12-01-44-43-108-1766089348226-n8q9bu.jpg -I
```

**Should return:** `HTTP/1.1 200 OK` or similar

**If returns 404:** Next.js isn't serving the files

### 5. Check PM2 process working directory:
```bash
pm2 describe haven-honey | grep cwd
```

**Should show:** `/home/ec2-user/haven-honey` or similar

---

## Quick Fixes:

### Fix 1: Files Don't Exist
If `ls` shows "No such file or directory":
```bash
# Files aren't being created - check Node.js can write
sudo chown -R ec2-user:ec2-user /home/ec2-user/haven-honey/public/uploads
chmod 755 public/uploads public/uploads/*
```

### Fix 2: Files Exist But Can't Be Read
If `ls` shows files but curl returns 404:
```bash
# Fix permissions
chmod 644 public/uploads/reviews/* public/uploads/work-photos/* public/uploads/blog/*
```

### Fix 3: Wrong Working Directory
If PM2 is running from wrong directory:
```bash
# Restart with correct directory
pm2 delete haven-honey
cd /home/ec2-user/haven-honey
pm2 start npm --name "haven-honey" -- start
pm2 save
```

---

## The Real Fix (Run All These):

```bash
cd /home/ec2-user/haven-honey

# 1. Create directories
mkdir -p public/uploads/reviews public/uploads/work-photos public/uploads/blog

# 2. Fix ownership
sudo chown -R ec2-user:ec2-user public/uploads

# 3. Fix permissions
chmod 755 public/uploads public/uploads/*
find public/uploads -type f -exec chmod 644 {} \;

# 4. Pull latest code (has image serving API fix)
git pull origin main

# 5. Rebuild
npm run build

# 6. Restart
pm2 restart haven-honey

# 7. Test
curl -I http://localhost:3000/uploads/blog/Picsart-24-02-12-01-44-43-108-1766089348226-n8q9bu.jpg
```

---

## After Running Fixes:

1. **Upload a NEW test image** in admin (old ones might be cached)
2. **Open browser DevTools** (F12) → Network tab
3. **Go to /reviews** or /blog page
4. **Check if images return 200 or 404**

If 404:
- Image isn't on disk
- OR Next.js can't find it
- OR permissions are wrong

If 200 but still broken:
- Browser cache issue - hard refresh (Ctrl+Shift+R)

---

## What I Fixed in the Code:

1. ✅ **Blog update error** - Empty `scheduled_for` now converts to NULL
2. ✅ **Added API route** - `/api/uploads/[...path]/route.ts` serves images directly
3. ✅ **This bypasses** Next.js static file serving issues in production

## After Deployment:

Images should work via BOTH:
- `/uploads/blog/image.jpg` (static)
- `/api/uploads/blog/image.jpg` (API - more reliable in production)

If static still fails, update all image URLs to use `/api/uploads/...` instead of `/uploads/...`

---

## Still Not Working?

Check logs:
```bash
pm2 logs haven-honey --lines 50
```

Look for upload errors or file write failures.



