import type { MetadataRoute } from 'next'
import { services } from '@/lib/content'
import { getPublishedPosts } from '@/lib/data'
import { absoluteUrl } from '@/lib/seo'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ['/', '/services', '/about', '/testimonials', '/blog', '/faq', '/contact', '/booking']
  const posts = await getPublishedPosts()
  return [
    ...pages.map((p) => ({ url: absoluteUrl(p), changeFrequency: 'monthly' as const, priority: p === '/' ? 1 : 0.7 })),
    ...services.map((s) => ({ url: absoluteUrl(`/services/${s.slug}`), changeFrequency: 'monthly' as const, priority: 0.9 })),
    ...posts.map((p) => ({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: p.publishedAt, priority: 0.6 })),
  ]
}
