import { Phone } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button'
import { SafeImage } from '@/components/ui/safe-image'
import { HeroList } from './hero-list'

export function Hero({ image, phone }: { image: string; phone: string }) {
  return (
    <section className="on-dark grain relative isolate overflow-hidden bg-ink text-white" aria-labelledby="hero-title">
      <div className="absolute inset-0 -z-10">
        <SafeImage
          src={image}
          fallback="/images/photos/toronto-skyline-sunset.jpg"
          alt="The Toronto skyline and CN Tower at sunset, reflected in Lake Ontario"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={80}
          className="kenburns object-cover object-[62%_50%] saturate-[1.15]"
        />
        {/* Layered overlays: legibility on the left, warmth kept on the right */}
        <div className="absolute inset-0 bg-[linear-gradient(95deg,rgb(16_16_18/0.9)_0%,rgb(16_16_18/0.74)_32%,rgb(16_16_18/0.22)_62%,rgb(16_16_18/0.05)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_75%_45%,rgb(255_150_90/0.22),transparent_70%)] mix-blend-soft-light" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-ink/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
      </div>

      <div className="container-x relative grid items-center gap-16 pb-[clamp(11rem,18vw,15rem)] pt-[calc(var(--header-h)+4.5rem)] lg:grid-cols-[1.25fr_0.75fr] lg:pt-[calc(var(--header-h)+6.5rem)]">
        <div>
          <p className="rise text-eyebrow eyebrow-rule text-white/85" style={{ ['--d' as string]: 60 }}>
            Your personal concierge service
          </p>
          <h1 id="hero-title" className="rise mt-7 max-w-3xl text-h1" style={{ ['--d' as string]: 140 }}>
            Toronto Moving Services, Furniture Delivery <span className="em-red">&amp;</span> Everyday Concierge Help
          </h1>
          <p className="rise mt-8 max-w-xl text-lead text-white/78" style={{ ['--d' as string]: 260 }}>
            Home, condo and office moves, furniture and appliance pickup and delivery, and everyday tasks and errands for
            homes and businesses throughout Toronto and the GTA. Life gets busy. Let us handle the details.
          </p>
          <div className="rise mt-10 flex flex-wrap gap-3" style={{ ['--d' as string]: 380 }}>
            <ButtonLink href="/booking">Request a Free Quote</ButtonLink>
            <ButtonLink href={`tel:+1${phone.replace(/\D/g, '')}`} variant="outline-light" arrow={false}>
              <Phone aria-hidden className="size-4" />
              Call Now
            </ButtonLink>
          </div>
          <p className="rise mt-12 flex items-center gap-3 text-sm text-white/55" style={{ ['--d' as string]: 500 }}>
            <span className="h-px w-8 bg-white/30" />
            Residential &amp; corporate clients in Toronto, Etobicoke, Mississauga &amp; the GTA
          </p>
        </div>

        <div className="rise hidden sm:block" style={{ ['--d' as string]: 420 }}>
          <HeroList />
        </div>
      </div>
    </section>
  )
}
