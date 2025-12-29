import { NextRequest, NextResponse } from 'next/server'
import { sendMassEmail } from '@/lib/email'
import pool from '@/lib/db'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'HavenHoney2025!'

export async function POST(request: NextRequest) {
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
    const { subject, message, recipientIds, sendToAll, image } = body

    if (!subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Subject and message are required' },
        { status: 400 }
      )
    }

    // Get recipients
    let query = 'SELECT id, name, email FROM contact_submissions'
    let params: any[] = []

    if (!sendToAll && recipientIds && recipientIds.length > 0) {
      query += ` WHERE id IN (${recipientIds.map(() => '?').join(',')})`
      params = recipientIds
    }

    const [rows] = await pool.execute(query, params)
    const recipients = rows as Array<{ id: number; name: string; email: string }>

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No recipients found' },
        { status: 400 }
      )
    }

    // Send emails
    const results = await Promise.allSettled(
      recipients.map((recipient) =>
        sendMassEmail(recipient.email, recipient.name, subject, message, image)
      )
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      message: `Sent ${successful} emails successfully. ${failed} failed.`,
      sent: successful,
      failed: failed,
      total: recipients.length,
    })
  } catch (error) {
    console.error('Mass email error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send mass email' },
      { status: 500 }
    )
  }
}



