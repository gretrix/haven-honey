# Haven & Honey 🌿

A beautiful, warm, and boutique website for Linda's home services brand.

## Features

- ✨ Beautiful, mobile-first responsive design
- 🎨 Warm cream, sage, and honey color palette
- 🔄 Interactive flip cards for services
- 📧 Contact form with email notifications
- 💾 MySQL database for storing submissions
- 🔒 SSL/HTTPS enabled
- 📱 Instagram integration

## Tech Stack

- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Database:** MySQL/MariaDB
- **Email:** Nodemailer with Gmail SMTP
- **Deployment:** AWS EC2 (Amazon Linux 2023)
- **Web Server:** Nginx
- **Process Manager:** PM2

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local file
cp env.template .env.local

# Edit .env.local with your credentials

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deploy to Production (AWS EC2)

Follow the comprehensive guide in `DEPLOYMENT.md`

## Quick Deploy Commands

```bash
# SSH into your EC2 instance
ssh -i "your-key.pem" ec2-user@your-ec2-ip

# Navigate to project
cd /home/ec2-user/haven-honey

# Pull latest changes (if using git)
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart PM2
pm2 restart haven-honey

# Check status
pm2 status
```

## Environment Variables

Required environment variables in `.env.local`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=haven_honey

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=linda@havenhoney.co
LINDA_EMAIL=linda@havenhoney.co

# App URL
NEXT_PUBLIC_APP_URL=https://havenhoney.co
```

## Database Schema

```sql
CREATE TABLE contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('new', 'read', 'responded') DEFAULT 'new',
    INDEX idx_email (email),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status)
);
```

## Check Database Submissions

```bash
mysql -u haven_app -pYourPassword haven_honey -e "SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 10;"
```

## Maintenance

```bash
# View logs
pm2 logs haven-honey

# Restart app
pm2 restart haven-honey

# Check status
pm2 status

# Monitor
pm2 monit
```

## SSL Certificate Renewal

Certificates auto-renew via certbot. Test renewal:

```bash
sudo certbot renew --dry-run
```

---

Made with 🌿 for Haven & Honey

© 2025 Haven & Honey. All rights reserved.





