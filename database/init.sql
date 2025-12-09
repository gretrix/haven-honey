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



