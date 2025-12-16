import { NextRequest, NextResponse } from 'next/server'
import { insertContactSubmission, initializeDatabase } from '@/lib/db'
import { sendConfirmationEmail, sendNotificationEmail } from '@/lib/email'

// Initialize database on first request
let dbInitialized = false

export async function POST(request: NextRequest) {
  try {
    // Initialize database if not already done
    if (!dbInitialized) {
      try {
        await initializeDatabase()
        dbInitialized = true
      } catch (dbError) {
        console.error('Database initialization error:', dbError)
        // Continue anyway - table might already exist
      }
    }

    // Parse request body
    const body = await request.json()
    const { name, email, phone, message, recaptchaToken } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Verify reCAPTCHA token
    if (recaptchaToken) {
      try {
        const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY
        if (recaptchaSecret) {
          const recaptchaResponse = await fetch(
            'https://www.google.com/recaptcha/api/siteverify',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `secret=${recaptchaSecret}&response=${recaptchaToken}`,
            }
          )

          const recaptchaData = await recaptchaResponse.json()

          // Check if reCAPTCHA verification failed or score is too low
          if (!recaptchaData.success || recaptchaData.score < 0.5) {
            console.warn('reCAPTCHA verification failed:', recaptchaData)
            return NextResponse.json(
              { success: false, error: 'Bot detection failed. Please try again.' },
              { status: 400 }
            )
          }
        }
      } catch (recaptchaError) {
        console.error('reCAPTCHA verification error:', recaptchaError)
        // Continue anyway - don't block legitimate users if reCAPTCHA service is down
      }
    }

    // Store in database
    try {
      await insertContactSubmission({ name, email, phone, message })
    } catch (dbError) {
      console.error('Database insert error:', dbError)
      // Don't fail the whole request if DB fails - emails might still work
    }

    // Send emails in parallel
    const emailPromises = []

    // Send confirmation email to user
    emailPromises.push(
      sendConfirmationEmail(email, name).catch((err) => {
        console.error('Failed to send confirmation email:', err)
      })
    )

    // Send notification email to Linda
    emailPromises.push(
      sendNotificationEmail({ name, email, phone, message }).catch((err) => {
        console.error('Failed to send notification email:', err)
      })
    )

    await Promise.all(emailPromises)

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your message has been received.',
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}




