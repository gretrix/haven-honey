import { NextRequest, NextResponse } from 'next/server'
import pool, { createAuditLog, logEmailHistory } from '@/lib/db'
import nodemailer from 'nodemailer'

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

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

// POST - Send individual email to a contact
export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contact_id, to_email, to_name, subject, message, images } = body

    if (!contact_id || !to_email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create email HTML with optional multiple images (using CID for embedded images)
    let imageHtml = ''
    if (images && Array.isArray(images) && images.length > 0) {
      imageHtml = images.map((_, index) => `
          <!-- Image ${index + 1} -->
          <tr>
            <td align="center" style="padding: 20px 40px;">
              <img src="cid:emailImage${index}" alt="Email attachment ${index + 1}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 2px 8px rgba(78, 59, 50, 0.1);" />
            </td>
          </tr>
      `).join('')
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #F8F3EB;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #FDFBF7; border-radius: 16px; box-shadow: 0 4px 24px rgba(78, 59, 50, 0.1);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <h1 style="margin: 0; font-size: 32px; color: #4E3B32; font-weight: 500;">Haven & Honey</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #8B9A7D; font-style: italic;">Making Homes Feel Loved</p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td align="center" style="padding: 0 40px;">
              <div style="width: 80px; height: 2px; background: linear-gradient(90deg, transparent, #D4A853, transparent);"></div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.7; color: #6B5448;">
                Hello ${to_name || 'there'},
              </p>
              <div style="margin: 0; font-size: 16px; line-height: 1.7; color: #6B5448; white-space: pre-wrap;">
${message}
              </div>
              <p style="margin: 20px 0 0; font-size: 16px; line-height: 1.7; color: #6B5448;">
                With warmth and care,<br>
                <strong style="color: #4E3B32;">Linda</strong><br>
                <span style="color: #8B9A7D; font-size: 14px;">Haven & Honey</span>
              </p>
            </td>
          </tr>
          ${imageHtml}
          
          <!-- Quote -->
          <tr>
            <td align="center" style="padding: 20px 40px 40px;">
              <div style="background-color: #F8F3EB; padding: 24px; border-radius: 12px; border-left: 4px solid #D4A853;">
                <p style="margin: 0; font-size: 14px; font-style: italic; color: #6B5448;">
                  "Let all that you do be done in love."
                </p>
                <p style="margin: 8px 0 0; font-size: 12px; color: #8B9A7D;">
                  — 1 Corinthians 16:14
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 20px 40px; background-color: #4E3B32; border-radius: 0 0 16px 16px;">
              <p style="margin: 0; font-size: 12px; color: #E5D9C5;">
                © ${new Date().getFullYear()} Haven & Honey. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; font-size: 11px; color: #E5D9C5;">
                <a href="https://www.instagram.com/lifewithlindaaaa/" style="color: #D4A853; text-decoration: none;">@lifewithlindaaaa</a>
              </p>
              <p style="margin: 4px 0 0; font-size: 9px; color: #4E3B32;">
                AUTOMATED-EMAIL-FROM-WEBSITE
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    let emailStatus: 'sent' | 'failed' = 'sent'
    let errorMessage: string | undefined

    try {
      // Prepare email options
      const mailOptions: any = {
        from: `"Haven & Honey - Linda" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: to_email,
        subject,
        html: emailHtml,
        replyTo: process.env.LINDA_EMAIL || 'linda@havenhoney.co',
      }

      // Add images as CID attachments if present
      if (images && Array.isArray(images) && images.length > 0) {
        mailOptions.attachments = images.map((imageData: string, index: number) => {
          // Extract base64 data and mime type from data URL
          const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
          if (matches && matches.length === 3) {
            const mimeType = matches[1]
            const base64Data = matches[2]
            
            return {
              filename: `image${index + 1}.jpg`,
              content: base64Data,
              encoding: 'base64',
              cid: `emailImage${index}`, // Same CID used in the img src
              contentType: mimeType,
            }
          }
          return null
        }).filter(Boolean)
      }

      // Send email
      await transporter.sendMail(mailOptions)
    } catch (emailError: any) {
      emailStatus = 'failed'
      errorMessage = emailError.message
      console.error('Email send error:', emailError)
    }

    // Log email history
    await logEmailHistory({
      contact_id: parseInt(contact_id),
      subject,
      message_body: message,
      status: emailStatus,
      error_message: errorMessage,
    })

    // Log audit
    await createAuditLog({
      action_type: 'email_sent',
      entity_type: 'email',
      entity_id: parseInt(contact_id),
      details: `Email sent to ${to_email}: ${subject}`,
      ip_address: getClientIp(request),
    })

    if (emailStatus === 'failed') {
      return NextResponse.json(
        { success: false, error: `Failed to send email: ${errorMessage}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    })
  } catch (error) {
    console.error('Send email API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

// GET - Get email history for a contact
export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const contact_id = searchParams.get('contact_id')

    if (!contact_id) {
      return NextResponse.json(
        { success: false, error: 'Contact ID is required' },
        { status: 400 }
      )
    }

    const [rows] = await pool.execute(
      'SELECT * FROM email_history WHERE contact_id = ? ORDER BY sent_at DESC',
      [contact_id]
    )

    return NextResponse.json({
      success: true,
      emails: rows,
    })
  } catch (error) {
    console.error('Get email history error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email history' },
      { status: 500 }
    )
  }
}



