import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'HavenHoney2025!'

// Helper to check authentication
function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const providedPassword = authHeader?.replace('Bearer ', '')
  return providedPassword === ADMIN_PASSWORD
}

// GET - Fetch audit logs
export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const action_type = searchParams.get('action_type')
    const entity_type = searchParams.get('entity_type')
    
    // Build WHERE clause
    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (action_type && action_type !== 'all') {
      whereClause += ' AND action_type = ?'
      params.push(action_type)
    }

    if (entity_type && entity_type !== 'all') {
      whereClause += ' AND entity_type = ?'
      params.push(entity_type)
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`
    const [countRows] = await pool.execute(countQuery, params)
    const total = (countRows as any[])[0].total

    // Get paginated logs
    const query = `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    const [rows] = await pool.execute(query, [...params, limit, offset])

    return NextResponse.json({
      success: true,
      logs: rows,
      total: total,
      page: Math.floor(offset / limit) + 1,
      perPage: limit,
    })
  } catch (error) {
    console.error('Audit logs GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}


