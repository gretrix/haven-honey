# Haven & Honey Admin Portal 2.0 - Testing Guide

## 🎯 Overview

This guide will help you test all the new features added to the Haven & Honey Admin Portal.

## 📋 Pre-Testing Setup

### 1. Update Database Schema

Run the database initialization script to add the new tables:

```bash
mysql -u haven_app -p haven_honey < database/init.sql
```

Or manually run the SQL commands in `database/init.sql` starting from line 55 (the new tables section).

### 2. Start the Development Server

```bash
npm run dev
```

The site should be running at `http://localhost:3000`

### 3. Admin Password

The admin password is set in your `.env.local` file:
```
ADMIN_PASSWORD=Maverick1!
```

---

## ✅ TESTING CHECKLIST

### 🔐 PART 1: Admin Portal Access

- [ ] **Login**
  - Go to `/admin`
  - Enter password: `Maverick1!`
  - Should see tabbed dashboard with: CRM/Contacts, Reviews, Work Photos

- [ ] **Logout**
  - Click "Logout" button
  - Should return to login screen
  - Password should be cleared

---

### 📇 PART 2: CRM / Contacts Module

#### View Contacts
- [ ] Click "CRM / Contacts" tab
- [ ] See list of existing contact form submissions
- [ ] Filter by: All, New, Read, Responded
- [ ] Verify counts are correct

#### Individual Email Feature (NEW)
- [ ] Click "📧 Email" button on any contact
- [ ] Modal opens with contact's name and email
- [ ] Enter subject: "Test from Haven & Honey"
- [ ] Enter message: "Hi [Name], this is a test email!"
- [ ] Click "Send Email"
- [ ] Check that email was received (check your test email)
- [ ] Email should be formatted with Haven & Honey branding
- [ ] **Email History** section should show the sent email

#### Delete Contact Feature (NEW)
- [ ] Click "🗑️ Delete" button on any contact
- [ ] Confirmation dialog appears
- [ ] Type "DELETE" to confirm
- [ ] Contact is removed from list (soft deleted)
- [ ] Contact should NOT appear in main list anymore

#### Mass Email (Existing Feature - Should Still Work)
- [ ] Select multiple contacts with checkboxes
- [ ] Click "📧 Mass Email"
- [ ] Enter subject and message
- [ ] Send to selected contacts
- [ ] Verify emails are received

#### Export CSV (Existing Feature - Should Still Work)
- [ ] Click "📥 Export CSV"
- [ ] CSV file downloads
- [ ] Open in Excel/Google Sheets - verify data is correct

---

### ⭐ PART 3: Reviews Module

#### Add Review
- [ ] Click "⭐ Reviews" tab
- [ ] Click "➕ Add Review"
- [ ] Fill in form:
  - Upload a screenshot (PNG/JPG, max 10MB)
  - Reviewer Name: "M.K."
  - Date: (select any date)
  - Star Rating: 5
  - Review Text: "Linda is amazing!"
  - Category/Tag: "Meal Prep"
  - Display Order: 0
  - Check "Published" checkbox
  - Check "Featured" checkbox (optional)
- [ ] Click "Add Review"
- [ ] Success message appears
- [ ] Review appears in the grid

#### Edit Review
- [ ] Click "Edit" button on any review
- [ ] Modal opens with existing data
- [ ] Change something (e.g., star rating to 4)
- [ ] Click "Update Review"
- [ ] Changes are saved and visible

#### Publish/Unpublish Review
- [ ] Click "Unpublish" button on a published review
- [ ] Status changes to "Draft"
- [ ] Click "Publish" button
- [ ] Status changes to "✓ Published"

#### Delete Review
- [ ] Click "Delete" button on any review
- [ ] Confirmation dialog appears
- [ ] Confirm deletion
- [ ] Review is removed
- [ ] Image file is deleted from server

#### View Public Reviews Page
- [ ] Open new tab: `/reviews`
- [ ] See all published reviews displayed in framed cards
- [ ] Filter by category (Meal Prep, Cleaning, etc.)
- [ ] Click on a review card
- [ ] Lightbox modal opens with enlarged screenshot
- [ ] Close button works
- [ ] Click outside modal to close

---

### 📸 PART 4: Work Photos Module

#### Add Work Photo
- [ ] Click "📸 Work Photos" tab
- [ ] Click "➕ Add Photo"
- [ ] Fill in form:
  - Upload an image (PNG/JPG, max 10MB)
  - Category: "Meal Prep" (or any other)
  - Caption: "Fresh meal prep for the week"
  - Description: "Healthy meals prepared with love"
  - Photo Date: (select any date)
  - Display Order: 0
  - Check "Published" checkbox
- [ ] Click "Add Photo"
- [ ] Success message appears
- [ ] Photo appears in the grid

#### Edit Work Photo
- [ ] Click "Edit" button on any photo
- [ ] Modal opens with existing data
- [ ] Change caption or description
- [ ] Click "Update Photo"
- [ ] Changes are saved

#### Filter by Category
- [ ] Click different category filter buttons
- [ ] Grid updates to show only photos from that category

#### Publish/Unpublish Photo
- [ ] Click "Unpublish" button on a published photo
- [ ] Status changes to "Draft"
- [ ] Won't appear on public page

#### Delete Work Photo
- [ ] Click "Delete" button on any photo
- [ ] Confirmation dialog appears
- [ ] Confirm deletion
- [ ] Photo is removed
- [ ] Image file is deleted from server

#### View Public Work Page
- [ ] Open new tab: `/work`
- [ ] See all published work photos in gallery
- [ ] Filter by category buttons work
- [ ] Click on a photo
- [ ] Lightbox modal opens with photo details
- [ ] Close button works
- [ ] Click outside modal to close

