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
    const limit = parseInt(searchParams.get('limit') || '100')
    const action_type = searchParams.get('action_type')
    const entity_type = searchParams.get('entity_type')
    
    let query = 'SELECT * FROM audit_logs WHERE 1=1'
    const params: any[] = []

    if (action_type && action_type !== 'all') {
      query += ' AND action_type = ?'
      params.push(action_type)
    }

    if (entity_type && entity_type !== 'all') {
      query += ' AND entity_type = ?'
      params.push(entity_type)
    }

    query += ' ORDER BY created_at DESC LIMIT ?'
    params.push(limit)

    const [rows] = await pool.execute(query, params)

    return NextResponse.json({
      success: true,
      logs: rows,
    })
  } catch (error) {
    console.error('Audit logs GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}

