import { Hero } from '@/components/home/hero'
import { ServiceCards } from '@/components/sections/service-cards'
import { TrustStrip } from '@/components/sections/trust-strip'
import { WhyUs } from '@/components/sections/why-us'
import { PromiseSection } from '@/components/sections/promise'
import { Organisations } from '@/components/sections/organisations'
import { BookingCTA } from '@/components/sections/booking-cta'
import { getPublishedTestimonials, getSiteSettings } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

export const metadata = {
  ...pageMetadata({
    title: 'Toronto Moving Services, Furniture Delivery & Everyday Concierge Help',
    description:
      'Toronto moving services, furniture pickup and delivery, and personal concierge help with tasks and errands in Toronto, Etobicoke and East Mississauga.',
    path: '/',
  }),
  title: { absolute: 'Toronto Moving, Furniture Delivery & Errands | The Convenient Concierge' },
}

export default async function HomePage() {
  const [settings, testimonials] = await Promise.all([getSiteSettings(), getPublishedTestimonials()])
  return (
    <>
      <Hero image={settings.homepageHeroImageUrl} phone={settings.contactPhone} />

      <section aria-labelledby="services-heading" className="relative flow-root bg-cream">
        {/* Keeps the outline h1 > h2 > h3: the service cards use h3. */}
        <h2 id="services-heading" className="sr-only">
          Our services
        </h2>
        <div className="container-x relative z-10 -mt-[clamp(8rem,13vw,11.5rem)]">
          <ServiceCards images={{ moving: settings.movingImageUrl, delivery: settings.deliveryImageUrl, tasks: settings.tasksImageUrl }} />
        </div>
        <div className="container-x pb-6 pt-14 md:pt-16">
          <TrustStrip />
        </div>
      </section>

      <WhyUs image={settings.aboutImageUrl} />
      <PromiseSection testimonials={testimonials} />
      <Organisations />
      <BookingCTA phone={settings.contactPhone} />
    </>
  )
}
