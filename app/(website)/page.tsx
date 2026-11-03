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
    title: 'Moving, Deliveries, Tasks & Errands in Toronto',
    description:
      'Your personal concierge in Toronto. Moving, pick-up & delivery, and tasks & errands for homes and businesses, from Downtown Toronto and Etobicoke to East Mississauga.',
    path: '/',
  }),
  title: { absolute: 'The Convenient Concierge | Moving, Deliveries, Tasks & Errands in Toronto' },
}

export default async function HomePage() {
  const [settings, testimonials] = await Promise.all([getSiteSettings(), getPublishedTestimonials()])
  return (
    <>
      <Hero image={settings.homepageHeroImageUrl} />

      <section aria-label="Our services" className="relative flow-root bg-cream">
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
