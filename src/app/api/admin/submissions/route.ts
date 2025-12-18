import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// Simple authentication - In production, use proper auth like NextAuth
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'HavenHoney2025!'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const providedPassword = authHeader?.replace('Bearer ', '')

    if (providedPassword !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build query (exclude soft-deleted contacts)
    let query = 'SELECT * FROM contact_submissions WHERE deleted_at IS NULL'
    const params: string[] = []

    if (status !== 'all') {
      query += ' AND status = ?'
      params.push(status)
    }

    query += ' ORDER BY created_at DESC LIMIT ?'
    params.push(limit.toString())

    // Execute query
    const [rows] = await pool.execute(query, params)

    return NextResponse.json({
      success: true,
      submissions: rows,
      count: Array.isArray(rows) ? rows.length : 0,
    })
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const providedPassword = authHeader?.replace('Bearer ', '')

    if (providedPassword !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID and status are required' },
        { status: 400 }
      )
    }

    // Update status
    await pool.execute(
      'UPDATE contact_submissions SET status = ? WHERE id = ?',
      [status, id]
    )

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
    })
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update status' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const providedPassword = authHeader?.replace('Bearer ', '')

    if (providedPassword !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const permanent = searchParams.get('permanent') === 'true'

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Contact ID is required' },
        { status: 400 }
      )
    }

    if (permanent) {
      // Permanent delete (hard delete)
      await pool.execute('DELETE FROM contact_submissions WHERE id = ?', [id])
    } else {
      // Soft delete
      await pool.execute(
        'UPDATE contact_submissions SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      )
    }

    return NextResponse.json({
      success: true,
      message: permanent ? 'Contact permanently deleted' : 'Contact moved to trash',
    })
  } catch (error) {
    console.error('Admin API delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete contact' },
      { status: 500 }
    )
  }
}