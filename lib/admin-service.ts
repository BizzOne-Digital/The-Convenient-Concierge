import 'server-only'
import { Types } from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { cleanupReplaced, deleteUploadIfUnreferenced } from '@/lib/upload-store'
import { parseUploadUrl, isValidFilename, PRIVATE_FOLDER } from '@/lib/uploads'
import {
  blogPostSchema,
  contactSettingsSchema,
  faqSchema,
  fieldErrors,
  imageSettingsSchema,
  testimonialSchema,
  type FieldErrors,
} from '@/lib/validations'
import { BlogPost, BookingInquiry, bookingStatuses, FAQ, SiteSettings, StoredUpload, Testimonial } from '@/models'

export type Result = { ok: true; id?: string } | { ok: false; error: string; errors?: FieldErrors }
const invalid = (errors: FieldErrors): Result => ({ ok: false, error: 'Please correct the highlighted fields.', errors })
const oid = (id: string) => (Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null)

/* ---------- Dashboard ---------- */
export async function getDashboardStats() {
  await connectDB()
  const [byStatus, posts, faqs, testimonials] = await Promise.all([
    BookingInquiry.aggregate<{ _id: string; n: number }>([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    BlogPost.countDocuments({ status: 'published' }),
    FAQ.countDocuments({ isPublished: true }),
    Testimonial.countDocuments({ isPublished: true }),
  ])
  const count = (s: string) => byStatus.find((r) => r._id === s)?.n ?? 0
  return {
    total: byStatus.reduce((a, r) => a + r.n, 0),
    new: count('new'),
    contacted: count('contacted'),
    inProgress: count('in-progress'),
    completed: count('completed'),
    archived: count('archived'),
    posts,
    faqs,
    testimonials,
  }
}

/* ---------- Booking inquiries ---------- */
export async function updateBookingStatus(id: string, input: { status?: unknown }): Promise<Result> {
  const _id = oid(id)
  if (!_id) return { ok: false, error: 'Request not found.' }
  if (typeof input.status !== 'string' || !(bookingStatuses as readonly string[]).includes(input.status))
    return { ok: false, error: 'Invalid status.' }
  await connectDB()
  // Only `status` is ever written, whatever else the caller sends.
  const res = await BookingInquiry.updateOne({ _id }, { $set: { status: input.status } })
  return res.matchedCount ? { ok: true } : { ok: false, error: 'Request not found.' }
}

export async function deleteBooking(id: string): Promise<Result> {
  const _id = oid(id)
  if (!_id) return { ok: false, error: 'Request not found.' }
  await connectDB()
  const doc = await BookingInquiry.findOneAndDelete({ _id }).lean()
  if (!doc) return { ok: false, error: 'Request not found.' }
  const filenames = [doc.attachmentUrl, ...(doc.photoUrls ?? [])].map((u) => u?.split('/').pop()).filter(isValidFilename)
  if (filenames.length) await StoredUpload.deleteMany({ folder: PRIVATE_FOLDER, filename: { $in: filenames } })
  return { ok: true }
}

/* ---------- Blog ---------- */
export async function saveBlogPost(id: string | null, raw: Record<string, string>): Promise<Result> {
  const parsed = blogPostSchema.safeParse(raw)
  if (!parsed.success) return invalid(fieldErrors(parsed.error))
  const v = parsed.data
  await connectDB()
  const _id = id ? oid(id) : null
  if (id && !_id) return { ok: false, error: 'Post not found.' }

  const clash = await BlogPost.exists({ slug: v.slug, ...(_id ? { _id: { $ne: _id } } : {}) })
  if (clash) return invalid({ slug: ['Another post already uses this slug'] })

  const existing = _id ? await BlogPost.findById(_id).lean() : null
  if (_id && !existing) return { ok: false, error: 'Post not found.' }

  let publishedAt: Date | null = v.publishedAt ? new Date(v.publishedAt) : (existing?.publishedAt ?? null)
  if (v.status === 'published' && !publishedAt) publishedAt = new Date()

  const doc = {
    title: v.title,
    slug: v.slug,
    excerpt: v.excerpt,
    content: v.content,
    featuredImageUrl: v.featuredImageUrl,
    status: v.status,
    publishedAt,
    seoTitle: v.seoTitle,
    seoDescription: v.seoDescription,
  }
  try {
    if (_id) {
      await BlogPost.updateOne({ _id }, { $set: doc })
      await cleanupReplaced([existing?.featuredImageUrl], [v.featuredImageUrl])
      return { ok: true, id: String(_id) }
    }
    const created = await BlogPost.create(doc)
    return { ok: true, id: String(created._id) }
  } catch {
    if (v.featuredImageUrl !== existing?.featuredImageUrl) await deleteUploadIfUnreferenced(v.featuredImageUrl)
    return { ok: false, error: 'The post could not be saved. Please try again.' }
  }
}

export async function deleteBlogPost(id: string): Promise<Result> {
  const _id = oid(id)
  if (!_id) return { ok: false, error: 'Post not found.' }
  await connectDB()
  const doc = await BlogPost.findOneAndDelete({ _id }).lean()
  if (!doc) return { ok: false, error: 'Post not found.' }
  await deleteUploadIfUnreferenced(doc.featuredImageUrl)
  return { ok: true }
}

/* ---------- FAQ ---------- */
export async function saveFaq(id: string | null, raw: Record<string, string>): Promise<Result> {
  const parsed = faqSchema.safeParse(raw)
  if (!parsed.success) return invalid(fieldErrors(parsed.error))
  await connectDB()
  try {
    if (id) {
      const _id = oid(id)
      if (!_id) return { ok: false, error: 'FAQ not found.' }
      await FAQ.updateOne({ _id }, { $set: parsed.data })
      return { ok: true, id }
    }
    const last = await FAQ.findOne().sort({ sortOrder: -1 }).lean()
    const created = await FAQ.create({ ...parsed.data, sortOrder: raw.sortOrder ? parsed.data.sortOrder : (last?.sortOrder ?? 0) + 10 })
    return { ok: true, id: String(created._id) }
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return invalid({ question: ['This question already exists'] })
    return { ok: false, error: 'The FAQ could not be saved.' }
  }
}

/** Swaps sort order with the neighbour above/below. */
export async function moveFaq(id: string, direction: 'up' | 'down'): Promise<Result> {
  const _id = oid(id)
  if (!_id) return { ok: false, error: 'FAQ not found.' }
  await connectDB()
  const list = await FAQ.find().sort({ sortOrder: 1, createdAt: 1 }).select('_id').lean()
  const i = list.findIndex((f) => String(f._id) === id)
  const j = direction === 'up' ? i - 1 : i + 1
  if (i < 0 || j < 0 || j >= list.length) return { ok: true }
  const order = list.map((f) => f._id)
  ;[order[i], order[j]] = [order[j]!, order[i]!]
  await FAQ.bulkWrite(order.map((fid, idx) => ({ updateOne: { filter: { _id: fid }, update: { $set: { sortOrder: (idx + 1) * 10 } } } })))
  return { ok: true }
}

export async function deleteFaq(id: string): Promise<Result> {
  const _id = oid(id)
  if (!_id) return { ok: false, error: 'FAQ not found.' }
  await connectDB()
  await FAQ.deleteOne({ _id })
  return { ok: true }
}

/* ---------- Testimonials ---------- */
export async function saveTestimonial(id: string | null, raw: Record<string, string>): Promise<Result> {
  const parsed = testimonialSchema.safeParse(raw)
  if (!parsed.success) return invalid(fieldErrors(parsed.error))
  await connectDB()
  if (id) {
    const _id = oid(id)
    if (!_id) return { ok: false, error: 'Testimonial not found.' }
    await Testimonial.updateOne({ _id }, { $set: parsed.data })
    return { ok: true, id }
  }
  const created = await Testimonial.create(parsed.data)
  return { ok: true, id: String(created._id) }
}

export async function deleteTestimonial(id: string): Promise<Result> {
  const _id = oid(id)
  if (!_id) return { ok: false, error: 'Testimonial not found.' }
  await connectDB()
  await Testimonial.deleteOne({ _id })
  return { ok: true }
}

/* ---------- Limited site settings ---------- */
export async function updateContactSettings(input: unknown): Promise<Result> {
  const parsed = contactSettingsSchema.safeParse(input)
  if (!parsed.success) return invalid(fieldErrors(parsed.error))
  await connectDB()
  await SiteSettings.updateOne({ key: 'site' }, { $set: parsed.data }, { upsert: true })
  return { ok: true }
}

export async function updateImageSettings(input: unknown): Promise<Result> {
  const parsed = imageSettingsSchema.safeParse(input)
  if (!parsed.success) return invalid(fieldErrors(parsed.error))
  const next = parsed.data
  await connectDB()
  const before = await SiteSettings.findOne({ key: 'site' }).lean()
  const oldUrls = [before?.homepageHeroImageUrl, before?.movingImageUrl, before?.deliveryImageUrl, before?.tasksImageUrl, before?.aboutImageUrl, ...(before?.galleryImageUrls ?? [])]
  const newUrls = [next.homepageHeroImageUrl, next.movingImageUrl, next.deliveryImageUrl, next.tasksImageUrl, next.aboutImageUrl, ...next.galleryImageUrls]
  try {
    await SiteSettings.updateOne({ key: 'site' }, { $set: next }, { upsert: true })
  } catch {
    // Roll back: remove freshly uploaded files that never got referenced.
    const prev = new Set(oldUrls.filter(Boolean))
    for (const u of newUrls) if (u && !prev.has(u) && parseUploadUrl(u)) await deleteUploadIfUnreferenced(u)
    return { ok: false, error: 'Images could not be saved. Please try again.' }
  }
  await cleanupReplaced(oldUrls, newUrls)
  return { ok: true }
}
