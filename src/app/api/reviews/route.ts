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

    return NextResponse.json({
      success: true,
      reviews: rows,
    })
  } catch (error) {
    console.error('Public reviews GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}



