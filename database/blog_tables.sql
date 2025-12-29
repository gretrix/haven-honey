-- ========================================
-- LIFE WITH LINDA BLOG SYSTEM
-- ========================================

-- Blog Posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    featured_image_url VARCHAR(500),
    category ENUM('Meal Prep', 'Life', 'Tips', 'Faith', 'Home', 'Organizing', 'Other') DEFAULT 'Life',
    
    -- SEO fields
    meta_title VARCHAR(500),
    meta_description TEXT,
    
    -- Publishing
    status ENUM('draft', 'scheduled', 'published') DEFAULT 'draft',
    scheduled_for DATETIME NULL,
    published_at DATETIME NULL,
    
    -- Stats
    view_count INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_published_at (published_at),
    INDEX idx_scheduled_for (scheduled_for)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blog Categories (for future expansion)
CREATE TABLE IF NOT EXISTS blog_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default categories
INSERT IGNORE INTO blog_categories (name, slug, description, display_order) VALUES
('Meal Prep', 'meal-prep', 'Meal planning and preparation tips', 1),
('Life', 'life', 'Personal stories and life updates', 2),
('Tips', 'tips', 'Helpful tips and tricks', 3),
('Faith', 'faith', 'Faith and inspiration', 4),
('Home', 'home', 'Home organization and care', 5),
('Organizing', 'organizing', 'Organization strategies', 6),
('Other', 'other', 'Other topics', 7);

-- Blog post views tracking (optional - for analytics)
CREATE TABLE IF NOT EXISTS blog_post_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_viewed_at (viewed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



