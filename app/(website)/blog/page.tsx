import Link from 'next/link'
import { ArrowUpRight, Feather } from 'lucide-react'
import { PageHero } from '@/components/layout/page-hero'
import { BookingCTA } from '@/components/sections/booking-cta'
import { ButtonLink } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { SafeImage } from '@/components/ui/safe-image'
import { getPublishedPosts, getSiteSettings } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Blog: Moving, Delivery and Errand Tips',
  description: 'Moving tips, delivery know-how and ideas for winning back your time, from The Convenient Concierge in Toronto.',
  path: '/blog',
})

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })

export default async function BlogPage() {
  const [settings, posts] = await Promise.all([getSiteSettings(), getPublishedPosts()])
  const [lead, ...rest] = posts
  return (
    <>
      <PageHero
        eyebrow="The journal"
        title={
          <>
            Notes on moving, deliveries <span className="em-red">and getting time back.</span>
          </>
        }
        image="/images/photos/toronto-aerial-golden-hour.jpg"
        imagePosition="center 30%"
        crumbs={[{ name: 'Blogs', path: '/blog' }]}
      />

      <section className="section-y bg-cream">
        <div className="container-x">
          {!lead ? (
            <Reveal>
              <div className="grid items-center gap-10 overflow-hidden rounded-[24px] bg-paper p-8 sm:p-14 lg:grid-cols-[auto_1fr]">
                <span className="grid size-20 place-items-center rounded-full bg-red/[0.08] text-red">
                  <Feather aria-hidden className="size-8" strokeWidth={1.5} />
                </span>
                <div>
                  <h2 className="text-h3">Our first articles are being written</h2>
                  <p className="mt-3 max-w-2xl text-muted">
                    Soon you&rsquo;ll find practical moving checklists, delivery tips and ideas for handing off the errands that fill your week. In the
                    meantime, we&rsquo;re happy to answer any question directly.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <ButtonLink href="/faq" variant="dark">
                      Read the FAQ
                    </ButtonLink>
                    <ButtonLink href="/contact" variant="outline-dark">
                      Ask Us Anything
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </Reveal>
          ) : (
            <>
              <Reveal>
                <Link href={`/blog/${lead.slug}`} className="group grid overflow-hidden rounded-[24px] bg-paper shadow-card lg:grid-cols-2">
                  <div className="relative aspect-[16/10] bg-ink-2 lg:aspect-auto">
                    {lead.featuredImageUrl && (
                      <SafeImage src={lead.featuredImageUrl} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center p-8 sm:p-12">
                    <time dateTime={lead.publishedAt} className="text-eyebrow text-red">
                      {fmt(lead.publishedAt)}
                    </time>
                    <h2 className="mt-5 text-h2">{lead.title}</h2>
                    {lead.excerpt && <p className="mt-5 text-muted">{lead.excerpt}</p>}
                    <span className="mt-8 inline-flex items-center gap-2 font-semibold text-red">
                      Read article <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
              {rest.length > 0 && (
                <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p, i) => (
                    <Reveal as="li" key={p.slug} delay={(i % 3) * 0.06}>
                      <Link href={`/blog/${p.slug}`} className="group block h-full overflow-hidden rounded-[22px] bg-paper shadow-card">
                        <div className="relative aspect-[16/10] bg-ink-2">
                          {p.featuredImageUrl && <SafeImage src={p.featuredImageUrl} alt="" fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
                        </div>
                        <div className="p-7">
                          <time dateTime={p.publishedAt} className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                            {fmt(p.publishedAt)}
                          </time>
                          <h3 className="mt-3 text-[1.45rem] font-semibold leading-snug group-hover:text-red">{p.title}</h3>
                          {p.excerpt && <p className="mt-3 line-clamp-3 text-[0.9375rem] text-muted">{p.excerpt}</p>}
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </section>
      <BookingCTA phone={settings.contactPhone} />
    </>
  )
}
