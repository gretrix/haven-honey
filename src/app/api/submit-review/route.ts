import { NextRequest, NextResponse } from 'next/server'
import { insertReviewSubmission, initializeDatabase } from '@/lib/db'
import { saveUploadedFile } from '@/lib/upload'

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

    // Parse form data
    const formData = await request.formData()
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const starRating = formData.get('star_rating') as string
    const serviceCategory = formData.get('service_category') as string
    const reviewText = formData.get('review_text') as string
    const screenshot = formData.get('screenshot') as File
    const recaptchaToken = formData.get('recaptchaToken') as string

    // Validate required fields
    if (!name || !email || !starRating || !serviceCategory || !screenshot) {
      return NextResponse.json(
        { success: false, error: 'Name, email, rating, category, and screenshot are required' },
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

    // Validate star rating
    const rating = parseInt(starRating)
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5 stars' },
        { status: 400 }
      )
    }

    // Validate screenshot file
    if (!screenshot || screenshot.size === 0) {
      return NextResponse.json(
        { success: false, error: 'Please upload a screenshot of your review' },
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

    // Upload screenshot
    const uploadResult = await saveUploadedFile(screenshot, 'reviews')
    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error || 'Failed to upload screenshot' },
        { status: 400 }
      )
    }

    // Store in database
    try {
      await insertReviewSubmission({
        reviewer_name: name,
        reviewer_email: email,
        star_rating: rating,
        service_category: serviceCategory,
        review_text: reviewText || undefined,
        screenshot_url: uploadResult.url,
      })
    } catch (dbError) {
      console.error('Database insert error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to save review submission' },
        { status: 500 }
      )
    }

    // TODO: Optional - Send confirmation email to user and notification to Linda
    // This would be similar to the contact form emails

    return NextResponse.json({
      success: true,
      message: 'Thank you for submitting your review! It will be reviewed and published soon.',
    })
  } catch (error) {
    console.error('Review submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

