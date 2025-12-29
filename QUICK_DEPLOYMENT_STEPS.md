# ⚡ Quick Deployment Steps - DO THIS NOW

## 🚀 On Your EC2 Server (Run These Commands):

```bash
# 1. Go to project folder
cd /path/to/haven-honey

# 2. Pull latest code
git pull origin main

# 3. Fix image permissions (THIS FIXES BROKEN IMAGES!)
mkdir -p public/uploads/blog
chmod 755 public/uploads public/uploads/reviews public/uploads/work-photos public/uploads/blog
sudo chown -R ec2-user:ec2-user public/uploads
find public/uploads -type f -exec chmod 644 {} \;

# 4. Add blog tables to database
mysql -u haven_app -p haven_honey < database/blog_tables.sql
# Password: Test@123

# 5. Install dependencies (if any new)
npm install

# 6. Rebuild app
npm run build

# 7. Restart
pm2 restart all

# 8. Check logs
pm2 logs --lines 20
```

## ✅ Test These After Deployment:

1. **Test Broken Images Fix:**
   - Go to `/admin` → Reviews → Upload a test image
   - Visit `/reviews` - image should display now! ✓

2. **Test Blog:**
   - Go to `/admin` → Blog tab
   - Click "New Blog Post"
   - Write test post, upload featured image
   - Click "Publish"
   - Visit `/life-with-linda` - see your post
   - Click the post - view individual page
   - Click Facebook share button - should open Facebook

3. **Test UI Improvements:**
   - Open Reviews modal - file upload button should look pretty now
   - Checkboxes should have colored backgrounds

## 📋 Quick Checklist:

- [ ] Pulled latest code
- [ ] Fixed image permissions
- [ ] Ran database migration (blog_tables.sql)
- [ ] Rebuilt app
- [ ] Restarted PM2
- [ ] Tested image uploads (Reviews/Work Photos)
- [ ] Tested blog creation
- [ ] Tested blog public page
- [ ] Tested Facebook share button
- [ ] Checked UI looks good

## 🎯 What You Fixed Today:

1. ✅ **Metadata warning** - Gone
2. ✅ **File upload UI** - Now beautiful with dashed borders & icons
3. ✅ **Checkbox UI** - Now professional with colors & descriptions
4. ✅ **Broken images** - Will be fixed after permissions fix
5. ✅ **Built entire blog system** - Linda can now post daily!

## 📄 Important Files:

- `EC2_IMAGE_FIX.md` - Full image fix guide
- `LINDA_BLOG_GUIDE.md` - Give this to Linda!
- `DEPLOYMENT_SUMMARY_DEC_2025.md` - Technical summary
- `database/blog_tables.sql` - Blog database schema

## 🎉 You're Done When:

- Images show up on `/reviews` and `/work`
- Blog shows up in admin at `/admin` → Blog tab
- Blog listing works at `/life-with-linda`
- Blog posts can be created & published
- Facebook share buttons work
- File upload buttons look pretty
- Checkboxes look professional

---

**That's it! You're ready to show Linda her new blog!** 🚀




