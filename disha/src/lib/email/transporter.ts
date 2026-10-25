import nodemailer from 'nodemailer';

export const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // If SMTP credentials aren't configured in dev, log to console gracefully
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your-email@gmail.com') {
    console.log(`[DEV EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);
    console.log(`[HTML Content]:\n${html}`);
    return { messageId: 'simulated-dev-email-id' };
  }

  return emailTransporter.sendMail({
    from: process.env.EMAIL_FROM || 'Disha <noreply@disha.app>',
    to,
    subject,
    html,
  });
}
