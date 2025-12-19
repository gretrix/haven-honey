# 🔧 Fixing Broken Images on EC2 Production

## The Problem
Images are being uploaded to the database, but they're not displaying on the website. The paths are correct (e.g., `/uploads/reviews/filename.jpg`), but the images return 404 errors.

## The Solution
The issue is **file permissions** on your EC2 server. The `public/uploads` directory needs proper permissions so Next.js can serve the files.

---

## Step-by-Step Fix on EC2

### 1. SSH into your EC2 server
```bash
ssh ec2-user@your-server-ip
cd /path/to/haven-honey
```

### 2. Check if the uploads directories exist
```bash
ls -la public/uploads/
```

You should see:
- `reviews/`
- `work-photos/`

If they don't exist, create them:
```bash
mkdir -p public/uploads/reviews
mkdir -p public/uploads/work-photos
```

### 3. Set proper permissions
```bash
# Make sure the directories are writable
chmod 755 public/uploads
chmod 755 public/uploads/reviews
chmod 755 public/uploads/work-photos

# Make sure your app user owns the directories
sudo chown -R ec2-user:ec2-user public/uploads
```

### 4. Check if files were uploaded
```bash
ls -la public/uploads/reviews/
ls -la public/uploads/work-photos/
```

If the directories are empty, the uploads didn't work. If they have files, but images still don't show, continue:

### 5. Fix file permissions for existing images
```bash
# Make all uploaded files readable
chmod 644 public/uploads/reviews/*
chmod 644 public/uploads/work-photos/*
```

### 6. Restart your Next.js app
```bash
# If using PM2
pm2 restart haven-honey

# If using systemd
sudo systemctl restart haven-honey

# Or manually
npm run build
pm2 restart all
```

### 7. Test the fix
Go to your website and:
1. Upload a new review with an image
2. Check if it displays on `/reviews`
3. Check if the file exists:
   ```bash
   ls -la public/uploads/reviews/
   ```

---

## Alternative: Use Next.js Static File Serving

If the above doesn't work, Next.js might not be serving the `public` folder correctly in production. Try this:

### Check your next.config.js
```bash
cat next.config.js
```

It should look like:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this if it's not there:
  output: 'standalone',
  
  // Or remove 'output' if you want full server mode
}

module.exports = nextConfig
```

If you changed this, rebuild:
```bash
npm run build
pm2 restart all
```

---

## Debugging: Check if files are actually being uploaded

### 1. Try uploading a review in the admin panel
Go to `/admin` → Reviews → Add Review → Upload an image

### 2. Immediately check EC2:
```bash
ls -la public/uploads/reviews/
```

**If the file appears:** Permissions issue (follow steps 3-6 above)  
**If no file appears:** Upload code isn't working in production

---

## If uploads aren't working at all:

### Check Node.js permissions
```bash
# Check what user is running your Node app
ps aux | grep node

# Make sure that user can write to public/uploads
sudo chown -R $(whoami):$(whoami) public/uploads
```

### Check disk space
```bash
df -h
```

If disk is full, clean up:
```bash
# Clean npm cache
npm cache clean --force

# Clean old logs if using PM2
pm2 flush
```

---

## Quick Test Command

Run this all at once on EC2:
```bash
cd /path/to/haven-honey && \
mkdir -p public/uploads/reviews public/uploads/work-photos && \
chmod 755 public/uploads && \
chmod 755 public/uploads/reviews && \
chmod 755 public/uploads/work-photos && \
sudo chown -R ec2-user:ec2-user public/uploads && \
pm2 restart all && \
echo "✅ Permissions fixed! Try uploading now."
```

---

## Verify the Fix

After running the commands:

1. **Upload a test image** in admin panel
2. **Check database:**
   ```bash
   mysql -u haven_app -p haven_honey -e "SELECT screenshot_url FROM reviews ORDER BY created_at DESC LIMIT 1;"
   ```
3. **Check if file exists:**
   ```bash
   ls -la public/uploads/reviews/
   ```
4. **Visit the public page:**
   Go to `https://havenhoney.co/reviews`
5. **Check browser console:**
   Press F12 → Network tab → See if image returns 200 (success) or 404 (not found)

---

## Still Not Working?

### Check Next.js is serving static files:
```bash
# Test direct file access
curl https://havenhoney.co/images/haven-honey-logo-circle-transparent.png
```

If this works, but `/uploads/` doesn't, you may need to configure your **nginx** or **reverse proxy** to serve the uploads folder.

### Nginx Configuration (if you're using nginx):
Add this to your nginx config:
```nginx
location /uploads {
    alias /path/to/haven-honey/public/uploads;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

Then reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Summary Checklist

- [ ] Created `public/uploads/reviews` and `public/uploads/work-photos` directories
- [ ] Set permissions: `chmod 755 public/uploads/*`
- [ ] Set ownership: `chown -R ec2-user:ec2-user public/uploads`
- [ ] Restarted Next.js app
- [ ] Tested upload in admin panel
- [ ] Verified file appears in directory
- [ ] Checked image displays on public page
- [ ] No 404 errors in browser console

---

**Once images are working, you're all set! ✅**


