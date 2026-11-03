import { NextResponse } from 'next/server'
import { bookingSchema, fieldErrors, looksLikeSpam, pick } from '@/lib/validations'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { isAllowedAttachment, maxUploadBytes, sniffFileType } from '@/lib/uploads'
import { saveUpload } from '@/lib/upload-store'
import { attachmentUrl, createBookingInquiry } from '@/lib/inquiries'

export const runtime = 'nodejs'

const FIELDS = ['form', 'name', 'email', 'phone', 'serviceType', 'preferredDate', 'pickupAddress', 'destinationAddress', 'propertyType', 'itemDetails', 'description'] as const
const SUCCESS_MESSAGE =
  "Thank you! Your request has been received. This is not a confirmed booking yet. Our team will contact you shortly to confirm the details."

const fail = (status: number, message: string, errors?: Record<string, string[] | undefined>) =>
  NextResponse.json({ success: false, message, ...(errors ? { errors } : {}) }, { status })

export async function POST(req: Request) {
  const max = maxUploadBytes()
  if (Number(req.headers.get('content-length') ?? 0) > max + 64 * 1024) return fail(413, 'The attached file is too large.')

  let fd: FormData
  try {
    fd = await req.formData()
  } catch {
    return fail(400, 'Invalid form submission.')
  }

  try {
    const limit = await rateLimit(`booking:${clientIp(req.headers)}`, 5, 600)
    if (!limit.ok) return fail(429, 'Too many requests. Please wait a few minutes or call us directly.')
  } catch {
    return fail(503, 'We could not save your request right now. Please call or email us instead.')
  }

  // Bots get a normal-looking response so they do not retry.
  if (looksLikeSpam(fd.get('company'), fd.get('startedAt'))) return NextResponse.json({ success: true, message: SUCCESS_MESSAGE })

  const parsed = bookingSchema.safeParse(pick(fd, FIELDS))
  if (!parsed.success) return fail(422, 'Please check the highlighted fields.', fieldErrors(parsed.error))

  let attachment = ''
  const file = fd.get('attachment')
  if (file instanceof File && file.size > 0) {
    if (parsed.data.serviceType !== 'moving') return fail(422, 'Attachments are only accepted for moving requests.')
    if (file.size > max) return fail(413, `The attachment must be under ${Math.floor(max / 1024 / 1024)} MB.`, { attachment: ['File is too large'] })
    const buf = Buffer.from(await file.arrayBuffer())
    const type = sniffFileType(buf)
    if (!isAllowedAttachment(type)) return fail(422, 'Please attach a PDF, JPG, PNG, WebP or GIF file.', { attachment: ['Unsupported file type'] })
    try {
      const saved = await saveUpload('bookings', buf, type)
      attachment = attachmentUrl(saved.filename)
    } catch {
      return fail(503, 'We could not save your attachment. Please try again or email it to us.')
    }
  }

  try {
    await createBookingInquiry(parsed.data, attachment)
  } catch {
    return fail(503, 'We could not save your request right now. Please call or email us instead.')
  }
  return NextResponse.json({ success: true, message: SUCCESS_MESSAGE })
}
