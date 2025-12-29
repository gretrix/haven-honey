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

// GET - Fetch all reviews
export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    
    let query = 'SELECT * FROM reviews'
    const params: any[] = []

    if (published === 'true') {
      query += ' WHERE is_published = true'
    }

    query += ' ORDER BY display_order ASC, created_at DESC'

    const [rows] = await pool.execute(query, params)

    return NextResponse.json({
      success: true,
      reviews: rows,
    })
  } catch (error) {
    console.error('Reviews GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST - Create new review
export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const screenshot = formData.get('screenshot') as File
    
    if (!screenshot) {
      return NextResponse.json(
        { success: false, error: 'Screenshot is required' },
        { status: 400 }
      )
    }

    // Upload file
    const uploadResult = await saveUploadedFile(screenshot, 'reviews')
    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error },
        { status: 400 }
      )
    }

    // Extract other fields
    const reviewerName = formData.get('reviewer_name') as string
    const reviewDate = formData.get('review_date') as string
    const starRating = formData.get('star_rating') ? parseInt(formData.get('star_rating') as string) : null
    const reviewText = formData.get('review_text') as string
    const tag = formData.get('tag') as string || 'Other'
    const isFeatured = formData.get('is_featured') === 'true'
    const isPublished = formData.get('is_published') === 'true'
    const displayOrder = formData.get('display_order') ? parseInt(formData.get('display_order') as string) : 0

    // Convert date to MySQL DATE format (YYYY-MM-DD)
    const formattedDate = reviewDate ? new Date(reviewDate).toISOString().split('T')[0] : null
    
    // Insert into database
    const [result] = await pool.execute(
      `INSERT INTO reviews 
       (reviewer_name, review_date, star_rating, review_text, screenshot_url, tag, is_featured, is_published, display_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reviewerName || null, formattedDate, starRating, reviewText || null, uploadResult.url, tag, isFeatured, isPublished, displayOrder]
    )

    const insertResult = result as any
    const reviewId = insertResult.insertId

    // Log audit
    await createAuditLog({
      action_type: 'create',
      entity_type: 'review',
      entity_id: reviewId,
      details: `Created review: ${reviewerName || 'Anonymous'}`,
      ip_address: getClientIp(request),
    })

    return NextResponse.json({
      success: true,
      review: {
        id: reviewId,
        screenshot_url: uploadResult.url,
      },
    })
  } catch (error) {
    console.error('Reviews POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

// PATCH - Update review
export async function PATCH(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateFields } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      )
    }

    // Build dynamic update query
    const updates: string[] = []
    const values: any[] = []

    const allowedFields = [
      'reviewer_name', 'review_date', 'star_rating', 'review_text', 
      'tag', 'is_featured', 'is_published', 'display_order'
    ]

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        let value = updateFields[field]
        
        // Convert date to MySQL DATE format (YYYY-MM-DD), or null if empty
        if (field === 'review_date') {
          if (value && value !== '') {
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
      `UPDATE reviews SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    // Log audit
    await createAuditLog({
      action_type: 'update',
      entity_type: 'review',
      entity_id: id,
      details: `Updated review fields: ${updates.join(', ')}`,
      ip_address: getClientIp(request),
    })

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
    })
  } catch (error) {
    console.error('Reviews PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE - Delete review
export async function DELETE(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      )
    }

    // Get review to delete file
    const [rows] = await pool.execute('SELECT screenshot_url FROM reviews WHERE id = ?', [id])
    const reviews = rows as any[]

    if (reviews.length > 0) {
      // Delete file
      await deleteUploadedFile(reviews[0].screenshot_url)
    }

    // Delete from database
    await pool.execute('DELETE FROM reviews WHERE id = ?', [id])

    // Log audit
    await createAuditLog({
      action_type: 'delete',
      entity_type: 'review',
      entity_id: parseInt(id),
      details: `Deleted review ID: ${id}`,
      ip_address: getClientIp(request),
    })

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    })
  } catch (error) {
    console.error('Reviews DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}




