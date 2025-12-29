#!/bin/bash

# Fix Broken Images on Haven & Honey Production
# Run this script on your EC2 server

echo "🔧 Fixing Haven & Honey Images..."

# 1. Go to project directory
cd /home/ec2-user/haven-honey

# 2. Create upload directories if they don't exist
echo "Creating upload directories..."
mkdir -p public/uploads/reviews
mkdir -p public/uploads/work-photos
mkdir -p public/uploads/blog

# 3. Set proper ownership
echo "Setting ownership..."
sudo chown -R ec2-user:ec2-user public/uploads

# 4. Set proper permissions
echo "Setting permissions..."
chmod 755 public/uploads
chmod 755 public/uploads/reviews
chmod 755 public/uploads/work-photos
chmod 755 public/uploads/blog

# Set files to readable
find public/uploads -type f -exec chmod 644 {} \; 2>/dev/null

# 5. Check if files exist
echo ""
echo "📁 Checking uploaded files:"
echo "Reviews:"
ls -lah public/uploads/reviews/ 2>/dev/null | tail -5
echo ""
echo "Work Photos:"
ls -lah public/uploads/work-photos/ 2>/dev/null | tail -5
echo ""
echo "Blog:"
ls -lah public/uploads/blog/ 2>/dev/null | tail -5

# 6. Pull latest code (includes image serving fix)
echo ""
echo "📥 Pulling latest code..."
git pull origin main

# 7. Rebuild
echo ""
echo "🔨 Building app..."
npm run build

# 8. Restart PM2
echo ""
echo "🔄 Restarting app..."
pm2 restart haven-honey

# 9. Show PM2 status
echo ""
echo "✅ Status:"
pm2 status

echo ""
echo "🎉 Done! Now test:"
echo "1. Go to /admin → Reviews → Upload test image"
echo "2. Check if image displays on /reviews"
echo "3. If still broken, check logs: pm2 logs haven-honey"




