import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// GET - Fetch published reviews for public display
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tag = searchParams.get('tag')
    const featured = searchParams.get('featured')
    
    let query = 'SELECT * FROM reviews WHERE is_published = true'
    const params: any[] = []

    if (tag) {
      query += ' AND tag = ?'
      params.push(tag)
    }

    if (featured === 'true') {
      query += ' AND is_featured = true'
    }

    query += ' ORDER BY display_order ASC, created_at DESC'

    const [rows] = await pool.execute(query, params)
    const reviews = rows as any[]
    
    console.log(`🔥 Public Reviews API: Found ${reviews.length} published reviews`)

    // Fetch images for each review
    for (const review of reviews) {
      const [imageRows] = await pool.execute(
        'SELECT image_url, display_order FROM review_images WHERE review_id = ? ORDER BY display_order ASC',
        [review.id]
      )
      const images = imageRows as any[]
      review.images = images
      console.log(`🔥 Review ${review.id} (${review.reviewer_name}): ${images.length} images`)
      if (images.length > 0) {
        console.log(`🔥   Image URLs:`, images.map(img => img.image_url))
      }
    }

    return NextResponse.json({
      success: true,
      reviews: reviews,
    })
  } catch (error) {
    console.error('Public reviews GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}




