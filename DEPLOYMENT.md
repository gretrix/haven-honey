# Haven & Honey - AWS EC2 Deployment Guide

This guide walks you through deploying the Haven & Honey website on an AWS EC2 instance running Amazon Linux 2023.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [EC2 Instance Setup](#ec2-instance-setup)
3. [Connect to Your Instance](#connect-to-your-instance)
4. [Install Required Software](#install-required-software)
5. [Set Up MySQL Database](#set-up-mysql-database)
6. [Deploy the Application](#deploy-the-application)
7. [Configure Environment Variables](#configure-environment-variables)
8. [Set Up Process Manager (PM2)](#set-up-process-manager-pm2)
9. [Configure Nginx Reverse Proxy](#configure-nginx-reverse-proxy)
10. [SSL Certificate with Let's Encrypt](#ssl-certificate-with-lets-encrypt)
11. [Configure Firewall](#configure-firewall)
12. [Email Configuration](#email-configuration)
13. [Maintenance Commands](#maintenance-commands)

---

## Prerequisites

Before starting, ensure you have:

- An AWS account
- A domain name (e.g., havenhoney.co) pointed to your server
- SSH key pair for EC2 access
- Basic familiarity with Linux command line

---

## EC2 Instance Setup

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Configure:
   - **Name**: `haven-honey-web`
   - **AMI**: Amazon Linux 2023
   - **Instance type**: t2.micro (free tier) or t2.small (recommended)
   - **Key pair**: Create or select existing
   - **Network settings**: 
     - Allow SSH (port 22)
     - Allow HTTP (port 80)
     - Allow HTTPS (port 443)
   - **Storage**: 20 GB gp3

3. Click "Launch Instance"

### Step 2: Allocate Elastic IP (Optional but Recommended)

1. Go to EC2 → Elastic IPs
2. Allocate new address
3. Associate with your instance
4. Update your domain DNS to point to this IP

---

## Connect to Your Instance

```bash
# Replace with your key file and instance IP
ssh -i "your-key.pem" ec2-user@your-instance-ip

# Or if using Windows PowerShell:
ssh -i "C:\path\to\your-key.pem" ec2-user@your-instance-ip
```

---

## Install Required Software

### Update System

```bash
sudo dnf update -y
```

### Install Node.js 20 LTS

```bash
# Install Node.js using NodeSource
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Verify installation
node --version
npm --version
```

### Install Git

```bash
sudo dnf install -y git
```

### Install Nginx

```bash
sudo dnf install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Set Up MySQL Database

### Install MySQL 8.0

```bash
# Install MySQL
sudo dnf install -y mysql-server

# Start and enable MySQL
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Secure MySQL installation
sudo mysql_secure_installation
```

During secure installation:
- Set a strong root password
- Remove anonymous users: Yes
- Disallow root login remotely: Yes
- Remove test database: Yes
- Reload privilege tables: Yes

### Create Database and User

```bash
# Login to MySQL
sudo mysql -u root -p

# Run these SQL commands:
```

```sql
-- Create database
CREATE DATABASE haven_honey CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create application user
CREATE USER 'haven_app'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';

-- Grant privileges
GRANT ALL PRIVILEGES ON haven_honey.* TO 'haven_app'@'localhost';
FLUSH PRIVILEGES;

-- Create the contact_submissions table
USE haven_honey;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

EXIT;
```

---

## Deploy the Application

### Clone or Upload Your Code

**Option A: Clone from Git repository**

```bash
cd /home/ec2-user
git clone https://github.com/your-username/haven-honey.git
cd haven-honey
```

**Option B: Upload via SCP**

From your local machine:
```bash
scp -i "your-key.pem" -r /path/to/haven-honey ec2-user@your-instance-ip:/home/ec2-user/
```

### Install Dependencies

```bash
cd /home/ec2-user/haven-honey
npm install
```

### Build the Application

```bash
npm run build
```

---

## Configure Environment Variables

Create the `.env.local` file:

```bash
nano /home/ec2-user/haven-honey/.env.local
```

Add these variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=haven_app
DB_PASSWORD=YourSecurePassword123!
DB_NAME=haven_honey

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@havenhoney.co

# Linda's notification email
LINDA_EMAIL=linda@havenhoney.co

# Application URL
NEXT_PUBLIC_APP_URL=https://havenhoney.co
```

Save and exit (Ctrl+X, Y, Enter).

---

## Set Up Process Manager (PM2)

PM2 keeps your application running and auto-restarts on crashes.

### Install PM2

```bash
sudo npm install -g pm2
```

### Create PM2 Ecosystem File

```bash
nano /home/ec2-user/haven-honey/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'haven-honey',
    script: 'npm',
    args: 'start',
    cwd: '/home/ec2-user/haven-honey',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### Start the Application

```bash
cd /home/ec2-user/haven-honey
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Copy and run the command output by `pm2 startup`.

---

## Configure Nginx Reverse Proxy

### Create Nginx Configuration

```bash
sudo nano /etc/nginx/conf.d/havenhoney.conf
```

```nginx
server {
    listen 80;
    server_name havenhoney.co www.havenhoney.co;

    # Redirect www to non-www
    if ($host = www.havenhoney.co) {
        return 301 https://havenhoney.co$request_uri;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /images {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

### Test and Restart Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## SSL Certificate with Let's Encrypt

### Install Certbot

```bash
sudo dnf install -y certbot python3-certbot-nginx
```

### Obtain SSL Certificate

```bash
sudo certbot --nginx -d havenhoney.co -d www.havenhoney.co
```

Follow the prompts:
- Enter email address
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### Auto-Renewal

Certbot sets up auto-renewal. Test it:

```bash
sudo certbot renew --dry-run
```

---

## Configure Firewall

Amazon Linux 2023 uses firewalld:

```bash
# Check if firewalld is running
sudo systemctl status firewalld

# If not running, start it
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Open required ports
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload

# Verify
sudo firewall-cmd --list-all
```

Also ensure AWS Security Group allows:
- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)

---

## Email Configuration

### Option 1: Gmail SMTP

1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Create new app password
   - Use this password in `SMTP_PASSWORD`

### Option 2: AWS SES (Recommended for Production)

1. Go to AWS SES Console
2. Verify your domain or email addresses
3. Create SMTP credentials
4. Update `.env.local`:

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
```

---

## Maintenance Commands

### View Application Logs

```bash
# Real-time logs
pm2 logs haven-honey

# Last 100 lines
pm2 logs haven-honey --lines 100
```

### Restart Application

```bash
pm2 restart haven-honey
```

### Update Application

```bash
cd /home/ec2-user/haven-honey

# Pull latest changes (if using Git)
git pull origin main

# Install any new dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart haven-honey
```

### Monitor Application

```bash
pm2 monit
```

### View Database Submissions

```bash
mysql -u haven_app -p haven_honey -e "SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 10;"
```

### Backup Database

```bash
# Create backup
mysqldump -u haven_app -p haven_honey > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u haven_app -p haven_honey < backup_20231201.sql
```

---

## Troubleshooting

### Application Not Starting

```bash
# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs haven-honey --err --lines 50

# Verify Node.js version
node --version
```

### Nginx Errors

```bash
# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t
```

### Database Connection Issues

```bash
# Test MySQL connection
mysql -u haven_app -p -e "SELECT 1;"

# Check MySQL is running
sudo systemctl status mysqld
```

### Email Not Sending

1. Check SMTP credentials in `.env.local`
2. For Gmail: Ensure App Password is correct
3. Check application logs for email errors
4. Verify SMTP port 587 is not blocked

---

## Quick Reference

| Service | Command |
|---------|---------|
| Start App | `pm2 start haven-honey` |
| Stop App | `pm2 stop haven-honey` |
| Restart App | `pm2 restart haven-honey` |
| View Logs | `pm2 logs haven-honey` |
| Start Nginx | `sudo systemctl start nginx` |
| Restart Nginx | `sudo systemctl restart nginx` |
| Start MySQL | `sudo systemctl start mysqld` |
| Restart MySQL | `sudo systemctl restart mysqld` |

---

## Support

For issues with this deployment, check:
1. PM2 logs: `pm2 logs`
2. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. MySQL logs: `sudo tail -f /var/log/mysqld.log`

---

Made with 🌿 for Haven & Honey






