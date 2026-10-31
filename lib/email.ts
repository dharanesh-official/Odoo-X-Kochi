import nodemailer from 'nodemailer'

/**
 * Clean and normalize Google App Password (strips whitespace)
 */
function getTransporter() {
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '')

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
  })
}

const BRAND_NAME = 'SubCheck'
const FROM_HEADER = () => `"${BRAND_NAME} Team" <${process.env.SMTP_USER || 'no-reply@subcheck.com'}>`
const APP_URL = () => (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

// ==============================================================================
// 1. CONFIRMATION / VERIFICATION EMAIL (Sent via Gmail SMTP with greetings)
// ==============================================================================
export interface ConfirmationEmailData {
  email: string
  name: string
  confirmationUrl: string
}

export async function sendConfirmationEmail(data: ConfirmationEmailData) {
  const { email, name, confirmationUrl } = data

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 36px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; color: #94a3b8; font-size: 14px; }
    .content { padding: 36px 32px; }
    .greeting { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 14px 36px; font-weight: 600; font-size: 15px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25); }
    .note-box { background: #f1f5f9; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 4px; font-size: 13px; color: #475569; margin: 24px 0; }
    .raw-link { word-break: break-all; font-size: 12px; color: #64748b; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px dashed #cbd5e1; }
    .footer { text-align: center; color: #94a3b8; font-size: 12px; padding: 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>⚡ ${BRAND_NAME}</h1>
      <p>Subscription Lifecycle Management System</p>
    </div>
    <div class="content">
      <div class="greeting">Greetings from ${BRAND_NAME}, ${name}! 👋</div>
      <p>Thank you for creating an account. We are thrilled to welcome you to our subscription platform.</p>
      <p>To finalize your registration and activate your account, please confirm your email address by clicking the button below:</p>

      <div class="btn-container">
        <a href="${confirmationUrl}" class="btn" target="_blank">Confirm My Email Address</a>
      </div>

      <div class="note-box">
        <strong>Security Notice:</strong> This confirmation link will expire in 24 hours. If you did not create an account with us, please disregard this email.
      </div>

      <p style="font-size: 13px; color: #64748b; margin-bottom: 6px;">Button not working? Copy and paste this URL into your browser:</p>
      <div class="raw-link">${confirmationUrl}</div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${BRAND_NAME} Software. All rights reserved.</p>
      <p>Sent from Gmail SMTP service.</p>
    </div>
  </div>
</body>
</html>
  `

  const textContent = `
Greetings from ${BRAND_NAME}, ${name}!

Thank you for creating an account with ${BRAND_NAME}.
Please verify your email address by clicking the link below:

${confirmationUrl}

This link is valid for 24 hours. If you did not request this, please ignore this email.

Best regards,
The ${BRAND_NAME} Team
  `

  try {
    const transporter = getTransporter()
    const info = await transporter.sendMail({
      from: FROM_HEADER(),
      to: email,
      subject: `Welcome to ${BRAND_NAME}! Confirm your email address`,
      text: textContent,
      html: htmlContent,
    })
    console.log('[EmailService] Confirmation email sent to:', email, 'MessageId:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('[EmailService] Failed to send confirmation email via Gmail SMTP:', error?.message || error)
    return { success: false, error: String(error?.message || error) }
  }
}

// ==============================================================================
// 2. FORGOT PASSWORD / PASSWORD RESET EMAIL
// ==============================================================================
export interface PasswordResetEmailData {
  email: string
  name: string
  resetUrl: string
}

export async function sendPasswordResetEmail(data: PasswordResetEmailData) {
  const { email, name, resetUrl } = data

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 36px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .content { padding: 36px 32px; }
    .greeting { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: #dc2626; color: #ffffff !important; padding: 14px 36px; font-weight: 600; font-size: 15px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.25); }
    .warning-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 18px; border-radius: 4px; font-size: 13px; color: #991b1b; margin: 24px 0; }
    .raw-link { word-break: break-all; font-size: 12px; color: #64748b; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px dashed #cbd5e1; }
    .footer { text-align: center; color: #94a3b8; font-size: 12px; padding: 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>⚡ ${BRAND_NAME}</h1>
      <p style="margin: 6px 0 0; color: #94a3b8; font-size: 14px;">Password Recovery Request</p>
    </div>
    <div class="content">
      <div class="greeting">Hello ${name},</div>
      <p>We received a request to reset the password associated with your <strong>${BRAND_NAME}</strong> account.</p>
      <p>Click the button below to set a new password:</p>

      <div class="btn-container">
        <a href="${resetUrl}" class="btn" target="_blank">Reset My Password</a>
      </div>

      <div class="warning-box">
        <strong>Important:</strong> This password reset link is time-sensitive and will expire shortly. If you did not request a password reset, please ignore this email or reach out to support if you have concerns.
      </div>

      <p style="font-size: 13px; color: #64748b; margin-bottom: 6px;">Button not working? Paste this URL into your browser:</p>
      <div class="raw-link">${resetUrl}</div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${BRAND_NAME} Software. All rights reserved.</p>
      <p>Delivered securely via Gmail SMTP.</p>
    </div>
  </div>
</body>
</html>
  `

  const textContent = `
Hello ${name},

We received a request to reset your ${BRAND_NAME} account password.

To set a new password, click the link below:
${resetUrl}

If you did not make this request, you can safely ignore this email.

Best regards,
The ${BRAND_NAME} Team
  `

  try {
    const transporter = getTransporter()
    const info = await transporter.sendMail({
      from: FROM_HEADER(),
      to: email,
      subject: `Reset your ${BRAND_NAME} password`,
      text: textContent,
      html: htmlContent,
    })
    console.log('[EmailService] Password reset email sent to:', email, 'MessageId:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('[EmailService] Failed to send password reset email via Gmail SMTP:', error?.message || error)
    return { success: false, error: String(error?.message || error) }
  }
}

// ==============================================================================
// 3. WELCOME ONBOARDING EMAIL (Sent upon confirmation or immediate sign-in)
// ==============================================================================
export async function sendWelcomeEmail(email: string, name: string) {
  const dashboardUrl = `${APP_URL()}/dashboard`

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #059669 0%, #0f766e 100%); color: #ffffff; padding: 40px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .content { padding: 36px 32px; }
    .greeting { font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; }
    .feature-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .feature-title { font-weight: 600; color: #0f172a; margin-bottom: 4px; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: #059669; color: #ffffff !important; padding: 14px 36px; font-weight: 600; font-size: 15px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.25); }
    .footer { text-align: center; color: #94a3b8; font-size: 12px; padding: 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🚀 Welcome to ${BRAND_NAME}!</h1>
      <p style="margin: 6px 0 0; color: #a7f3d0; font-size: 14px;">Your subscription command center is ready</p>
    </div>
    <div class="content">
      <div class="greeting">Hi ${name}, welcome aboard! 👋</div>
      <p>We are excited to have you with us. Your account is verified and ready for action. Here is what you can do right now:</p>

      <div class="feature-card">
        <div class="feature-title">📦 Flexible Subscriptions</div>
        <div style="font-size: 13px; color: #64748b;">Browse tailored plans, start trials, and manage recurring services seamlessly.</div>
      </div>

      <div class="feature-card">
        <div class="feature-title">🧾 Instant Invoices & Receipts</div>
        <div style="font-size: 13px; color: #64748b;">Access computer-generated PDF invoices, view transparent GST tax breakdowns, and track payment history.</div>
      </div>

      <div class="feature-card">
        <div class="feature-title">💳 Secure Payments</div>
        <div style="font-size: 13px; color: #64748b;">Instant settlements through Stripe and Razorpay with complete balance tracking.</div>
      </div>

      <div class="btn-container">
        <a href="${dashboardUrl}" class="btn" target="_blank">Go to My Dashboard</a>
      </div>

      <p style="font-size: 13px; color: #64748b;">Need help or have questions? Simply reply to this email anytime — our team is here for you.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${BRAND_NAME} Software. All rights reserved.</p>
      <p>Sent via Gmail SMTP.</p>
    </div>
  </div>
</body>
</html>
  `

  const textContent = `
Hi ${name}, welcome aboard to ${BRAND_NAME}! 🚀

Your account is now fully active. You can browse subscriptions, view invoices, and manage payment methods directly from your customer dashboard:

${dashboardUrl}

Need assistance? Reply to this email anytime.

Warm regards,
The ${BRAND_NAME} Team
  `

  try {
    const transporter = getTransporter()
    const info = await transporter.sendMail({
      from: FROM_HEADER(),
      to: email,
      subject: `Welcome to ${BRAND_NAME}! Your account is active 🚀`,
      text: textContent,
      html: htmlContent,
    })
    console.log('[EmailService] Welcome email sent to:', email, 'MessageId:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('[EmailService] Failed to send welcome email via Gmail SMTP:', error?.message || error)
    return { success: false, error: String(error?.message || error) }
  }
}

// ==============================================================================
// 4. INVOICE NOTIFICATION EMAIL
// ==============================================================================
export interface InvoiceEmailData {
  customerName: string
  customerEmail: string
  invoiceId: string
  invoiceNumber: string
  amount: number
  dueDate: string
  planName: string
  quantity: number
  subtotal: number
  tax: number
  total: number
}

export async function sendInvoiceEmail(data: InvoiceEmailData) {
  const {
    customerName,
    customerEmail,
    invoiceId,
    invoiceNumber,
    dueDate,
    planName,
    quantity,
    subtotal,
    tax,
    total,
  } = data

  const invoiceUrl = `${APP_URL()}/dashboard/invoices/${invoiceId}`

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 36px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 800; }
    .content { padding: 36px 32px; }
    .greeting { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; }
    .invoice-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .row { display: flex; justify-content: space-between; margin: 10px 0; font-size: 14px; }
    .total-row { font-size: 18px; font-weight: 700; border-top: 2px solid #0f172a; padding-top: 12px; margin-top: 12px; color: #0f172a; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: #059669; color: #ffffff !important; padding: 14px 36px; font-weight: 600; font-size: 15px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.25); }
    .footer { text-align: center; color: #94a3b8; font-size: 12px; padding: 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>⚡ ${BRAND_NAME}</h1>
      <p style="margin: 6px 0 0; color: #94a3b8; font-size: 14px;">Invoice Issued #${invoiceNumber}</p>
    </div>
    <div class="content">
      <div class="greeting">Greetings, ${customerName}! 👋</div>
      <p>A new invoice has been generated for your active subscription and is ready for payment.</p>

      <div class="invoice-card">
        <div style="font-weight: 700; font-size: 16px; margin-bottom: 12px;">Invoice #${invoiceNumber}</div>
        <div class="row">
          <span style="color: #64748b;">Due Date:</span>
          <strong>${new Date(dueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</strong>
        </div>
        <hr style="margin: 14px 0; border: none; border-top: 1px solid #e2e8f0;">
        <div class="row">
          <span>${planName} (x${quantity})</span>
          <span>₹${subtotal.toFixed(2)}</span>
        </div>
        <div class="row">
          <span>Tax (GST)</span>
          <span>₹${tax.toFixed(2)}</span>
        </div>
        <div class="row total-row">
          <span>Total Amount Due:</span>
          <span>₹${total.toFixed(2)}</span>
        </div>
      </div>

      <div class="btn-container">
        <a href="${invoiceUrl}" class="btn" target="_blank">View & Pay Invoice</a>
      </div>

      <p style="font-size: 13px; color: #64748b;">
        Please settle this invoice before the due date to ensure continuous uninterrupted service.
      </p>
    </div>
    <div class="footer">
      <p>This is a computer-generated invoice from ${BRAND_NAME}.</p>
      <p>Delivered via Gmail SMTP.</p>
    </div>
  </div>
</body>
</html>
  `

  const textContent = `
Greetings, ${customerName}!

A new invoice has been generated for your subscription.

Invoice #${invoiceNumber}
Due Date: ${new Date(dueDate).toLocaleDateString('en-IN')}
Total Amount Due: ₹${total.toFixed(2)}

View and pay your invoice: ${invoiceUrl}

Best regards,
The ${BRAND_NAME} Team
  `

  try {
    const transporter = getTransporter()
    const info = await transporter.sendMail({
      from: FROM_HEADER(),
      to: customerEmail,
      subject: `Invoice #${invoiceNumber} from ${BRAND_NAME} - Due ₹${total.toFixed(2)}`,
      text: textContent,
      html: htmlContent,
    })
    console.log('[EmailService] Invoice email sent to:', customerEmail, 'MessageId:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('[EmailService] Failed to send invoice email via Gmail SMTP:', error?.message || error)
    return { success: false, error: String(error?.message || error) }
  }
}
