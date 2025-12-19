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

// POST - Create new work photo
export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const image = formData.get('image') as File
    const category = formData.get('category') as string
    
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Image is required' },
        { status: 400 }
      )
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      )
    }

    // Upload file
    const uploadResult = await saveUploadedFile(image, 'work-photos')
    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error },
        { status: 400 }
      )
    }

    // Extract other fields
    const caption = formData.get('caption') as string
    const description = formData.get('description') as string
    const photoDate = formData.get('photo_date') as string
    const isPublished = formData.get('is_published') === 'true'
    const displayOrder = formData.get('display_order') ? parseInt(formData.get('display_order') as string) : 0

    // Convert date to MySQL DATE format (YYYY-MM-DD)
    const formattedDate = photoDate ? new Date(photoDate).toISOString().split('T')[0] : null
    
    // Insert into database
    const [result] = await pool.execute(
      `INSERT INTO work_photos 
       (category, caption, description, image_url, photo_date, is_published, display_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [category, caption || null, description || null, uploadResult.url, formattedDate, isPublished, displayOrder]
    )

    const insertResult = result as any
    const photoId = insertResult.insertId

    // Log audit
    await createAuditLog({
      action_type: 'create',
      entity_type: 'work_photo',
      entity_id: photoId,
      details: `Created work photo in category: ${category}`,
      ip_address: getClientIp(request),
    })

    return NextResponse.json({
      success: true,
      work_photo: {
        id: photoId,
        image_url: uploadResult.url,
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
        
        // Convert date to MySQL DATE format (YYYY-MM-DD)
        if (field === 'photo_date' && value) {
          value = new Date(value).toISOString().split('T')[0]
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


