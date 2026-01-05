-- Migration: Add support for multiple images per review, video support for work photos, and owner replies
-- Date: 2026-01-05

USE haven_honey;

-- ========================================
-- 1. ADD OWNER REPLY SUPPORT TO REVIEWS
-- ========================================

-- Add owner reply fields to reviews table
ALTER TABLE reviews 
ADD COLUMN owner_reply TEXT NULL AFTER review_text,
ADD COLUMN owner_reply_date TIMESTAMP NULL AFTER owner_reply,
ADD INDEX idx_owner_reply (owner_reply_date);

-- ========================================
-- 2. CREATE REVIEW IMAGES TABLE (Multiple images per review)
-- ========================================

CREATE TABLE IF NOT EXISTS review_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    INDEX idx_review_id (review_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate existing screenshot_url to review_images table
INSERT INTO review_images (review_id, image_url, display_order)
SELECT id, screenshot_url, 0
FROM reviews
WHERE screenshot_url IS NOT NULL AND screenshot_url != '';

-- Keep screenshot_url column for backward compatibility (will be primary image)
-- ALTER TABLE reviews DROP COLUMN screenshot_url; -- Don't drop yet, keep for compatibility

-- ========================================
-- 3. ADD VIDEO SUPPORT TO WORK PHOTOS
-- ========================================

-- Add media type and video URL support
ALTER TABLE work_photos 
ADD COLUMN media_type ENUM('image', 'video') DEFAULT 'image' AFTER category,
ADD COLUMN video_url VARCHAR(500) NULL AFTER image_url,
ADD INDEX idx_media_type (media_type);

-- Make image_url nullable to support videos (videos won't have image_url)
ALTER TABLE work_photos MODIFY COLUMN image_url VARCHAR(500) NULL;

-- Update existing records to be 'image' type
UPDATE work_photos SET media_type = 'image' WHERE media_type IS NULL;

-- ========================================
-- 4. CREATE REVIEW SUBMISSIONS TABLE (for public submissions)
-- ========================================

-- This table stores review submissions from customers before admin approval
CREATE TABLE IF NOT EXISTS review_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    star_rating INT CHECK (star_rating >= 1 AND star_rating <= 5),
    service_category VARCHAR(100) NOT NULL,
    review_text TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 5. CREATE REVIEW SUBMISSION IMAGES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS review_submission_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (submission_id) REFERENCES review_submissions(id) ON DELETE CASCADE,
    INDEX idx_submission_id (submission_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if columns were added successfully
-- SELECT COLUMN_NAME, COLUMN_TYPE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = 'haven_honey' 
-- AND TABLE_NAME = 'reviews' 
-- AND COLUMN_NAME IN ('owner_reply', 'owner_reply_date');

-- SELECT COLUMN_NAME, COLUMN_TYPE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = 'haven_honey' 
-- AND TABLE_NAME = 'work_photos' 
-- AND COLUMN_NAME IN ('media_type', 'video_url');

-- Check new tables
-- SHOW TABLES LIKE 'review%';
-- DESCRIBE review_images;
-- DESCRIBE review_submissions;
-- DESCRIBE review_submission_images;

