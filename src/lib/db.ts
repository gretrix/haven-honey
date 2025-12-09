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
        INDEX idx_email (email),
        INDEX idx_created_at (created_at),
        INDEX idx_status (status)
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



