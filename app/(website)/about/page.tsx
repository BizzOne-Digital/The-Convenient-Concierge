import Image from 'next/image'
import { PageHero } from '@/components/layout/page-hero'
import { Organisations } from '@/components/sections/organisations'
import { BookingCTA } from '@/components/sections/booking-cta'
import { CityRoutes } from '@/components/ui/city-routes'
import { ButtonLink } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { SafeImage } from '@/components/ui/safe-image'
import { about, serviceAreas } from '@/lib/content'
import { getSiteSettings } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'About Us: Personal Concierge Services in Toronto',
  description:
    'Meet The Convenient Concierge: customer-service specialists for moving, deliveries, tasks and errands, serving residential and corporate clients in Toronto and Etobicoke.',
  path: '/about',
})

const values = [
  { title: 'Customer service first', text: 'Professional, customer service-based concierges who take the time to understand exactly what you need.' },
  { title: 'Strong relationships', text: "We get to know our clients, so you know what you're getting each and every time." },
  { title: 'Your exact expectations', text: 'Understanding your specific needs lets us fulfil them precisely, at home or at the office.' },
  { title: 'Time, saved', text: 'Tasks completed promptly, saving you money and the most valuable commodity of all: time.' },
]

export default async function AboutPage() {
  const settings = await getSiteSettings()
  return (
    <>
      <PageHero
        eyebrow="About us"
        title={
          <>
            We&rsquo;re more than a service. <span className="em-red">We&rsquo;re your convenience partner.</span>
          </>
        }
        lead={about.intro}
        image="/images/photos/etobicoke-skyline-sunset.jpg"
        imagePosition="center 38%"
        crumbs={[{ name: 'About Us', path: '/about' }]}
      />

      <section className="section-y bg-cream" aria-labelledby="story-title">
        <div className="container-x grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-ink-2 shadow-lift">
              <SafeImage src={settings.aboutImageUrl} fallback="/images/photos/couple-at-home.jpg" alt="A couple enjoying free time together at home" fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-8 -right-4 hidden w-1/2 overflow-hidden rounded-2xl border-[6px] border-cream shadow-lift sm:block lg:-right-10">
              <Image src="/images/services/moving-team.jpg" alt="" width={1024} height={685} sizes="25vw" className="aspect-[4/3] h-auto w-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.08} className="lg:pt-6">
            <p className="text-eyebrow eyebrow-rule text-red">Our story</p>
            <h2 id="story-title" className="mt-6 text-h2">
              Welcome to <span className="em-red">The Convenient Concierge</span>
            </h2>
            <div className="mt-8 space-y-5 text-lead text-muted">
              {about.story.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <p className="mt-8 border-l-2 border-red pl-5 font-serif text-[1.6rem] leading-snug">{about.anywhere}</p>
          </Reveal>
        </div>
      </section>

      <section className="section-y bg-paper" aria-labelledby="values-title">
        <div className="container-x">
          <Reveal className="max-w-3xl">
            <p className="text-eyebrow eyebrow-rule text-red">How we work</p>
            <h2 id="values-title" className="mt-6 text-h2">
              Built on trust, <span className="em-red">one relationship at a time.</span>
            </h2>
          </Reveal>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-[22px] bg-line sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal as="li" key={v.title} delay={i * 0.06} className="bg-paper p-8">
                <span className="font-serif text-3xl italic text-red">0{i + 1}</span>
                <h3 className="mt-6 text-lg font-semibold">{v.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{v.text}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-16 grid gap-6 md:grid-cols-2">
            {[
              { title: 'Residential clients', text: 'Moves, deliveries, groceries, gifts and everyday errands for individuals, families and out-of-town clients.' },
              { title: 'Corporate clients', text: 'Corporate, private and event deliveries, office furniture moves and staging support for real-estate brokerages.' },
            ].map((c) => (
              <div key={c.title} className="rounded-[22px] bg-cream p-8 sm:p-10">
                <h3 className="text-h3">{c.title}</h3>
                <p className="mt-4 text-muted">{c.text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="on-dark relative isolate overflow-hidden bg-ink text-white" aria-labelledby="area-title">
        <CityRoutes tone="dark" fade={false} className="-z-10 opacity-90" />
        <div className="container-x section-y grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <p className="text-eyebrow eyebrow-rule text-red-warm">Service area</p>
            <h2 id="area-title" className="mt-6 text-h2">
              Toronto&rsquo;s west end, <span className="em-red">and beyond.</span>
            </h2>
            <p className="mt-6 max-w-md text-white/65">
              Our Toronto and Etobicoke moving services, deliveries and errands cover the neighbourhoods below, Mississauga and the surrounding GTA.
              Out-of-town deliveries are available on request. Not sure if you&rsquo;re covered? Just ask.
            </p>
            <ButtonLink href="/contact" variant="outline-light" className="mt-8">
              Check your area
            </ButtonLink>
          </Reveal>
          <Reveal delay={0.08}>
            <ol className="grid gap-x-10 sm:grid-cols-2">
              {serviceAreas.map((a, i) => (
                <li key={a} className="flex items-baseline gap-4 border-t border-white/10 py-4">
                  <span className="w-6 text-xs tabular-nums text-white/40">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-serif text-[1.5rem] leading-tight">{a}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {settings.galleryImageUrls.length > 0 && (
        <section className="section-y bg-cream" aria-labelledby="gallery-title">
          <div className="container-x">
            <h2 id="gallery-title" className="text-h2">
              Out and <span className="em-red">about</span>
            </h2>
            <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
              {settings.galleryImageUrls.map((u) => (
                <li key={u} className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-ink-2">
                  <SafeImage src={u} alt="The Convenient Concierge at work" fill sizes="(min-width:768px) 33vw, 50vw" className="object-cover" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <Organisations />
      <BookingCTA phone={settings.contactPhone} />
    </>
  )
}
