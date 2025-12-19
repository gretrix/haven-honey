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

// Helper to generate URL-friendly slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// GET - Fetch all blog posts (admin)
export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    
    let query = 'SELECT * FROM blog_posts WHERE 1=1'
    const params: any[] = []

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }

    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }

    query += ' ORDER BY created_at DESC'

    const [rows] = await pool.execute(query, params)

    return NextResponse.json({
      success: true,
      posts: rows,
    })
  } catch (error) {
    console.error('Blog GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  console.log('=== BLOG POST START ===')
  try {
    console.log('1. Checking auth...')
    if (!checkAuth(request)) {
      console.log('AUTH FAILED')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.log('AUTH OK')

    console.log('2. Parsing form data...')
    const formData = await request.formData()
    console.log('Form data parsed')
    
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    
    console.log('3. Title:', title)
    console.log('4. Content length:', content?.length)
    
    if (!title || !content) {
      console.log('VALIDATION FAILED: Missing title or content')
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      )
    }
    console.log('VALIDATION OK')

    // Generate slug from title
    console.log('5. Generating slug...')
    let slug = formData.get('slug') as string || generateSlug(title)
    console.log('Slug:', slug)
    
    // Check if slug already exists
    console.log('6. Checking for existing slug...')
    const [existingPosts] = await pool.execute(
      'SELECT id FROM blog_posts WHERE slug = ?',
      [slug]
    )
    
    if ((existingPosts as any[]).length > 0) {
      console.log('Slug exists, making unique...')
      // Add timestamp to make slug unique
      slug = `${slug}-${Date.now()}`
      console.log('New slug:', slug)
    }

    // Handle featured image upload
    console.log('7. Handling featured image...')
    let featuredImageUrl = null
    const featuredImage = formData.get('featured_image') as File
    
    if (featuredImage && featuredImage.size > 0) {
      console.log('Featured image found, size:', featuredImage.size)
      console.log('Featured image type:', featuredImage.type)
      const uploadResult = await saveUploadedFile(featuredImage, 'blog')
      console.log('Upload result:', uploadResult)
      if (!uploadResult.success) {
        console.log('UPLOAD FAILED:', uploadResult.error)
        return NextResponse.json(
          { success: false, error: uploadResult.error },
          { status: 400 }
        )
      }
      featuredImageUrl = uploadResult.url
      console.log('Featured image uploaded:', featuredImageUrl)
    } else {
      console.log('No featured image or size is 0')
    }

    // Extract other fields
    console.log('8. Extracting other fields...')
    const excerpt = formData.get('excerpt') as string
    const category = formData.get('category') as string || 'Life'
    const metaTitle = formData.get('meta_title') as string
    const metaDescription = formData.get('meta_description') as string
    const status = formData.get('status') as string || 'draft'
    const scheduledFor = formData.get('scheduled_for') as string || null

    console.log('Category:', category)
    console.log('Status:', status)
    console.log('Scheduled for:', scheduledFor)

    // Determine published_at
    let publishedAt = null
    if (status === 'published') {
      publishedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
      console.log('Published at:', publishedAt)
    }

    // Insert into database
    console.log('9. Inserting into database...')
    const [result] = await pool.execute(
      `INSERT INTO blog_posts 
       (title, slug, excerpt, content, featured_image_url, category, meta_title, meta_description, status, scheduled_for, published_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, excerpt || null, content, featuredImageUrl, category, metaTitle || null, metaDescription || null, status, scheduledFor, publishedAt]
    )
    console.log('Database insert successful')

    const insertResult = result as any
    const postId = insertResult.insertId
    console.log('Post ID:', postId)

    // Log audit (skip if fails - don't block post creation)
    console.log('10. Creating audit log...')
    try {
      await createAuditLog({
        action_type: 'create',
        entity_type: 'review',
        entity_id: postId,
        details: `Created blog post: ${title}`,
        ip_address: getClientIp(request),
      })
      console.log('Audit log created')
    } catch (auditError) {
      console.error('Audit log error (non-blocking):', auditError)
    }

    console.log('11. Returning success response')
    console.log('=== BLOG POST SUCCESS ===')
    return NextResponse.json({
      success: true,
      post: {
        id: postId,
        slug,
        featured_image_url: featuredImageUrl,
      },
    })
  } catch (error) {
    console.error('=== BLOG POST ERROR ===')
    console.error('Error details:', error)
    console.error('Error stack:', (error as Error).stack)
    return NextResponse.json(
      { success: false, error: 'Failed to create blog post: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

// PATCH - Update blog post
export async function PATCH(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateFields } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      )
    }

    // Build dynamic update query
    const updates: string[] = []
    const values: any[] = []

    const allowedFields = [
      'title', 'slug', 'excerpt', 'content', 'category',
      'meta_title', 'meta_description', 'status', 'scheduled_for', 'featured_image_url'
    ]

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        updates.push(`${field} = ?`)
        // Convert empty strings to null for datetime fields
        if (field === 'scheduled_for' && updateFields[field] === '') {
          values.push(null)
        } else {
          values.push(updateFields[field])
        }
      }
    }

    // Handle status change to published
    if (updateFields.status === 'published') {
      // Check if published_at is null (first time publishing)
      const [rows] = await pool.execute('SELECT published_at FROM blog_posts WHERE id = ?', [id])
      const post = (rows as any[])[0]
      
      if (!post.published_at) {
        updates.push('published_at = NOW()')
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
      `UPDATE blog_posts SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    // Log audit (skip if fails - don't block post update)
    try {
      await createAuditLog({
        action_type: 'update',
        entity_type: 'review',
        entity_id: id,
        details: `Updated blog post fields: ${updates.join(', ')}`,
        ip_address: getClientIp(request),
      })
    } catch (auditError) {
      console.error('Audit log error:', auditError)
    }

    return NextResponse.json({
      success: true,
      message: 'Blog post updated successfully',
    })
  } catch (error) {
    console.error('Blog PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

// DELETE - Delete blog post
export async function DELETE(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      )
    }

    // Get post to delete featured image
    const [rows] = await pool.execute('SELECT featured_image_url, title FROM blog_posts WHERE id = ?', [id])
    const posts = rows as any[]

    if (posts.length > 0 && posts[0].featured_image_url) {
      // Delete featured image file
      await deleteUploadedFile(posts[0].featured_image_url)
    }

    // Delete from database
    await pool.execute('DELETE FROM blog_posts WHERE id = ?', [id])

    // Log audit (skip if fails - don't block post deletion)
    try {
      await createAuditLog({
        action_type: 'delete',
        entity_type: 'review',
        entity_id: parseInt(id),
        details: `Deleted blog post: ${posts[0]?.title || id}`,
        ip_address: getClientIp(request),
      })
    } catch (auditError) {
      console.error('Audit log error:', auditError)
    }

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully',
    })
  } catch (error) {
    console.error('Blog DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}

