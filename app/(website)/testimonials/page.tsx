import { MessageSquareQuote, Quote } from 'lucide-react'
import { PageHero } from '@/components/layout/page-hero'
import { Organisations } from '@/components/sections/organisations'
import { BookingCTA } from '@/components/sections/booking-cta'
import { ButtonLink } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { serviceByType } from '@/lib/content'
import { getPublishedTestimonials, getSiteSettings } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Testimonials',
  description: 'Client feedback and the organisations The Convenient Concierge has had the pleasure of working with across Toronto.',
  path: '/testimonials',
})

export default async function TestimonialsPage() {
  const [settings, testimonials] = await Promise.all([getSiteSettings(), getPublishedTestimonials()])
  return (
    <>
      <PageHero
        eyebrow="Testimonials"
        title={
          <>
            Reliable, professional <span className="em-red">and always on time.</span>
          </>
        }
        lead="We build strong relationships with every client, from busy families to some of Toronto's best-known organisations."
        image="/images/photos/toronto-skyline-night.jpg"
        imagePosition="center 80%"
        crumbs={[{ name: 'Testimonials', path: '/testimonials' }]}
      />

      <section className="section-y bg-cream" aria-labelledby="feedback-title">
        <div className="container-x">
          <Reveal>
            <p className="text-eyebrow eyebrow-rule text-red">Client feedback</p>
            <h2 id="feedback-title" className="mt-6 text-h2">
              In our clients&rsquo; <span className="em-red">own words</span>
            </h2>
          </Reveal>

          {testimonials.length > 0 ? (
            <ul className="mt-14 columns-1 gap-6 md:columns-2 lg:columns-3">
              {testimonials.map((t, i) => (
                <Reveal as="li" key={t.customerName + i} delay={(i % 3) * 0.06} className="mb-6 break-inside-avoid rounded-[22px] bg-paper p-8 shadow-card">
                  <Quote aria-hidden className="size-7 text-red" />
                  <blockquote className="mt-5 font-serif text-[1.45rem] leading-snug">&ldquo;{t.quote}&rdquo;</blockquote>
                  <div className="mt-6 border-t border-line pt-5">
                    <p className="font-semibold">{t.customerName}</p>
                    {t.serviceType && <p className="text-xs uppercase tracking-[0.16em] text-muted">{serviceByType(t.serviceType)?.name}</p>}
                  </div>
                </Reveal>
              ))}
            </ul>
          ) : (
            <Reveal className="mt-14">
              <div className="relative overflow-hidden rounded-[24px] border border-line bg-paper px-6 py-16 text-center sm:px-16">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-red/[0.08] text-red">
                  <MessageSquareQuote aria-hidden className="size-7" strokeWidth={1.6} />
                </span>
                <h3 className="mx-auto mt-6 max-w-xl text-h3">Client stories are on their way</h3>
                <p className="mx-auto mt-4 max-w-lg text-muted">
                  We only publish feedback our clients have shared and approved. Have we helped you recently? We would love to hear how it went.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <ButtonLink href="/contact">Share Your Experience</ButtonLink>
                  <ButtonLink href="/booking" variant="outline-dark">
                    Book a Service
                  </ButtonLink>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <Organisations />
      <BookingCTA phone={settings.contactPhone} />
    </>
  )
}
