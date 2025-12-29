import nodemailer from 'nodemailer'

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

// Email templates
const getConfirmationEmailHtml = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You - Haven & Honey</title>
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
              <h2 style="margin: 0 0 20px; font-size: 24px; color: #4E3B32; font-weight: 500;">Thank You, ${name}!</h2>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.7; color: #6B5448;">
                Your message has been received and I'm so grateful you reached out. It truly means the world to me that you're interested in bringing a little more peace and sweetness into your home.
              </p>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.7; color: #6B5448;">
                I'll review your message and get back to you within 24-48 hours. In the meantime, feel free to follow along on my journey at <strong>Life With Linda</strong>.
              </p>
              <p style="margin: 0; font-size: 16px; line-height: 1.7; color: #6B5448;">
                With warmth and care,<br>
                <strong style="color: #4E3B32;">Linda</strong>
              </p>
            </td>
          </tr>
          
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

const getNotificationEmailHtml = (data: {
  name: string
  email: string
  phone?: string
  message: string
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact - Haven & Honey</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #F8F3EB;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #FDFBF7; border-radius: 16px; box-shadow: 0 4px 24px rgba(78, 59, 50, 0.1);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px; background-color: #8B9A7D; border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; font-size: 24px; color: #FDFBF7; font-weight: 500;">🌿 New Contact Submission</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; color: #6B5448;">
                You have a new message from the Haven & Honey website!
              </p>
              
              <!-- Details Card -->
              <div style="background-color: #F8F3EB; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #E5D9C5;">
                      <strong style="color: #4E3B32;">Name:</strong>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #E5D9C5; text-align: right; color: #6B5448;">
                      ${data.name}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #E5D9C5;">
                      <strong style="color: #4E3B32;">Email:</strong>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #E5D9C5; text-align: right;">
                      <a href="mailto:${data.email}" style="color: #8B9A7D;">${data.email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #E5D9C5;">
                      <strong style="color: #4E3B32;">Phone:</strong>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #E5D9C5; text-align: right; color: #6B5448;">
                      ${data.phone || 'Not provided'}
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Message -->
              <div style="background-color: #FDFBF7; padding: 24px; border: 2px solid #E5D9C5; border-radius: 12px;">
                <p style="margin: 0 0 12px; font-weight: bold; color: #4E3B32;">Message:</p>
                <p style="margin: 0; font-size: 16px; line-height: 1.7; color: #6B5448; white-space: pre-wrap;">
${data.message}
                </p>
              </div>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 0 40px 40px;">
              <a href="mailto:${data.email}" style="display: inline-block; padding: 14px 32px; background-color: #4E3B32; color: #FDFBF7; text-decoration: none; border-radius: 50px; font-weight: 500;">
                Reply to ${data.name}
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 20px 40px; background-color: #4E3B32; border-radius: 0 0 16px 16px;">
              <p style="margin: 0; font-size: 12px; color: #E5D9C5;">
                Submitted on ${new Date().toLocaleString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
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

// Send confirmation email to user
export async function sendConfirmationEmail(to: string, name: string) {
  const mailOptions = {
    from: `"Haven & Honey" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: 'Thank You for Reaching Out! 🌿 - Haven & Honey',
    html: getConfirmationEmailHtml(name),
  }

  await transporter.sendMail(mailOptions)
}

// Send notification email to Linda
export async function sendNotificationEmail(data: {
  name: string
  email: string
  phone?: string
  message: string
}) {
  const mailOptions = {
    from: `"Haven & Honey Website" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: process.env.LINDA_EMAIL || 'linda@havenhoney.co',
    subject: `New Contact: ${data.name} - Haven & Honey`,
    html: getNotificationEmailHtml(data),
    replyTo: data.email,
  }

  await transporter.sendMail(mailOptions)
}

// Send mass email to contacts
export async function sendMassEmail(
  to: string,
  recipientName: string,
  subject: string,
  messageContent: string,
  imageDataArray?: string[]
) {
  // Use CID (Content-ID) for embedded images instead of base64 data URLs
  let imageHtml = ''
  if (imageDataArray && imageDataArray.length > 0) {
    imageHtml = imageDataArray.map((_, index) => `
          <!-- Image ${index + 1} -->
          <tr>
            <td align="center" style="padding: 20px 40px;">
              <img src="cid:emailImage${index}" alt="Email attachment ${index + 1}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 2px 8px rgba(78, 59, 50, 0.1);" />
            </td>
          </tr>
    `).join('')
  }

  const html = `
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
                Hello ${recipientName},
              </p>
              <div style="margin: 0; font-size: 16px; line-height: 1.7; color: #6B5448; white-space: pre-wrap;">
${messageContent}
              </div>
              <p style="margin: 20px 0 0; font-size: 16px; line-height: 1.7; color: #6B5448;">
                With warmth and care,<br>
                <strong style="color: #4E3B32;">Linda</strong><br>
                <span style="color: #8B9A7D; font-size: 14px;">Haven & Honey</span>
              </p>
            </td>
          </tr>
          ${imageHtml}
          
          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 20px 40px;">
              <a href="https://havenhoney.co/contact" style="display: inline-block; padding: 14px 32px; background-color: #4E3B32; color: #FDFBF7; text-decoration: none; border-radius: 50px; font-weight: 500;">
                Visit Haven & Honey
              </a>
            </td>
          </tr>
          
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

  const mailOptions: any = {
    from: `"Haven & Honey" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    replyTo: process.env.LINDA_EMAIL || 'linda@havenhoney.co',
  }

  // Add images as CID attachments if present
  if (imageDataArray && imageDataArray.length > 0) {
    mailOptions.attachments = imageDataArray.map((imageData, index) => {
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

  await transporter.sendMail(mailOptions)
}




