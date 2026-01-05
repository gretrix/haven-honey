import { NextRequest, NextResponse } from 'next/server'
import pool, { createAuditLog } from '@/lib/db'
import { saveUploadedFile, deleteUploadedFile } from '@/lib/upload'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'HavenHoney2025!'

// Helper to get client IP
function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown'
}

// Helper to check authentication
function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const providedPassword = authHeader?.replace('Bearer ', '')
  return providedPassword === ADMIN_PASSWORD
}

// GET - Fetch all work photos
export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    const category = searchParams.get('category')
    
    let query = 'SELECT * FROM work_photos WHERE 1=1'
    const params: any[] = []

    if (published === 'true') {
      query += ' AND is_published = true'
    }

    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }

    query += ' ORDER BY display_order ASC, created_at DESC'

    const [rows] = await pool.execute(query, params)

    return NextResponse.json({
      success: true,
      work_photos: rows,
    })
  } catch (error) {
    console.error('Work Photos GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch work photos' },
      { status: 500 }
    )
  }
}

// POST - Create new work photo or video
export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const image = formData.get('image') as File
    const video = formData.get('video') as File
    const category = formData.get('category') as string
    const mediaType = formData.get('media_type') as string || 'image'
    
    console.log('🔥 Work Photos API - Received:')
    console.log('  - media_type:', mediaType)
    console.log('  - category:', category)
    console.log('  - image:', image ? `${image.name} (${image.size} bytes)` : 'null')
    console.log('  - video:', video ? `${video.name} (${video.size} bytes)` : 'null')
    
    // Check if either image or video is provided based on media type
    if (mediaType === 'video' && !video) {
      console.log('🔥 ERROR: Video file is required but not provided')
      return NextResponse.json(
        { success: false, error: 'Video file is required for video type' },
        { status: 400 }
      )
    }
    
    if (mediaType === 'image' && !image) {
      console.log('🔥 ERROR: Image file is required but not provided')
      return NextResponse.json(
        { success: false, error: 'Image is required for image type' },
        { status: 400 }
      )
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      )
    }

    let imageUrl = null
    let videoUrl = null

    // Upload file based on media type
    if (mediaType === 'video' && video) {
      console.log('🔥 Uploading video file...')
      const uploadResult = await saveUploadedFile(video, 'work-photos', 'video')
      console.log('🔥 Video upload result:', uploadResult)
      if (!uploadResult.success) {
        return NextResponse.json(
          { success: false, error: uploadResult.error },
          { status: 400 }
        )
      }
      videoUrl = uploadResult.url
      console.log('🔥 Video uploaded successfully to:', videoUrl)
    } else if (image) {
      console.log('🔥 Uploading image file...')
      const uploadResult = await saveUploadedFile(image, 'work-photos', 'image')
      console.log('🔥 Image upload result:', uploadResult)
      if (!uploadResult.success) {
        return NextResponse.json(
          { success: false, error: uploadResult.error },
          { status: 400 }
        )
      }
      imageUrl = uploadResult.url
      console.log('🔥 Image uploaded successfully to:', imageUrl)
    }

    // Extract other fields
    const caption = formData.get('caption') as string
    const description = formData.get('description') as string
    const photoDate = formData.get('photo_date') as string
    const isPublished = formData.get('is_published') === 'true'
    const displayOrder = formData.get('display_order') ? parseInt(formData.get('display_order') as string) : 0

    // Convert date to MySQL DATE format (YYYY-MM-DD) - handle empty strings
    const formattedDate = photoDate && photoDate.trim() !== '' ? new Date(photoDate).toISOString().split('T')[0] : null
    
    console.log('🔥 About to insert into database with values:')
    console.log('  - category:', category)
    console.log('  - mediaType:', mediaType)
    console.log('  - caption:', caption || null)
    console.log('  - description:', description || null)
    console.log('  - imageUrl:', imageUrl)
    console.log('  - videoUrl:', videoUrl)
    console.log('  - formattedDate:', formattedDate)
    console.log('  - isPublished:', isPublished)
    console.log('  - displayOrder:', displayOrder)
    
    // Insert into database
    const [result] = await pool.execute(
      `INSERT INTO work_photos 
       (category, media_type, caption, description, image_url, video_url, photo_date, is_published, display_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category, mediaType, caption || null, description || null, imageUrl, videoUrl, formattedDate, isPublished, displayOrder]
    )

    const insertResult = result as any
    const photoId = insertResult.insertId

    // Log audit
    await createAuditLog({
      action_type: 'create',
      entity_type: 'work_photo',
      entity_id: photoId,
      details: `Created work ${mediaType} in category: ${category}`,
      ip_address: getClientIp(request),
    })

    return NextResponse.json({
      success: true,
      work_photo: {
        id: photoId,
        media_type: mediaType,
        image_url: imageUrl,
        video_url: videoUrl,
      },
    })
  } catch (error) {
    console.error('Work Photos POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create work photo' },
      { status: 500 }
    )
  }
}

// PATCH - Update work photo
export async function PATCH(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateFields } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Work photo ID is required' },
        { status: 400 }
      )
    }

    // Build dynamic update query
    const updates: string[] = []
    const values: any[] = []

    const allowedFields = [
      'category', 'caption', 'description', 'photo_date', 
      'is_published', 'display_order'
    ]

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        let value = updateFields[field]
        
        // Convert date to MySQL DATE format (YYYY-MM-DD) - handle empty strings
        if (field === 'photo_date') {
          if (value && value.trim() !== '') {
            value = new Date(value).toISOString().split('T')[0]
          } else {
            value = null
          }
        }
        
        updates.push(`${field} = ?`)
        values.push(value)
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      )
    }

    values.push(id)

    await pool.execute(
      `UPDATE work_photos SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    // Log audit
    await createAuditLog({
      action_type: 'update',
      entity_type: 'work_photo',
      entity_id: id,
      details: `Updated work photo fields: ${updates.join(', ')}`,
      ip_address: getClientIp(request),
    })

    return NextResponse.json({
      success: true,
      message: 'Work photo updated successfully',
    })
  } catch (error) {
    console.error('Work Photos PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update work photo' },
      { status: 500 }
    )
  }
}

// DELETE - Delete work photo
export async function DELETE(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Work photo ID is required' },
        { status: 400 }
      )
    }

    // Get work photo to delete file
    const [rows] = await pool.execute('SELECT image_url, category FROM work_photos WHERE id = ?', [id])
    const photos = rows as any[]

    if (photos.length > 0) {
      // Delete file
      await deleteUploadedFile(photos[0].image_url)
    }

    // Delete from database
    await pool.execute('DELETE FROM work_photos WHERE id = ?', [id])

    // Log audit
    await createAuditLog({
      action_type: 'delete',
      entity_type: 'work_photo',
      entity_id: parseInt(id),
      details: `Deleted work photo ID: ${id}`,
      ip_address: getClientIp(request),
    })

    return NextResponse.json({
      success: true,
      message: 'Work photo deleted successfully',
    })
  } catch (error) {
    console.error('Work Photos DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete work photo' },
      { status: 500 }
    )
  }
}




