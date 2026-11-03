import 'server-only'
import { cache } from 'react'
import { connectDB, isDbConfigured } from '@/lib/mongodb'
import { business, defaultFaqs } from '@/lib/content'
import { BlogPost, FAQ, SiteSettings, Testimonial } from '@/models'

export const defaultImages = {
  homepageHeroImageUrl: '/images/photos/toronto-skyline-sunset.jpg',
  movingImageUrl: '/images/services/moving-team.jpg',
  deliveryImageUrl: '/images/services/delivery-handoff.jpg',
  tasksImageUrl: '/images/services/errands-shopping.jpg',
  aboutImageUrl: '/images/photos/couple-at-home.jpg',
}

export type PublicSettings = typeof defaultImages & { contactPhone: string; contactEmail: string; galleryImageUrls: string[] }

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDbConfigured()) return fallback
  try {
    await connectDB()
    return await fn()
  } catch (err) {
    console.error('[data] database read failed:', (err as Error).message)
    return fallback
  }
}

export const getSiteSettings = cache(async (): Promise<PublicSettings> => {
  const s = await safe(() => SiteSettings.findOne({ key: 'site' }).lean(), null)
  const pickStr = (v: unknown, d: string) => (typeof v === 'string' && v ? v : d)
  return {
    contactPhone: pickStr(s?.contactPhone, business.phone),
    contactEmail: pickStr(s?.contactEmail, business.email),
    homepageHeroImageUrl: pickStr(s?.homepageHeroImageUrl, defaultImages.homepageHeroImageUrl),
    movingImageUrl: pickStr(s?.movingImageUrl, defaultImages.movingImageUrl),
    deliveryImageUrl: pickStr(s?.deliveryImageUrl, defaultImages.deliveryImageUrl),
    tasksImageUrl: pickStr(s?.tasksImageUrl, defaultImages.tasksImageUrl),
    aboutImageUrl: pickStr(s?.aboutImageUrl, defaultImages.aboutImageUrl),
    galleryImageUrls: s?.galleryImageUrls ?? [],
  }
})

/* ---------- Publication filters (shared by queries and unit tests) ---------- */
export const publishedPostQuery = (now = new Date()) => ({ status: 'published', publishedAt: { $ne: null, $lte: now } })
export function isPostPublic(p: { status: string; publishedAt?: Date | null }, now = new Date()) {
  return p.status === 'published' && !!p.publishedAt && p.publishedAt.getTime() <= now.getTime()
}
export const isFaqPublic = (f: { isPublished: boolean }) => f.isPublished === true

export type PublicFaq = { question: string; answer: string }
export const getPublishedFaqs = cache(async (): Promise<PublicFaq[]> => {
  const rows = await safe(
    () => FAQ.find({ isPublished: true }).sort({ sortOrder: 1, createdAt: 1 }).select('question answer -_id').lean(),
    null,
  )
  if (rows === null) return defaultFaqs
  return rows.map((r) => ({ question: r.question, answer: r.answer }))
})

export type PublicTestimonial = { customerName: string; quote: string; serviceType: string }
export const getPublishedTestimonials = cache(async (): Promise<PublicTestimonial[]> => {
  const rows = await safe(
    () => Testimonial.find({ isPublished: true }).sort({ sortOrder: 1, createdAt: -1 }).select('customerName quote serviceType -_id').lean(),
    [],
  )
  return rows.map((r) => ({ customerName: r.customerName, quote: r.quote, serviceType: r.serviceType ?? '' }))
})

export type PublicPostSummary = { title: string; slug: string; excerpt: string; featuredImageUrl: string; publishedAt: string }
export const getPublishedPosts = cache(async (): Promise<PublicPostSummary[]> => {
  const rows = await safe(
    () => BlogPost.find(publishedPostQuery()).sort({ publishedAt: -1 }).select('title slug excerpt featuredImageUrl publishedAt -_id').lean(),
    [],
  )
  return rows.map((r) => ({
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt ?? '',
    featuredImageUrl: r.featuredImageUrl ?? '',
    publishedAt: (r.publishedAt as Date).toISOString(),
  }))
})

export const getPublishedPost = cache(async (slug: string) => {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null
  const r = await safe(() => BlogPost.findOne({ ...publishedPostQuery(), slug }).select('-_id -__v').lean(), null)
  if (!r) return null
  return {
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt ?? '',
    content: r.content ?? '',
    featuredImageUrl: r.featuredImageUrl ?? '',
    publishedAt: (r.publishedAt as Date).toISOString(),
    updatedAt: (r.updatedAt as Date | undefined)?.toISOString() ?? (r.publishedAt as Date).toISOString(),
    seoTitle: r.seoTitle ?? '',
    seoDescription: r.seoDescription ?? '',
  }
})