---

### 🏠 PART 5: Public Website Integration

#### Homepage Navigation
- [ ] Go to homepage (`/`)
- [ ] Navigation bar has new links: "Reviews" and "Work"
- [ ] Click "Reviews" - goes to `/reviews`
- [ ] Click "Work" - goes to `/work`
- [ ] Click "Home" or logo - returns to homepage

#### Reviews Page Public View
- [ ] Reviews displayed in beautiful framed cards
- [ ] Featured reviews have ⭐ badge
- [ ] Star ratings visible
- [ ] Review text shows (if provided)
- [ ] Filter by category works
- [ ] Lightbox functionality works
- [ ] Responsive on mobile

#### Work Page Public View
- [ ] Work photos displayed in grid
- [ ] Category filters work
- [ ] Hover effects work
- [ ] Lightbox shows photo details
- [ ] Responsive on mobile

---

### 🔒 PART 6: Security & Audit Testing

#### File Upload Security
- [ ] Try uploading non-image file (e.g., .txt, .pdf)
- [ ] Should get error: "Invalid file type"
- [ ] Try uploading very large file (>10MB)
- [ ] Should get error: "File too large"

#### Authentication
- [ ] Go to `/api/admin/reviews` directly in browser
- [ ] Should get "Unauthorized" error
- [ ] All admin API routes require authentication

#### Audit Logs (Database Check)
- [ ] Run SQL query: `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;`
- [ ] Should see logs for:
  - Review created
  - Review updated
  - Review deleted
  - Work photo created
  - Work photo updated
  - Work photo deleted
  - Email sent
  - Contact deleted

#### Email History (Database Check)
- [ ] Run SQL query: `SELECT * FROM email_history ORDER BY sent_at DESC LIMIT 5;`
- [ ] Should see logs of individual emails sent
- [ ] Check status (sent/failed)

---

## 🐛 Common Issues & Solutions

### Issue: Database tables not found
**Solution:** Run the `database/init.sql` script to create new tables

### Issue: File upload fails
**Solution:** 
- Check file size (must be < 10MB)
- Check file type (must be image: JPG, PNG, WEBP, GIF)
- Ensure `public/uploads` directory exists and is writable

### Issue: Emails not sending
**Solution:**
- Check `.env.local` file has correct SMTP credentials
- Test with Gmail App Password (not regular password)
- Check spam folder

### Issue: Images not displaying
**Solution:**
- Check that images were uploaded to `public/uploads/reviews/` or `public/uploads/work-photos/`
- Check browser console for 404 errors
- Verify image URLs in database

### Issue: Admin password not working
**Solution:**
- Check `.env.local` has `ADMIN_PASSWORD=Maverick1!`
- Clear browser localStorage: `localStorage.clear()`
- Try logging in again

---

## 📊 Database Verification Queries

### Check Reviews
```sql
SELECT id, reviewer_name, tag, is_published, is_featured, created_at 
FROM reviews 
ORDER BY created_at DESC;
```

### Check Work Photos
```sql
SELECT id, category, caption, is_published, created_at 
FROM work_photos 
ORDER BY created_at DESC;
```

### Check Contact Submissions (excluding deleted)
```sql
SELECT id, name, email, status, deleted_at 
FROM contact_submissions 
WHERE deleted_at IS NULL 
ORDER BY created_at DESC;
```

### Check Audit Logs
```sql
SELECT action_type, entity_type, entity_id, details, created_at 
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 20;
```

### Check Email History
```sql
SELECT eh.*, cs.name, cs.email 
FROM email_history eh 
JOIN contact_submissions cs ON eh.contact_id = cs.id 
ORDER BY eh.sent_at DESC 
LIMIT 10;
```

---

## 🎨 Visual Testing Checklist

### Reviews Page
- [ ] Framed cards look professional
- [ ] Hover effects work smoothly
- [ ] Featured badge visible and styled correctly
- [ ] Star ratings display properly
- [ ] Lightbox modal is centered and responsive
- [ ] Colors match Haven & Honey brand (brown, sage, honey, cream)

### Work Photos Page
- [ ] Gallery grid is visually balanced
- [ ] Images maintain aspect ratio
- [ ] Category filters are clear and usable
- [ ] Lightbox shows photo details elegantly
- [ ] Responsive on tablet and mobile

### Admin Dashboard
- [ ] Tabs are clearly labeled and easy to switch
- [ ] Forms are well-organized and intuitive
- [ ] Upload buttons are prominent
- [ ] Success/error messages are visible
- [ ] Loading states show when appropriate

---

## 🚀 Performance Testing

- [ ] Reviews page loads in < 2 seconds
- [ ] Work page loads in < 2 seconds
- [ ] Image uploads complete in < 5 seconds
- [ ] No console errors in browser
- [ ] No memory leaks (check browser dev tools)

---

## ✅ Final Sign-Off

Once all tests pass:
- [ ] All features work as expected
- [ ] No console errors
- [ ] Database queries work
- [ ] Emails send successfully
- [ ] Public pages look beautiful
- [ ] Admin portal is intuitive
- [ ] Security measures in place
- [ ] Audit logs are being created

---

## 🎉 Success!

If all checkboxes are ticked, the Admin Portal 2.0 is ready for production!

### Next Steps:
1. Deploy to production server
2. Update Linda with admin credentials
3. Provide her with this testing guide
4. Monitor audit logs for first week
5. Gather feedback for future improvements

---

## 📞 Support

If you encounter any issues during testing, check:
1. Browser console for JavaScript errors
2. Terminal for server-side errors
3. MySQL error logs
4. Network tab in dev tools for failed API requests

