#!/bin/bash

echo "🚀 Deploying fixes for video and image issues..."

# Navigate to project directory
cd /home/ec2-user/haven-honey

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull

# Install dependencies (if needed)
echo "📦 Installing dependencies..."
npm install

# Build production
echo "🔨 Building production..."
npm run build

# Restart PM2
echo "♻️  Restarting PM2..."
pm2 restart haven-honey

# Show logs
echo "📋 Showing logs (press Ctrl+C to exit)..."
pm2 logs haven-honey --lines 50
