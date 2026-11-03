import { Mail, Phone, Plus } from 'lucide-react'
import { PageHero } from '@/components/layout/page-hero'
import { BookingCTA } from '@/components/sections/booking-cta'
import { ButtonLink } from '@/components/ui/button'
import { JsonLd } from '@/components/ui/json-ld'
import { Reveal } from '@/components/ui/reveal'
import { getPublishedFaqs, getSiteSettings } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Frequently Asked Questions',
  description:
    'Answers about our moving, pick-up & delivery and tasks & errands services, service areas, quotes, and what we do and do not offer.',
  path: '/faq',
})

export default async function FaqPage() {
  const [settings, faqs] = await Promise.all([getSiteSettings(), getPublishedFaqs()])
  return (
    <>
      <JsonLd
        data={
          faqs.length > 0 && {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
          }
        }
      />
      <PageHero
        eyebrow="FAQ"
        title={
          <>
            Questions, <span className="em-red">answered.</span>
          </>
        }
        lead="Everything you need to know about how we work. Can't find your answer? We're a phone call away."
        image="/images/photos/toronto-skyline-sunset.jpg"
        crumbs={[{ name: 'FAQ', path: '/faq' }]}
      />

      <section className="section-y bg-cream">
        <div className="container-x grid gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <aside className="order-2 lg:order-1">
            <div className="lg:sticky lg:top-28">
              <p className="text-eyebrow eyebrow-rule text-red">Still curious?</p>
              <h2 className="mt-6 text-h3">Talk to a real person.</h2>
              <p className="mt-4 text-muted">Every request is different. Reach out and we&rsquo;ll walk you through it.</p>
              <ul className="mt-8 space-y-3">
                <li>
                  <a href={`tel:+1${settings.contactPhone.replace(/\D/g, '')}`} className="flex items-center gap-4 rounded-2xl bg-paper p-4 transition-shadow hover:shadow-card">
                    <span className="grid size-11 place-items-center rounded-xl bg-red text-white">
                      <Phone aria-hidden className="size-5" />
                    </span>
                    <span className="font-semibold">{settings.contactPhone}</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-4 rounded-2xl bg-paper p-4 transition-shadow hover:shadow-card">
                    <span className="grid size-11 place-items-center rounded-xl bg-ink text-white">
                      <Mail aria-hidden className="size-5" />
                    </span>
                    <span className="break-all font-semibold">{settings.contactEmail}</span>
                  </a>
                </li>
              </ul>
              <ButtonLink href="/booking" className="mt-8">
                Book a Service
              </ButtonLink>
            </div>
          </aside>

          <Reveal className="order-1 lg:order-2">
            {faqs.length === 0 ? (
              <p className="rounded-2xl bg-paper p-8 text-muted">Our FAQ is being updated. Please contact us with any questions.</p>
            ) : (
              <div className="divide-y divide-line border-y border-line">
                {faqs.map((f, i) => (
                  <details key={f.question} className="faq group" name="faq" open={i === 0}>
                    <summary className="flex items-start justify-between gap-6 py-6 text-left">
                      <span className="flex gap-5">
                        <span className="mt-1 w-6 shrink-0 font-serif text-lg italic text-red">{String(i + 1).padStart(2, '0')}</span>
                        <span className="text-[1.15rem] font-semibold leading-snug transition-colors group-hover:text-red">{f.question}</span>
                      </span>
                      <span className="faq-icon mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-line bg-paper text-red">
                        <Plus aria-hidden className="size-4" />
                      </span>
                    </summary>
                    <p className="max-w-2xl pb-7 pl-11 text-muted">{f.answer}</p>
                  </details>
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </section>
      <BookingCTA phone={settings.contactPhone} />
    </>
  )
}
