import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mpeg']
const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB for images
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB for videos

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

// Validate image file
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

// Validate video file
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid video type. Allowed types: MP4, MOV, AVI, WebM, MPEG`,
    }
  }

  // Check file size
  if (file.size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `Video too large. Maximum size: ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`,
    }
  }

  return { valid: true }
}

// Validate any media file (image or video)
export function validateMediaFile(file: File, type: 'image' | 'video'): { valid: boolean; error?: string } {
  if (type === 'video') {
    return validateVideoFile(file)
  }
  return validateImageFile(file)
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
  folder: 'reviews' | 'work-photos' | 'blog',
  mediaType: 'image' | 'video' = 'image'
): Promise<UploadResult> {
  try {
    // Validate file based on media type
    const validation = validateMediaFile(file, mediaType)
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
export async function deleteUploadedFile(fileUrl: string | null): Promise<boolean> {
  try {
    // Check if fileUrl is null or undefined
    if (!fileUrl || typeof fileUrl !== 'string') {
      return false
    }
    
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

