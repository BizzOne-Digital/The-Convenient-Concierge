import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PageHero } from '@/components/layout/page-hero'
import { BookingCTA } from '@/components/sections/booking-cta'
import { JsonLd } from '@/components/ui/json-ld'
import { SafeImage } from '@/components/ui/safe-image'
import { Markdown } from '@/lib/markdown'
import { business } from '@/lib/content'
import { getPublishedPost, getSiteSettings } from '@/lib/data'
import { absoluteUrl, pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export const generateStaticParams = async () => []

export async function generateMetadata({ params }: Props) {
  const post = await getPublishedPost((await params).slug)
  if (!post) return { title: 'Article not found', robots: { index: false } }
  return pageMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || post.title,
    path: `/blog/${post.slug}`,
    image: post.featuredImageUrl || undefined,
    type: 'article',
  })
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPublishedPost((await params).slug)
  if (!post) notFound()
  const settings = await getSiteSettings()
  const date = new Date(post.publishedAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.seoDescription || post.excerpt,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          image: post.featuredImageUrl ? absoluteUrl(post.featuredImageUrl) : undefined,
          mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
          author: { '@type': 'Organization', name: business.name },
          publisher: { '@id': absoluteUrl('/#business') },
        }}
      />
      <PageHero
        eyebrow={date}
        title={post.title}
        lead={post.excerpt || undefined}
        image="/images/photos/toronto-aerial-golden-hour.jpg"
        crumbs={[
          { name: 'Blogs', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      <article className="section-y bg-cream">
        <div className="container-x max-w-[50rem]">
          {post.featuredImageUrl && (
            <div className="relative -mt-[clamp(6rem,10vw,9rem)] mb-14 aspect-[16/9] overflow-hidden rounded-[22px] bg-ink-2 shadow-lift">
              <SafeImage src={post.featuredImageUrl} alt="" fill priority sizes="(min-width:800px) 800px, 100vw" className="object-cover" />
            </div>
          )}
          <div className="prose-tcc">
            <Markdown source={post.content} />
          </div>
          <Link href="/blog" className="mt-16 inline-flex items-center gap-2 font-semibold text-red">
            <ArrowLeft aria-hidden className="size-4" /> All articles
          </Link>
        </div>
      </article>
      <BookingCTA phone={settings.contactPhone} />
    </>
  )
}
