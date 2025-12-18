-- Haven & Honey Database Initialization Script
-- Run this script to set up the MySQL database

-- Create database
CREATE DATABASE IF NOT EXISTS haven_honey
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE haven_honey;

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('new', 'read', 'responded') DEFAULT 'new',
    
    -- Indexes for better query performance
    INDEX idx_email (email),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Create a read-only user for the application
-- CREATE USER IF NOT EXISTS 'haven_honey_app'@'localhost' IDENTIFIED BY 'your_secure_password';
-- GRANT SELECT, INSERT, UPDATE ON haven_honey.* TO 'haven_honey_app'@'localhost';
-- FLUSH PRIVILEGES;

-- View to get new submissions
CREATE OR REPLACE VIEW new_submissions AS
SELECT 
    id,
    name,
    email,
    phone,
    message,
    created_at
FROM contact_submissions
WHERE status = 'new'
ORDER BY created_at DESC;

-- Query to mark a submission as read
-- UPDATE contact_submissions SET status = 'read' WHERE id = ?;

-- Query to mark a submission as responded
-- UPDATE contact_submissions SET status = 'responded' WHERE id = ?;

-- ========================================
-- ADMIN PORTAL 2.0 - NEW TABLES
-- ========================================

-- Reviews table (customer testimonials with screenshots)
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reviewer_name VARCHAR(255),
    review_date DATE,
    star_rating INT CHECK (star_rating >= 1 AND star_rating <= 5),
    review_text TEXT,
    screenshot_url VARCHAR(500) NOT NULL,
    tag ENUM('Meal Prep', 'Cleaning', 'Organizing', 'Gift Wrapping', 'Matchmaking', 'Life Coaching', 'Other') DEFAULT 'Other',
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_published (is_published),
    INDEX idx_featured (is_featured),
    INDEX idx_tag (tag),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Work Photos table (portfolio/gallery)
CREATE TABLE IF NOT EXISTS work_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('Meal Prep', 'Cleaning', 'Organizing', 'Gift Wrapping', 'Other') NOT NULL,
    caption TEXT,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    photo_date DATE,
    is_published BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_published (is_published),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Log table (track admin actions)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action_type ENUM('create', 'update', 'delete', 'email_sent') NOT NULL,
    entity_type ENUM('review', 'work_photo', 'contact', 'email') NOT NULL,
    entity_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_action_type (action_type),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email History table (track individual emails sent)
CREATE TABLE IF NOT EXISTS email_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contact_id INT NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message_body TEXT NOT NULL,
    status ENUM('sent', 'failed') DEFAULT 'sent',
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (contact_id) REFERENCES contact_submissions(id) ON DELETE CASCADE,
    INDEX idx_contact_id (contact_id),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add soft delete column to contact_submissions
ALTER TABLE contact_submissions 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL,
ADD INDEX idx_deleted_at (deleted_at);




