# Email Image Upload Fix - December 29, 2025

## Problem
Images uploaded in emails (both mass and individual) were not showing in received emails. The images appeared broken in Gmail and other email clients.

## Root Cause
The images were being embedded as **base64 data URLs** directly in the HTML (`<img src="data:image/jpeg;base64,...">`). Most email clients (especially Gmail) **block or strip base64-encoded images** for security reasons.

## Solution
Changed the implementation to use **CID (Content-ID) attachments**:
- Images are now attached to the email as proper attachments
- The HTML references the image using `cid:emailImage` instead of the base64 data URL
- This is the standard, email-client-friendly way to embed images

## Files Changed
1. `src/lib/email.ts` - Updated `sendMassEmail()` function
2. `src/app/api/admin/send-email/route.ts` - Updated individual email sending
3. `src/app/api/admin/mass-email/route.ts` - Minor update for null handling

## Technical Details
The fix extracts the base64 data from the data URL and creates a proper email attachment:
```javascript
mailOptions.attachments = [
  {
    filename: 'image.jpg',
    content: base64Data,
    encoding: 'base64',
    cid: 'emailImage', // Referenced in HTML as cid:emailImage
    contentType: mimeType,
  },
]
```

## Deployment Steps
1. Commit the changes
2. Push to your repository
3. SSH into your EC2 instance
4. Pull the latest changes
5. Restart the application: `pm2 restart haven-honey`

## Testing
After deployment:
1. Go to Admin → CRM
2. Send a test email with an image (both individual and mass email)
3. Check your inbox - the image should now display properly
4. The image will be embedded inline, not as a downloadable attachment

## Why This Works
- CID attachments are the industry standard for embedded email images
- All major email clients (Gmail, Outlook, Apple Mail) support CID attachments
- The image is part of the email itself, not an external resource that can be blocked
