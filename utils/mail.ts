
import nodemailer from 'nodemailer';

export async function sendWelcomeEmail(email: string, name: string) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("Skipping welcome email: SMTP_USER or SMTP_PASS not set.");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0f172a; font-size: 24px; font-weight: bold; margin: 0;">Welcome to SubCheck! 🚀</h1>
      </div>
      
      <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello ${name},</p>
      
      <p style="color: #334155; font-size: 16px; line-height: 1.6;">
        We are thrilled to have you on board! You've taken the first step towards mastering your subscription business.
      </p>

      <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; color: #475569; font-style: italic;">
          "The secret of getting ahead is getting started."
        </p>
      </div>

      <p style="color: #334155; font-size: 16px; line-height: 1.6;">
        If you have any questions, feel free to reply to this email. We're here to help!
      </p>

      <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 14px; margin: 0;">
          The SubCheck Team
        </p>
      </div>
    </div>
  `;

    try {
        await transporter.sendMail({
            from: `"SubCheck Team" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Welcome to SubCheck! Let's get started.",
            html: html,
        });
        console.log(`Welcome email sent to ${email}`);
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
}
