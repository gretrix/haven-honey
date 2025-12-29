import mysql from 'mysql2/promise'

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'haven_honey',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export default pool

// Initialize database tables
export async function initializeDatabase() {
  const connection = await pool.getConnection()
  
  try {
    // Create contact_submissions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('new', 'read', 'responded') DEFAULT 'new',
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        INDEX idx_email (email),
        INDEX idx_created_at (created_at),
        INDEX idx_status (status),
        INDEX idx_deleted_at (deleted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create reviews table
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create work_photos table
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create audit_logs table
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create email_history table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS email_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contact_id INT NOT NULL,
        subject VARCHAR(500) NOT NULL,
        message_body TEXT NOT NULL,
        status ENUM('sent', 'failed') DEFAULT 'sent',
        error_message TEXT,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_contact_id (contact_id),
        INDEX idx_sent_at (sent_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create review_submissions table (client-submitted reviews pending approval)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS review_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reviewer_name VARCHAR(255) NOT NULL,
        reviewer_email VARCHAR(255) NOT NULL,
        star_rating INT NOT NULL CHECK (star_rating >= 1 AND star_rating <= 5),
        service_category ENUM('Meal Prep', 'Cleaning', 'Organizing', 'Gift Wrapping', 'Matchmaking', 'Life Coaching', 'Other') NOT NULL,
        review_text TEXT,
        screenshot_url VARCHAR(500) NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP NULL DEFAULT NULL,
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_reviewer_email (reviewer_email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    
    console.log('Database tables initialized successfully')
  } finally {
    connection.release()
  }
}

// Insert contact submission
export async function insertContactSubmission(data: {
  name: string
  email: string
  phone?: string
  message: string
}) {
  const [result] = await pool.execute(
    'INSERT INTO contact_submissions (name, email, phone, message) VALUES (?, ?, ?, ?)',
    [data.name, data.email, data.phone || null, data.message]
  )
  
  return result
}

// Audit log helper
export async function createAuditLog(data: {
  action_type: 'create' | 'update' | 'delete' | 'email_sent'
  entity_type: 'review' | 'work_photo' | 'contact' | 'email'
  entity_id?: number
  details?: string
  ip_address?: string
}) {
  await pool.execute(
    'INSERT INTO audit_logs (action_type, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?)',
    [data.action_type, data.entity_type, data.entity_id || null, data.details || null, data.ip_address || null]
  )
}

// Log email history
export async function logEmailHistory(data: {
  contact_id: number
  subject: string
  message_body: string
  status: 'sent' | 'failed'
  error_message?: string
}) {
  const [result] = await pool.execute(
    'INSERT INTO email_history (contact_id, subject, message_body, status, error_message) VALUES (?, ?, ?, ?, ?)',
    [data.contact_id, data.subject, data.message_body, data.status, data.error_message || null]
  )
  return result
}

// Insert review submission (public form)
export async function insertReviewSubmission(data: {
  reviewer_name: string
  reviewer_email: string
  star_rating: number
  service_category: string
  review_text?: string
  screenshot_url: string
}) {
  const [result] = await pool.execute(
    `INSERT INTO review_submissions 
     (reviewer_name, reviewer_email, star_rating, service_category, review_text, screenshot_url) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.reviewer_name,
      data.reviewer_email,
      data.star_rating,
      data.service_category,
      data.review_text || null,
      data.screenshot_url
    ]
  )
  return result
}




