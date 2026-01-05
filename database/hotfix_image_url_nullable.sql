-- HOTFIX: Make image_url nullable to support video uploads
-- Run this immediately if you're getting "Column 'image_url' cannot be null" error

USE haven_honey;

-- Make image_url nullable (required for video uploads)
ALTER TABLE work_photos MODIFY COLUMN image_url VARCHAR(500) NULL;

-- Verify the change
DESCRIBE work_photos;

