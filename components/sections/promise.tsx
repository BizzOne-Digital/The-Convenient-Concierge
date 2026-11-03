import Image from 'next/image'
import { Quote } from 'lucide-react'
import type { PublicTestimonial } from '@/lib/data'
import { serviceByType } from '@/lib/content'
import { ArrowLink } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'

/**
 * Dark cinematic section. Shows approved testimonials when they exist; until then it carries the
 * company's own promise (clearly attributed to the company, never presented as a customer review).
 */
export function PromiseSection({ testimonials }: { testimonials: PublicTestimonial[] }) {
  const has = testimonials.length > 0
  return (
    <section className="on-dark grain relative isolate overflow-hidden bg-ink text-white" aria-labelledby="promise-title">
      <div className="absolute inset-0 -z-10">
        <Image src="/images/photos/toronto-skyline-night.jpg" alt="" fill sizes="100vw" className="object-cover object-bottom opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(16_16_18)_0%,rgb(16_16_18/0.75)_40%,rgb(16_16_18/0.55)_100%)]" />
      </div>
      <div className="container-x section-y relative">
        <Reveal className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-eyebrow eyebrow-rule text-red-warm">{has ? 'Real clients' : 'Our promise'}</p>
            <h2 id="promise-title" className="mt-6 text-h2">
              {has ? (
                <>
                  What Our Clients <span className="em-red">Say About Us</span>
                </>
              ) : (
                <>
                  Reliable, personal, <span className="em-red">and always on your side.</span>
                </>
              )}
            </h2>
            <p className="mt-6 max-w-md text-white/65">
              {has
                ? 'Reliable, professional and personal. In our clients’ own words.'
                : 'Homes, small businesses, colleges and production companies across Toronto trust us with the details. Here is what we promise every one of them.'}
            </p>
          </div>

          {has ? (
            <ul className="grid gap-5 sm:grid-cols-2">
              {testimonials.slice(0, 4).map((t) => (
                <li key={t.customerName + t.quote.slice(0, 20)} className="rounded-[18px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm">
                  <Quote aria-hidden className="size-7 text-red-warm" />
                  <blockquote className="mt-4 font-serif text-[1.45rem] leading-snug">&ldquo;{t.quote}&rdquo;</blockquote>
                  <p className="mt-5 text-sm font-semibold">{t.customerName}</p>
                  {t.serviceType && <p className="text-xs uppercase tracking-[0.16em] text-white/45">{serviceByType(t.serviceType)?.name}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <figure className="relative border-l border-red-warm/60 pl-8 sm:pl-12">
              <Quote aria-hidden className="absolute -left-4 -top-2 size-8 rounded-full bg-ink p-1.5 text-red-warm" />
              <blockquote className="font-serif text-[clamp(1.75rem,1.2rem+1.9vw,2.85rem)] leading-[1.15]">
                We promise to exceed your expectations at every turn: completing tasks promptly, saving you money and, ultimately, saving you{' '}
                <span className="em-red">the most valuable commodity of all: time.</span>
              </blockquote>
              <figcaption className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-white/55">
                <span>The Convenient Concierge promise</span>
                <ArrowLink href="/contact" className="!text-white">
                  Worked with us? Share your experience
                </ArrowLink>
              </figcaption>
            </figure>
          )}
        </Reveal>
      </div>
    </section>
  )
}
