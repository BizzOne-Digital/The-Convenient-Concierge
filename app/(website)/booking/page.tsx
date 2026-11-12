import { Download, Phone } from 'lucide-react'
import { PageHero } from '@/components/layout/page-hero'
import { BookingForm } from '@/components/forms/booking-form'
import { Reveal } from '@/components/ui/reveal'
import { business, serviceTypes, type ServiceType } from '@/lib/content'
import { getSiteSettings } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Request a Free Quote',
  description:
    'Request a free quote for moving, furniture pickup and delivery, or tasks and errands in Toronto. Tell us what you need and we will contact you to confirm the details.',
  path: '/booking',
})

const steps = [
  { title: 'Tell us what you need', text: 'Choose a service and share the details. It takes about two minutes.' },
  { title: 'We review your request', text: 'Our team looks over the details and contacts you promptly.' },
  { title: 'We confirm and take care of it', text: 'Once timing and your quote are agreed, consider it handled.' },
]

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const [settings, sp] = await Promise.all([getSiteSettings(), searchParams])
  const preset = (serviceTypes as readonly string[]).includes(sp.service ?? '') ? (sp.service as ServiceType) : undefined
  return (
    <>
      <PageHero
        eyebrow="Book a service"
        title={
          <>
            Request a <span className="em-red">booking</span>
          </>
        }
        lead="Tell us what you need help with. This is a booking request: we will contact you to confirm the details and provide a quote."
        image="/images/photos/toronto-skyline-sunset.jpg"
        crumbs={[{ name: 'Book a Service', path: '/booking' }]}
      />

      <section className="section-y relative bg-cream">
        <div className="container-x grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-14">
          <aside className="order-2 lg:order-1">
            <div className="space-y-6 lg:sticky lg:top-28">
              <Reveal>
                <p className="text-eyebrow eyebrow-rule text-red">How it works</p>
                <ol className="mt-8 space-y-0">
                  {steps.map((s, i) => (
                    <li key={s.title} className="relative grid grid-cols-[3rem_1fr] pb-8 last:pb-0">
                      {i < steps.length - 1 && <span aria-hidden className="absolute bottom-0 left-[1.15rem] top-11 w-px bg-line" />}
                      <span className="grid size-[2.35rem] place-items-center rounded-full border border-red/30 bg-paper font-serif text-lg italic text-red">{i + 1}</span>
                      <span>
                        <span className="block font-semibold">{s.title}</span>
                        <span className="mt-1 block text-[0.9375rem] text-muted">{s.text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </Reveal>
              <Reveal delay={0.05} className="rounded-[22px] border border-line bg-paper p-6">
                <p className="font-semibold">Planning a move?</p>
                <p className="mt-2 text-sm text-muted">
                  Download, fill in and attach our moving checklist. Furniture assembly and disassembly are included in our moving services.
                </p>
                <a href={business.movingChecklistUrl} download className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red underline-offset-4 hover:underline">
                  <Download aria-hidden className="size-4" /> Moving Checklist (PDF)
                </a>
              </Reveal>
              <Reveal delay={0.08} className="on-dark rounded-[22px] bg-ink p-6 text-white">
                <p className="text-sm text-white/60">Prefer to talk it through?</p>
                <a href={`tel:+1${settings.contactPhone.replace(/\D/g, '')}`} className="mt-2 flex items-center gap-3 text-xl font-semibold">
                  <Phone aria-hidden className="size-5 text-red-warm" />
                  {settings.contactPhone}
                </a>
              </Reveal>
            </div>
          </aside>

          <Reveal className="order-1 lg:order-2">
            <div className="rounded-[24px] bg-paper p-6 shadow-card sm:p-10">
              <BookingForm variant="full" defaultService={preset} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
