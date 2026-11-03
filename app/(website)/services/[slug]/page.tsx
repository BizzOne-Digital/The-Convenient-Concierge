import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Check, Download, Info, Phone } from 'lucide-react'
import { PageHero } from '@/components/layout/page-hero'
import { BookingCTA } from '@/components/sections/booking-cta'
import { ButtonLink } from '@/components/ui/button'
import { ServiceIcon } from '@/components/ui/icons'
import { JsonLd } from '@/components/ui/json-ld'
import { Reveal } from '@/components/ui/reveal'
import { SafeImage } from '@/components/ui/safe-image'
import { business, getService, serviceAreas, services } from '@/lib/content'
import { getSiteSettings } from '@/lib/data'
import { pageMetadata, serviceJsonLd } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false
export const generateStaticParams = () => services.map((s) => ({ slug: s.slug }))

export async function generateMetadata({ params }: Props) {
  const s = getService((await params).slug)
  if (!s) return {}
  return pageMetadata({ title: s.seo.title, description: s.seo.description, path: `/services/${s.slug}`, image: s.images[0]!.src })
}

export default async function ServicePage({ params }: Props) {
  const s = getService((await params).slug)
  if (!s) notFound()
  const settings = await getSiteSettings()
  const hero = { moving: settings.movingImageUrl, delivery: settings.deliveryImageUrl, tasks: settings.tasksImageUrl }[s.type]
  const others = services.filter((o) => o.slug !== s.slug)
  const tel = `tel:+1${settings.contactPhone.replace(/\D/g, '')}`

  return (
    <>
      <JsonLd data={serviceJsonLd(s.slug)} />
      <PageHero
        eyebrow={s.type === 'tasks' ? 'Tasks & errands concierge' : s.type === 'moving' ? 'Moving services' : 'Pick-up & delivery'}
        title={
          s.type === 'moving' ? (
            <>
              Moving, <span className="em-red">minus the stress.</span>
            </>
          ) : s.type === 'delivery' ? (
            <>
              We pick it up. <span className="em-red">We bring it to you.</span>
            </>
          ) : (
            <>
              Your to-do list, <span className="em-red">handled.</span>
            </>
          )
        }
        lead={s.summary}
        image={s.type === 'moving' ? '/images/photos/toronto-skyline-sunset.jpg' : s.type === 'delivery' ? '/images/photos/toronto-aerial-golden-hour.jpg' : '/images/photos/etobicoke-skyline-sunset.jpg'}
        imagePosition={s.type === 'tasks' ? 'center 35%' : 'center'}
        aside={
          <figure className="relative ml-auto w-full max-w-[24rem] rotate-[2deg]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] border-[6px] border-white/95 bg-ink-2 shadow-paper">
              <SafeImage src={hero} fallback={s.images[0]!.src} alt={s.images[0]!.alt} fill priority sizes="24rem" className="object-cover" />
            </div>
            <figcaption className="absolute -bottom-5 -left-6 flex items-center gap-3 rounded-full bg-paper py-2 pl-2 pr-5 text-sm font-semibold text-text shadow-lift">
              <span className="grid size-9 place-items-center rounded-full bg-red text-white">
                <ServiceIcon icon={s.icon} className="size-4" />
              </span>
              {s.name}
            </figcaption>
          </figure>
        }
        crumbs={[
          { name: 'Services', path: '/services' },
          { name: s.name, path: `/services/${s.slug}` },
        ]}
      >
        <ButtonLink href={`/booking?service=${s.type}`}>{s.cta}</ButtonLink>
        <ButtonLink href={tel} variant="outline-light" arrow={false}>
          <Phone aria-hidden className="size-4" />
          {settings.contactPhone}
        </ButtonLink>
      </PageHero>

      <section className="section-y bg-cream" aria-labelledby="what-title">
        <div className="container-x grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="text-eyebrow eyebrow-rule text-red">{s.name}</p>
              <p className="mt-6 font-serif text-[clamp(1.6rem,1.25rem+1.2vw,2.35rem)] leading-[1.2]">{s.intro}</p>
            </Reveal>

            <Reveal delay={0.05}>
              <h2 id="what-title" className="mt-16 text-h3">
                What we handle
              </h2>
              <ul className="mt-8 grid gap-px overflow-hidden rounded-[18px] bg-line sm:grid-cols-2">
                {s.items.map((item) => (
                  <li key={item} className="flex items-start gap-3.5 bg-paper p-5">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-red/[0.08] text-red">
                      <Check aria-hidden className="size-3.5" strokeWidth={2.75} />
                    </span>
                    <span className="text-[0.9875rem] font-medium leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {s.benefits && (
              <Reveal delay={0.05}>
                <h2 className="mt-16 text-h3">Why clients choose us</h2>
                <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {s.benefits.map((b, i) => (
                    <li key={b} className="rounded-[18px] border border-line bg-paper p-5">
                      <span className="font-serif text-xl italic text-red">0{i + 1}</span>
                      <p className="mt-3 font-semibold leading-tight">{b}</p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {s.notice && (
              <Reveal delay={0.05}>
                <div className="mt-14 rounded-[18px] border border-line bg-paper p-6 sm:p-8">
                  <div className="flex gap-4">
                    <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-red" />
                    <div>
                      <h2 className="font-semibold">Before your move</h2>
                      <p className="mt-2 text-muted">
                        Please download our moving checklist, fill it in and attach it to your request so we can plan your move accurately.{' '}
                        <strong className="font-semibold text-text">We do not offer disassembly or assembly services.</strong>
                      </p>
                      <a href={business.movingChecklistUrl} download className="mt-5 inline-flex items-center gap-2 font-semibold text-red underline-offset-4 hover:underline">
                        <Download aria-hidden className="size-4" />
                        Download Moving Checklist (PDF, 165 KB)
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          <aside className="lg:pt-2">
            <div className="space-y-5 lg:sticky lg:top-28">
              <div className="overflow-hidden rounded-[22px] bg-ink text-white shadow-lift">
                <div className="relative aspect-[4/3]">
                  <SafeImage src={s.images[1]?.src ?? s.images[0]!.src} alt={s.images[1]?.alt ?? s.images[0]!.alt} fill sizes="(min-width:1024px) 30vw, 100vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                </div>
                <div className="on-dark p-7">
                  <span className="grid size-12 place-items-center rounded-full bg-red">
                    <ServiceIcon icon={s.icon} className="size-5" />
                  </span>
                  <p className="mt-5 text-h3">Ready when you are.</p>
                  <p className="mt-3 text-sm text-white/65">
                    No fixed prices: every request is different. Send the details and we will contact you with a quote.
                  </p>
                  <ButtonLink href={`/booking?service=${s.type}`} className="mt-6 w-full">
                    {s.cta}
                  </ButtonLink>
                  <a href={tel} className="mt-3 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-white/80 hover:text-white">
                    <Phone aria-hidden className="size-4" /> or call {settings.contactPhone}
                  </a>
                </div>
              </div>
              <div className="rounded-[22px] border border-line bg-paper p-6">
                <p className="text-eyebrow text-muted">Service area</p>
                <p className="mt-3 text-sm leading-relaxed">{serviceAreas.join(' · ')}</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {s.images.length > 2 && (
        <section aria-label="Gallery" className="bg-cream pb-[clamp(4.5rem,3rem+6vw,8.5rem)]">
          <div className="container-x grid gap-4 sm:grid-cols-3">
            {s.images.map((img) => (
              <Reveal key={img.src} className="relative aspect-[4/3] overflow-hidden rounded-[18px]">
                <SafeImage src={img.src} alt={img.alt} fill sizes="(min-width:640px) 33vw, 100vw" className="object-cover" />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="section-y bg-paper" aria-labelledby="more-title">
        <div className="container-x">
          <h2 id="more-title" className="text-h2">
            Explore our <span className="em-red">other services</span>
          </h2>
          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            {others.map((o) => (
              <li key={o.slug}>
                <Link
                  href={`/services/${o.slug}`}
                  className="group relative flex items-center gap-6 overflow-hidden rounded-[22px] bg-ink p-4 pr-8 text-white transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1"
                >
                  <span className="relative block aspect-square w-28 shrink-0 overflow-hidden rounded-2xl sm:w-36">
                    <SafeImage src={o.images[0]!.src} alt="" fill sizes="150px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-h3">{o.name}</span>
                    <span className="mt-2 line-clamp-2 text-sm text-white/60">{o.summary}</span>
                  </span>
                  <ArrowRight aria-hidden className="size-5 shrink-0 text-red-warm transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BookingCTA phone={settings.contactPhone} defaultService={s.type} />
    </>
  )
}
