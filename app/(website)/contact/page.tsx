import { CalendarCheck, Mail, MapPin, Phone } from 'lucide-react'
import { PageHero } from '@/components/layout/page-hero'
import { ContactForm } from '@/components/forms/contact-form'
import { ButtonLink } from '@/components/ui/button'
import { SocialLinks } from '@/components/ui/icons'
import { Reveal } from '@/components/ui/reveal'
import { serviceAreas } from '@/lib/content'
import { getSiteSettings } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Contact Our Toronto Moving and Concierge Team',
  description:
    'Call 647-457-5252 or email info@theconvenientconcierge.ca for quotes on moving, delivery and errands in Toronto, Etobicoke, Mississauga and the GTA.',
  path: '/contact',
})

export default async function ContactPage() {
  const s = await getSiteSettings()
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let&rsquo;s make your day <span className="em-red">a little easier.</span>
          </>
        }
        lead="For general enquiries, fill in the form below and we will contact you promptly. Ready to book? Head straight to our booking request."
        image="/images/photos/etobicoke-skyline-sunset.jpg"
        imagePosition="center 70%"
        crumbs={[{ name: 'Contact', path: '/contact' }]}
      />

      <section className="section-y bg-cream">
        <div className="container-x grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <Reveal className="space-y-4">
            <a
              href={`tel:+1${s.contactPhone.replace(/\D/g, '')}`}
              className="group flex items-center gap-5 rounded-[22px] bg-ink p-6 text-white transition-transform duration-500 hover:-translate-y-0.5 sm:p-7"
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-red">
                <Phone aria-hidden className="size-6" />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-[0.16em] text-white/55">Call us</span>
                <span className="mt-1 block text-[1.6rem] font-semibold leading-tight">{s.contactPhone}</span>
              </span>
            </a>
            <a href={`mailto:${s.contactEmail}`} className="group flex items-center gap-5 rounded-[22px] bg-paper p-6 transition-shadow hover:shadow-card sm:p-7">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-red/[0.08] text-red">
                <Mail aria-hidden className="size-6" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs uppercase tracking-[0.16em] text-muted">Email</span>
                <span className="mt-1 block break-all text-lg font-semibold">{s.contactEmail}</span>
              </span>
            </a>
            <div className="rounded-[22px] bg-paper p-6 sm:p-7">
              <p className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-muted">
                <MapPin aria-hidden className="size-4 text-red" /> Service area
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.9375rem]">
                {serviceAreas.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
            <div className="on-dark flex flex-wrap items-center justify-between gap-4 rounded-[22px] bg-red-deep p-6 text-white sm:p-7">
              <div>
                <p className="font-semibold">Ready to book?</p>
                <p className="text-sm text-white/75">Moving, deliveries, tasks &amp; errands.</p>
              </div>
              <ButtonLink href="/booking" variant="light" arrow={false}>
                <CalendarCheck aria-hidden className="size-4" /> Book a Service
              </ButtonLink>
            </div>
            <div className="on-dark rounded-[22px] bg-ink p-6">
              <p className="mb-3 text-xs uppercase tracking-[0.16em] text-white/55">Follow along</p>
              <SocialLinks />
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="rounded-[24px] bg-paper p-6 shadow-card sm:p-10">
              <h2 className="text-h3">Send us a message</h2>
              <p className="mb-8 mt-2 text-muted">We read every message and reply promptly.</p>
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
