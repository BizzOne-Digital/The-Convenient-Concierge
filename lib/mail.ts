import 'server-only'
import nodemailer from 'nodemailer'

const configured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.SMTP_FROM && process.env.BOOKING_NOTIFICATION_EMAIL)

/** Optional notification. Never throws and never logs customer details. */
export async function notifyNewInquiry(summary: { serviceLabel: string; name: string; email: string; phone: string; description: string }) {
  if (!configured()) return
  try {
    const port = Number(process.env.SMTP_PORT ?? 587)
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    })
    await transport.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.BOOKING_NOTIFICATION_EMAIL,
      replyTo: summary.email,
      subject: `New ${summary.serviceLabel} request: ${summary.name}`,
      text: [
        `Service: ${summary.serviceLabel}`,
        `Name: ${summary.name}`,
        `Email: ${summary.email}`,
        `Phone: ${summary.phone || 'n/a'}`,
        '',
        summary.description,
        '',
        'View and manage this request in the admin portal.',
      ].join('\n'),
    })
  } catch (err) {
    console.error('[mail] notification failed:', (err as Error).message)
  }
}
