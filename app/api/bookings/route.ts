import { NextResponse } from 'next/server'
import { MAX_PHOTOS, bookingSchema, fieldErrors, looksLikeSpam, pick } from '@/lib/validations'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { PRIVATE_FOLDER, isAllowedAttachment, isAllowedImage, maxUploadBytes, sniffFileType, type Sniffed } from '@/lib/uploads'
import { saveUpload } from '@/lib/upload-store'
import { attachmentUrl, createBookingInquiry } from '@/lib/inquiries'
import { StoredUpload } from '@/models'

export const runtime = 'nodejs'

const FIELDS = [
  'form',
  'name',
  'email',
  'phone',
  'serviceType',
  'preferredDate',
  'pickupAddress',
  'destinationAddress',
  'propertyType',
  'accessDetails',
  'packing',
  'itemDetails',
  'description',
] as const
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

  // Validate every file before storing any of them.
  const nonEmpty = (v: FormDataEntryValue | null): v is File => v instanceof File && v.size > 0
  const checklist = fd.get('attachment')
  const photos = fd.getAll('photos').filter(nonEmpty)
  const files: { field: 'attachment' | 'photos'; buf: Buffer; type: Sniffed }[] = []
  if (nonEmpty(checklist) || photos.length) {
    if (parsed.data.serviceType !== 'moving') return fail(422, 'Attachments are only accepted for moving requests.')
    if (photos.length > MAX_PHOTOS) return fail(422, `Please attach up to ${MAX_PHOTOS} photos.`, { photos: [`Up to ${MAX_PHOTOS} photos`] })
    for (const [field, file] of [...(nonEmpty(checklist) ? [['attachment', checklist] as const] : []), ...photos.map((p) => ['photos', p] as const)]) {
      if (file.size > max) return fail(413, `Attachments must be under ${Math.floor(max / 1024 / 1024)} MB in total.`, { [field]: ['File is too large'] })
      const buf = Buffer.from(await file.arrayBuffer())
      const type = sniffFileType(buf)
      if (field === 'attachment' && !isAllowedAttachment(type))
        return fail(422, 'Please attach a PDF, JPG, PNG, WebP or GIF file.', { attachment: ['Unsupported file type'] })
      if (field === 'photos' && !isAllowedImage(type)) return fail(422, 'Photos must be JPG, PNG, WebP or GIF images.', { photos: ['Unsupported file type'] })
      files.push({ field, buf, type: type! })
    }
  }

  const saved: string[] = []
  const cleanup = () => StoredUpload.deleteMany({ folder: PRIVATE_FOLDER, filename: { $in: saved } }).catch(() => {})
  let attachment = ''
  const photoUrls: string[] = []
  try {
    for (const f of files) {
      const { filename } = await saveUpload(PRIVATE_FOLDER, f.buf, f.type)
      saved.push(filename)
      if (f.field === 'attachment') attachment = attachmentUrl(filename)
      else photoUrls.push(attachmentUrl(filename))
    }
  } catch {
    await cleanup()
    return fail(503, 'We could not save your attachments. Please try again or email them to us.')
  }

  try {
    await createBookingInquiry(parsed.data, attachment, photoUrls)
  } catch {
    await cleanup()
    return fail(503, 'We could not save your request right now. Please call or email us instead.')
  }
  return NextResponse.json({ success: true, message: SUCCESS_MESSAGE })
}
