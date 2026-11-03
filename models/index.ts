import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'
import { serviceTypes } from '@/lib/content'

function model<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) ?? mongoose.model<T>(name, schema)
}

/* ---------- AdminUser ---------- */
const adminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['owner', 'admin'], default: 'admin' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)
export type AdminUserDoc = InferSchemaType<typeof adminUserSchema>
export const AdminUser = model('AdminUser', adminUserSchema)

/* ---------- AdminSession (server-side sessions: real logout + expiry) ---------- */
const adminSessionSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
)
adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
export const AdminSession = model('AdminSession', adminSessionSchema)

/* ---------- RateLimit (persistent, works across serverless instances) ---------- */
const rateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
})
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
export const RateLimit = model('RateLimit', rateLimitSchema)

/* ---------- BookingInquiry ---------- */
export const bookingStatuses = ['new', 'contacted', 'in-progress', 'completed', 'archived'] as const
export const inquiryServiceTypes = [...serviceTypes, 'general'] as const

const bookingInquirySchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, maxlength: 200 },
    phone: { type: String, default: '', maxlength: 40 },
    serviceType: { type: String, enum: inquiryServiceTypes, required: true },
    preferredDate: { type: Date, default: null },
    pickupAddress: { type: String, default: '', maxlength: 300 },
    destinationAddress: { type: String, default: '', maxlength: 300 },
    propertyType: { type: String, default: '', maxlength: 60 },
    itemDetails: { type: String, default: '', maxlength: 2000 },
    description: { type: String, default: '', maxlength: 4000 },
    attachmentUrl: { type: String, default: '' },
    status: { type: String, enum: bookingStatuses, default: 'new' },
  },
  { timestamps: true },
)
bookingInquirySchema.index({ status: 1, createdAt: -1 })
bookingInquirySchema.index({ serviceType: 1, createdAt: -1 })
bookingInquirySchema.index({ email: 1 })
export type BookingInquiryDoc = InferSchemaType<typeof bookingInquirySchema>
export const BookingInquiry = model('BookingInquiry', bookingInquirySchema)

/* ---------- BlogPost ---------- */
const blogPostSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, default: '', maxlength: 400 },
    content: { type: String, default: '', maxlength: 60000 },
    featuredImageUrl: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date, default: null },
    seoTitle: { type: String, default: '', maxlength: 70 },
    seoDescription: { type: String, default: '', maxlength: 170 },
  },
  { timestamps: true },
)
blogPostSchema.index({ status: 1, publishedAt: -1 })
export type BlogPostDoc = InferSchemaType<typeof blogPostSchema>
export const BlogPost = model('BlogPost', blogPostSchema)

/* ---------- FAQ ---------- */
const faqSchema = new Schema(
  {
    question: { type: String, required: true, maxlength: 300 },
    answer: { type: String, required: true, maxlength: 3000 },
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
)
faqSchema.index({ isPublished: 1, sortOrder: 1 })
faqSchema.index({ question: 1 }, { unique: true })
export type FaqDoc = InferSchemaType<typeof faqSchema>
export const FAQ = model('FAQ', faqSchema)

/* ---------- Testimonial (never seeded) ---------- */
const testimonialSchema = new Schema(
  {
    customerName: { type: String, required: true, maxlength: 120 },
    quote: { type: String, required: true, maxlength: 1500 },
    serviceType: { type: String, enum: [...serviceTypes, ''], default: '' },
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true },
)
testimonialSchema.index({ isPublished: 1, sortOrder: 1 })
export type TestimonialDoc = InferSchemaType<typeof testimonialSchema>
export const Testimonial = model('Testimonial', testimonialSchema)

/* ---------- SiteSettings (single document, approved fields only) ---------- */
export const imageSettingKeys = [
  'homepageHeroImageUrl',
  'movingImageUrl',
  'deliveryImageUrl',
  'tasksImageUrl',
  'aboutImageUrl',
] as const
const siteSettingsSchema = new Schema(
  {
    key: { type: String, default: 'site', unique: true },
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    homepageHeroImageUrl: { type: String, default: '' },
    movingImageUrl: { type: String, default: '' },
    deliveryImageUrl: { type: String, default: '' },
    tasksImageUrl: { type: String, default: '' },
    aboutImageUrl: { type: String, default: '' },
    galleryImageUrls: { type: [String], default: [] },
  },
  { timestamps: true, strict: 'throw' },
)
export type SiteSettingsDoc = InferSchemaType<typeof siteSettingsSchema>
export const SiteSettings = model('SiteSettings', siteSettingsSchema)

/* ---------- Organisation (read-only mirror of the source-controlled list) ---------- */
const organisationSchema = new Schema({
  name: { type: String, required: true, unique: true },
  sortOrder: { type: Number, default: 0 },
})
export const Organisation = model('Organisation', organisationSchema)

/* ---------- StoredUpload (image binaries live in MongoDB, never on disk) ---------- */
const storedUploadSchema = new Schema(
  {
    folder: { type: String, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true },
)
storedUploadSchema.index({ folder: 1, filename: 1 }, { unique: true })
export const StoredUpload = model('StoredUpload', storedUploadSchema)
