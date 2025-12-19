import { NextRequest, NextResponse } from 'next/server'
import { saveUploadedFile } from '@/lib/upload'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'HavenHoney2025!'

// Helper to check authentication
function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const providedPassword = authHeader?.replace('Bearer ', '')
  return providedPassword === ADMIN_PASSWORD
}

// POST - Upload blog featured image only
export async function POST(request: NextRequest) {
  console.log('=== BLOG IMAGE UPLOAD START ===')
  try {
    console.log('1. Checking auth...')
    if (!checkAuth(request)) {
      console.log('AUTH FAILED')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.log('AUTH OK')

    console.log('2. Parsing form data...')
    const formData = await request.formData()
    const featuredImage = formData.get('featured_image') as File
    
    if (!featuredImage || featuredImage.size === 0) {
      console.log('NO IMAGE PROVIDED')
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      )
    }
    
    console.log('3. Image found:', featuredImage.name, 'Size:', featuredImage.size)

    // Upload the image
    console.log('4. Uploading image...')
    const uploadResult = await saveUploadedFile(featuredImage, 'blog')
    
    if (!uploadResult.success) {
      console.log('UPLOAD FAILED:', uploadResult.error)
      return NextResponse.json(
        { success: false, error: uploadResult.error },
        { status: 400 }
      )
    }
    
    console.log('5. Upload successful:', uploadResult.url)
    console.log('=== BLOG IMAGE UPLOAD SUCCESS ===')
    
    return NextResponse.json({
      success: true,
      url: uploadResult.url,
    })
  } catch (error) {
    console.error('=== BLOG IMAGE UPLOAD ERROR ===')
    console.error('Error details:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload image: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
