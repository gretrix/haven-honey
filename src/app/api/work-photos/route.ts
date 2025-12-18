import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// GET - Fetch published work photos for public display
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    let query = 'SELECT * FROM work_photos WHERE is_published = true'
    const params: any[] = []

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
    console.error('Public work photos GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch work photos' },
      { status: 500 }
    )
  }
}

