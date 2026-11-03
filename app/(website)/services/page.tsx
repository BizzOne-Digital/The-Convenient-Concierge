import Link from 'next/link'
import { Check } from 'lucide-react'
import { PageHero } from '@/components/layout/page-hero'
import { BookingCTA } from '@/components/sections/booking-cta'
import { ButtonLink, ArrowLink } from '@/components/ui/button'
import { ServiceIcon } from '@/components/ui/icons'
import { Reveal } from '@/components/ui/reveal'
import { SafeImage } from '@/components/ui/safe-image'
import { about, services } from '@/lib/content'
import { getSiteSettings } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Services: Moving, Pick-up & Delivery, Tasks & Errands',
  description:
    'Three ways we give you time back: moving, pick-up & delivery, and tasks & errands for residential and corporate clients across Toronto, Etobicoke and East Mississauga.',
  path: '/services',
})

export default async function ServicesPage() {
  const settings = await getSiteSettings()
  const imageFor = { moving: settings.movingImageUrl, delivery: settings.deliveryImageUrl, tasks: settings.tasksImageUrl }
  return (
    <>
      <PageHero
        eyebrow="Our services"
        title={
          <>
            Three services. <span className="em-red">One trusted concierge.</span>
          </>
        }
        lead="The Convenient Concierge offers three types of services, serving corporate and residential clients. We will go anywhere to get you the items you need for work or home."
        image="/images/photos/toronto-aerial-golden-hour.jpg"
        imagePosition="center 60%"
        crumbs={[{ name: 'Services', path: '/services' }]}
      >
        <ButtonLink href="/booking">Book a Service</ButtonLink>
      </PageHero>

      {/* In-page index */}
      <nav aria-label="Services on this page" className="sticky top-[72px] z-30 border-b border-line bg-cream/90 backdrop-blur-md">
        <ul className="container-x flex gap-1 overflow-x-auto py-3 [scrollbar-width:none]">
          {services.map((s, i) => (
            <li key={s.slug} className="shrink-0">
              <a href={`#${s.slug}`} className="flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold text-text/80 transition-colors hover:bg-white hover:text-text">
                <span className="font-serif text-base italic text-red">0{i + 1}</span>
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="bg-cream">
        {services.map((s, i) => {
          const flip = i % 2 === 1
          return (
            <section key={s.slug} id={s.slug} aria-labelledby={`${s.slug}-title`} className="section-y border-b border-line last:border-0">
              <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <Reveal className={`relative ${flip ? 'lg:order-2' : ''}`}>
                  <div className="relative aspect-[4/3.2] overflow-hidden rounded-[22px] bg-ink-2 shadow-lift">
                    <SafeImage src={imageFor[s.type]} fallback={s.images[0]!.src} alt={s.images[0]!.alt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
                  </div>
                  {s.images[1] && (
                    <div className={`absolute -bottom-8 hidden w-[42%] overflow-hidden rounded-2xl border-[6px] border-cream shadow-lift md:block ${flip ? '-left-6' : '-right-6'}`}>
                      <SafeImage src={s.images[1].src} alt={s.images[1].alt} width={600} height={450} sizes="22vw" className="aspect-[4/3] h-auto w-full object-cover" />
                    </div>
                  )}
                  <span className="absolute left-5 top-5 grid size-14 place-items-center rounded-full bg-red text-white shadow-lg">
                    <ServiceIcon icon={s.icon} className="size-6" />
                  </span>
                </Reveal>

                <Reveal delay={0.08}>
                  <p className="text-eyebrow text-red">
                    <span className="font-serif text-lg normal-case italic tracking-normal">0{i + 1}</span> · Service
                  </p>
                  <h2 id={`${s.slug}-title`} className="mt-4 text-h2">
                    {s.name}
                  </h2>
                  <p className="mt-6 text-lead text-muted">{s.summary}</p>
                  <ul className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {(s.highlights ?? s.items).slice(0, 6).map((item) => (
                      <li key={item} className="flex gap-3 text-[0.9375rem]">
                        <Check aria-hidden className="mt-1 size-4 shrink-0 text-red" strokeWidth={2.5} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {s.notice && <p className="mt-6 border-l-2 border-red pl-4 text-sm font-medium">{s.notice}</p>}
                  <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                    <ButtonLink href={`/services/${s.slug}`} variant="dark">
                      Explore {s.shortName}
                    </ButtonLink>
                    <ArrowLink href={`/booking?service=${s.type}`}>{s.cta}</ArrowLink>
                  </div>
                </Reveal>
              </div>
            </section>
          )
        })}
      </div>

      <section className="bg-paper">
        <div className="container-x section-y text-center">
          <Reveal>
            <p className="mx-auto max-w-4xl text-h2">
              &ldquo;We will do anything you require. Just contact us and <span className="em-red">we will get it done.</span>&rdquo;
            </p>
            <p className="mx-auto mt-6 max-w-xl text-muted">{about.clients} Not sure which service fits? Tell us what you need and we will take it from there.</p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/contact" variant="outline-dark">
                Ask a Question
              </ButtonLink>
              <ButtonLink href="/booking">Book a Service</ButtonLink>
            </div>
            <Link href="/faq" className="mt-6 inline-block text-sm font-semibold text-muted underline-offset-4 hover:underline">
              Read the FAQ
            </Link>
          </Reveal>
        </div>
      </section>

      <BookingCTA phone={settings.contactPhone} />
    </>
  )
}
