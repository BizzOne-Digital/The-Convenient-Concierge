import { Phone } from 'lucide-react'
import type { ServiceType } from '@/lib/content'
import { BookingForm } from '@/components/forms/booking-form'
import { CityRoutes } from '@/components/ui/city-routes'
import { Reveal } from '@/components/ui/reveal'

export function BookingCTA({ phone, defaultService, title }: { phone: string; defaultService?: ServiceType; title?: string }) {
  return (
    <section id="book" className="on-red relative isolate overflow-hidden bg-red-deep text-white" aria-labelledby="cta-title">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_90%_at_15%_20%,#d4142f_0%,#b20f27_45%,#8d0c1f_100%)]" />
      <CityRoutes tone="red" className="-z-10" />
      <div className="container-x section-y grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-32 lg:pt-8">
          <p className="text-eyebrow eyebrow-rule text-white/80">Book a service</p>
          <h2 id="cta-title" className="mt-6 text-h2">
            {title ?? (
              <>
                Ready to Get <span className="italic">Started?</span>
              </>
            )}
          </h2>
          <p className="mt-6 max-w-md text-lead text-white/85">Tell us what you need help with. We&rsquo;d love to make your day a little easier.</p>
          <a
            href={`tel:+1${phone.replace(/\D/g, '')}`}
            className="mt-10 inline-flex items-center gap-4 rounded-2xl border border-white/20 bg-white/[0.06] py-3 pl-3 pr-6 backdrop-blur-sm transition-colors hover:bg-white/[0.12]"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-white text-red">
              <Phone aria-hidden className="size-5" />
            </span>
            <span>
              <span className="block text-xs uppercase tracking-[0.16em] text-white/70">Prefer to talk?</span>
              <span className="block text-lg font-semibold">{phone}</span>
            </span>
          </a>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-[24px] bg-paper p-6 text-text shadow-[0_40px_80px_-40px_rgb(60_0_10/0.7)] sm:p-9">
            <BookingForm variant="quick" defaultService={defaultService} />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
