import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// GET - Fetch single blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug

    // Fetch the blog post
    const [rows] = await pool.execute(
      `SELECT * FROM blog_posts 
       WHERE slug = ? AND status = 'published' AND published_at IS NOT NULL`,
      [slug]
    )

    const posts = rows as any[]

    if (posts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      )
    }

    const post = posts[0]

    // Increment view count (optional - can track analytics)
    await pool.execute(
      'UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ?',
      [post.id]
    )

    return NextResponse.json({
      success: true,
      post,
    })
  } catch (error) {
    console.error('Public blog post GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}



