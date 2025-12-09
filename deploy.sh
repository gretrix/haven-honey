#!/bin/bash
# Quick deployment script for Haven & Honey updates

echo "🌿 Deploying Haven & Honey updates..."

# Navigate to project directory
cd /home/ec2-user/haven-honey || exit

# Pull latest changes (if using git)
echo "📥 Pulling latest changes..."
git pull origin main

# Install any new dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Restart PM2
echo "🔄 Restarting application..."
pm2 restart haven-honey

# Show status
echo "✅ Deployment complete!"
pm2 status

echo ""
echo "🌐 Website: https://havenhoney.co"
echo "📊 Check logs: pm2 logs haven-honey"

