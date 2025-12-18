import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Allowed image types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

// Validate file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    }
  }

  return { valid: true }
}

// Generate unique filename
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const ext = path.extname(originalName)
  const nameWithoutExt = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '-')
  return `${nameWithoutExt}-${timestamp}-${randomString}${ext}`
}

// Save uploaded file
export async function saveUploadedFile(
  file: File,
  folder: 'reviews' | 'work-photos' | 'blog'
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name)
    const filepath = path.join(uploadDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return public URL
    const publicUrl = `/uploads/${folder}/${filename}`
    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('File upload error:', error)
    return { success: false, error: 'Failed to save file' }
  }
}

// Delete uploaded file (for cleanup)
export async function deleteUploadedFile(fileUrl: string): Promise<boolean> {
  try {
    if (!fileUrl.startsWith('/uploads/')) {
      return false
    }

    const { unlink } = await import('fs/promises')
    const filepath = path.join(process.cwd(), 'public', fileUrl)
    
    if (existsSync(filepath)) {
      await unlink(filepath)
      return true
    }
    
    return false
  } catch (error) {
    console.error('File deletion error:', error)
    return false
  }
}

