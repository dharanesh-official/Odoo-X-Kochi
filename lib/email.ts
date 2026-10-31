
import nodemailer from 'nodemailer'

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

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
    amount,
    dueDate,
    planName,
    quantity,
    subtotal,
    tax,
    total,
  } = data

  const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/invoices/${invoiceId}`

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; }
    .invoice-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .row { display: flex; justify-content: space-between; margin: 10px 0; }
    .total { font-size: 20px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
    .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ SubCheck</h1>
      <p>Subscription Management System</p>
    </div>
    
    <div class="content">
      <h2>Hi ${customerName},</h2>
      <p>Your invoice has been generated and is ready for review.</p>
      
      <div class="invoice-details">
        <h3>Invoice #${invoiceNumber}</h3>
        <div class="row">
          <span>Due Date:</span>
          <strong>${new Date(dueDate).toLocaleDateString('en-IN')}</strong>
        </div>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        
        <div class="row">
          <span>${planName} (${quantity} x ₹${(subtotal / quantity).toFixed(2)})</span>
          <span>₹${subtotal.toFixed(2)}</span>
        </div>
        
        <div class="row">
          <span>Subtotal:</span>
          <span>₹${subtotal.toFixed(2)}</span>
        </div>
        
        <div class="row">
          <span>Tax (18% GST):</span>
          <span>₹${tax.toFixed(2)}</span>
        </div>
        
        <div class="row total">
          <span>Total Amount Due:</span>
          <span>₹${total.toFixed(2)}</span>
        </div>
      </div>
      
      <center>
        <a href="${invoiceUrl}" class="button">View Invoice</a>
      </center>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Please ensure payment is made by the due date to avoid any service interruption.
      </p>
      
      <div style="margin-top: 40px; padding: 15px; background: #f0f0f0; border-left: 4px solid #4CAF50; font-size: 13px; color: #555;">
        <strong>Note:</strong> This is a computer-generated invoice and does not require any physical signature.
      </div>
    </div>
    
    <div class="footer">
      <p>This is an automated email from SubCheck Subscription Manager.</p>
      <p>If you have any questions, please contact us at admin@odoo-manager.com</p>
    </div>
  </div>
</body>
</html>
  `

  const textContent = `
Hi ${customerName},

Your invoice has been generated and is ready for review.

Invoice #${invoiceNumber}
Due Date: ${new Date(dueDate).toLocaleDateString('en-IN')}

${planName} (${quantity} x ₹${(subtotal / quantity).toFixed(2)}): ₹${subtotal.toFixed(2)}
Tax (18% GST): ₹${tax.toFixed(2)}
Total Amount Due: ₹${total.toFixed(2)}

View your invoice: ${invoiceUrl}

Please ensure payment is made by the due date to avoid any service interruption.

---
NOTE: This is a computer-generated invoice and does not require any physical signature.
---

This is an automated email from SubCheck Subscription Manager.
If you have any questions, please contact us at admin@odoo-manager.com
  `

  try {
    const info = await transporter.sendMail({
      from: `"SubCheck" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `Invoice #${invoiceNumber} - Amount Due: ₹${total.toFixed(2)}`,
      text: textContent,
      html: htmlContent,
    })

    console.log('Invoice email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending invoice email:', error)
    return { success: false, error: String(error) }
  }
}
