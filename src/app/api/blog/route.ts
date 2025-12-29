import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// GET - Fetch published blog posts for public display
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    let query = `
      SELECT id, title, slug, excerpt, featured_image_url, category, 
             published_at, view_count 
      FROM blog_posts 
      WHERE status = 'published' AND published_at IS NOT NULL
    `
    const params: any[] = []

    if (category && category !== 'all') {
      query += ' AND category = ?'
      params.push(category)
    }

    query += ' ORDER BY published_at DESC LIMIT ?'
    params.push(limit)

    const [rows] = await pool.execute(query, params)

    return NextResponse.json({
      success: true,
      posts: rows,
    })
  } catch (error) {
    console.error('Public blog GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}



