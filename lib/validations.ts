import { z } from 'zod'
import { serviceTypes } from '@/lib/content'
import { isAllowedImageUrl } from '@/lib/uploads'

const text = (max: number) => z.string().trim().max(max, `Please keep this under ${max} characters`)
const optionalText = (max: number) => text(max).optional().default('')
const email = z.string().trim().toLowerCase().max(200).pipe(z.email('Please enter a valid email address'))
const phone = z
  .string()
  .trim()
  .regex(/^(?=(?:\D*\d){7,15}\D*$)[+()\d\s.-]{7,25}$/, 'Please enter a valid phone number')

/** YYYY-MM-DD, today or later (Toronto local date is close enough for a preference field). */
const preferredDate = z
  .string()
  .trim()
  .optional()
  .default('')
  .refine((v) => v === '' || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))), 'Please choose a valid date')
  .refine((v) => v === '' || v >= new Date(Date.now() - 864e5).toISOString().slice(0, 10), 'Please choose a date in the future')

export const bookingSchema = z
  .object({
    form: z.enum(['quick', 'full']).default('full'),
    name: text(120).min(2, 'Please enter your name'),
    email,
    phone,
    serviceType: z.enum(serviceTypes, { error: 'Please choose a service' }),
    preferredDate,
    pickupAddress: optionalText(300),
    destinationAddress: optionalText(300),
    propertyType: optionalText(60),
    itemDetails: optionalText(2000),
    description: text(4000).min(10, 'Please tell us a little more about your request (at least 10 characters)'),
  })
  .superRefine((v, ctx) => {
    if (v.form !== 'full') return
    const need = (field: 'pickupAddress' | 'destinationAddress' | 'itemDetails', message: string) => {
      if (!v[field]) ctx.addIssue({ code: 'custom', path: [field], message })
    }
    if (v.serviceType === 'moving') {
      need('pickupAddress', 'Please enter the address you are moving from')
      need('destinationAddress', 'Please enter the address you are moving to')
    }
    if (v.serviceType === 'delivery') {
      need('pickupAddress', 'Please enter the pickup location')
      need('destinationAddress', 'Please enter the delivery location')
      need('itemDetails', 'Please describe the item(s)')
    }
  })
export type BookingInput = z.infer<typeof bookingSchema>

export const contactSchema = z.object({
  name: text(120).min(2, 'Please enter your name'),
  email,
  phone: z.union([z.literal(''), phone]).optional().default(''),
  message: text(4000).min(10, 'Please write a short message (at least 10 characters)'),
})

/** Anti-spam: honeypot must be empty and the form must have been open for at least 3 seconds. */
export function looksLikeSpam(honeypot: unknown, startedAt: unknown, now = Date.now()): boolean {
  if (typeof honeypot === 'string' && honeypot.trim() !== '') return true
  const t = Number(startedAt)
  if (!Number.isFinite(t)) return true
  return now - t < 3000 || now - t > 1000 * 60 * 60 * 24
}

export const loginSchema = z.object({ email, password: z.string().min(1, 'Please enter your password').max(200) })

/* ---------- Admin content ---------- */
const imageUrl = z.string().trim().max(300).refine(isAllowedImageUrl, 'Unsupported image URL')
const checkbox = z.preprocess((v) => v === 'on' || v === 'true' || v === true, z.boolean())
const sortOrder = z.coerce.number().int().min(0).max(10000).default(0)

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '')
}

export const blogPostSchema = z
  .strictObject({
    title: text(160).min(3, 'Please enter a title'),
    slug: optionalText(80),
    excerpt: optionalText(400),
    content: optionalText(60000),
    featuredImageUrl: imageUrl.optional().default(''),
    status: z.enum(['draft', 'published']),
    publishedAt: z
      .string()
      .trim()
      .optional()
      .default('')
      .refine((v) => v === '' || !Number.isNaN(Date.parse(v)), 'Invalid date'),
    seoTitle: optionalText(70),
    seoDescription: optionalText(170),
  })
  .transform((v) => ({ ...v, slug: slugify(v.slug || v.title) }))
  .refine((v) => v.slug.length > 0, { path: ['slug'], message: 'Please enter a slug using letters or numbers' })

export const faqSchema = z.strictObject({
  question: text(300).min(5, 'Please enter the question'),
  answer: text(3000).min(5, 'Please enter the answer'),
  sortOrder,
  isPublished: checkbox,
})

export const testimonialSchema = z.strictObject({
  customerName: text(120).min(2, 'Please enter the customer name'),
  quote: text(1500).min(5, 'Please enter the testimonial'),
  serviceType: z.enum([...serviceTypes, '']).default(''),
  sortOrder,
  isPublished: checkbox,
})

/** Only these two business settings are editable. Unknown keys are rejected, not ignored. */
export const contactSettingsSchema = z.strictObject({
  contactPhone: phone,
  contactEmail: email,
})

export const imageSettingsSchema = z.strictObject({
  homepageHeroImageUrl: imageUrl,
  movingImageUrl: imageUrl,
  deliveryImageUrl: imageUrl,
  tasksImageUrl: imageUrl,
  aboutImageUrl: imageUrl,
  galleryImageUrls: z.array(imageUrl.refine((v) => v !== '')).max(12),
})

export type FieldErrors = Record<string, string[] | undefined>
export const fieldErrors = (err: z.ZodError): FieldErrors => z.flattenError(err).fieldErrors as FieldErrors

/** Picks only allowlisted keys from FormData (mass-assignment guard before schema validation). */
export function pick(fd: FormData, keys: readonly string[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const k of keys) {
    const v = fd.get(k)
    if (typeof v === 'string') out[k] = v
  }
  return out
}
