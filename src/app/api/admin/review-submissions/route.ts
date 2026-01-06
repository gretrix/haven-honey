import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'havenhoney2024'

function checkAuth(request: NextRequest): boolean {
  const providedPassword = request.headers.get('authorization')?.replace('Bearer ', '')
  return providedPassword === ADMIN_PASSWORD
}

// GET - Fetch review submissions
export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = 'SELECT * FROM review_submissions'
    const params: string[] = []

    if (status && status !== 'all') {
      query += ' WHERE status = ?'
      params.push(status)
    }

    query += ' ORDER BY created_at DESC'

    const [rows] = await pool.execute(query, params)
    const submissions = rows as any[]

    // Fetch images for each submission
    for (const submission of submissions) {
      const [imageRows] = await pool.execute(
        'SELECT image_url, display_order FROM review_submission_images WHERE submission_id = ? ORDER BY display_order ASC',
        [submission.id]
      )
      submission.images = imageRows
      console.log(`🔥 Submission ${submission.id} has ${(imageRows as any[]).length} images`)
    }

    return NextResponse.json({
      success: true,
      submissions: submissions,
    })
  } catch (error) {
    console.error('Failed to fetch review submissions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch review submissions' },
      { status: 500 }
    )
  }
}

// PATCH - Approve or reject a submission
export async function PATCH(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, action, admin_notes } = body

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the submission
    const [submissions] = await pool.execute(
      'SELECT * FROM review_submissions WHERE id = ?',
      [id]
    )

    const submissionRows = submissions as any[]
    if (submissionRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      )
    }

    const submission = submissionRows[0]

    if (action === 'approve') {
      console.log('🔥 Approving review submission ID:', id)
      
      // Get all images for this submission
      const [imageRows] = await pool.execute(
        'SELECT image_url, display_order FROM review_submission_images WHERE submission_id = ? ORDER BY display_order ASC',
        [id]
      )
      const submissionImages = imageRows as any[]
      console.log(`🔥 Found ${submissionImages.length} images for submission`)
      
      // Create a new review in the reviews table
      const [reviewResult] = await pool.execute(
        `INSERT INTO reviews 
         (reviewer_name, star_rating, review_text, screenshot_url, tag, is_featured, is_published, display_order) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          submission.reviewer_name,
          submission.star_rating,
          submission.review_text || null,
          submission.screenshot_url,
          submission.service_category,
          false, // not featured by default
          true, // published by default when approved
          0, // default display order
        ]
      )
      
      const reviewInsertResult = reviewResult as any
      const reviewId = reviewInsertResult.insertId
      console.log('🔥 Created review with ID:', reviewId)
      
      // Copy all images to review_images table
      if (submissionImages.length > 0) {
        for (const img of submissionImages) {
          await pool.execute(
            'INSERT INTO review_images (review_id, image_url, display_order) VALUES (?, ?, ?)',
            [reviewId, img.image_url, img.display_order]
          )
        }
        console.log(`🔥 Copied ${submissionImages.length} images to review_images table`)
      }

      // Mark submission as approved
      await pool.execute(
        'UPDATE review_submissions SET status = ?, admin_notes = ?, reviewed_at = NOW() WHERE id = ?',
        ['approved', admin_notes || null, id]
      )

      return NextResponse.json({
        success: true,
        message: 'Review approved and published',
      })
    } else if (action === 'reject') {
      // Mark submission as rejected
      await pool.execute(
        'UPDATE review_submissions SET status = ?, admin_notes = ?, reviewed_at = NOW() WHERE id = ?',
        ['rejected', admin_notes || null, id]
      )

      return NextResponse.json({
        success: true,
        message: 'Review submission rejected',
      })
    } else if (action === 'undo_rejection') {
      // Move rejected submission back to pending
      await pool.execute(
        'UPDATE review_submissions SET status = ?, reviewed_at = NULL WHERE id = ?',
        ['pending', id]
      )

      return NextResponse.json({
        success: true,
        message: 'Review moved back to pending',
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Failed to update review submission:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update review submission' },
      { status: 500 }
    )
  }
}

// DELETE - Permanently delete a submission
export async function DELETE(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Submission ID is required' },
        { status: 400 }
      )
    }

    await pool.execute('DELETE FROM review_submissions WHERE id = ?', [id])

    return NextResponse.json({
      success: true,
      message: 'Submission deleted',
    })
  } catch (error) {
    console.error('Failed to delete submission:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete submission' },
      { status: 500 }
    )
  }
}

