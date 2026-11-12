import Image from 'next/image'
import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { business, navLinks, serviceAreas, services } from '@/lib/content'
import { ButtonLink } from '@/components/ui/button'
import { CityRoutes } from '@/components/ui/city-routes'
import { SocialLinks } from '@/components/ui/icons'

export function SiteFooter({ phone, email }: { phone: string; email: string }) {
  return (
    <footer className="on-dark relative isolate overflow-hidden bg-ink text-white">
      <CityRoutes tone="dark" className="opacity-70" />
      <div className="container-x relative">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/10 py-16 md:flex-row md:items-end md:py-20">
          <p className="max-w-3xl text-h2">
            Life gets busy. <span className="em-red">Let us handle the details.</span>
          </p>
          <ButtonLink href="/booking" className="shrink-0">
            Book a Service
          </ButtonLink>
        </div>

        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:gap-10">
          <div>
            <Image src="/images/brand/logo-on-dark.png" alt="The Convenient Concierge" width={900} height={498} className="h-auto w-52" />
            <p className="mt-6 max-w-xs text-[0.9375rem] leading-relaxed text-white/60">
              Your customer service specialists for moving, deliveries, tasks and errands, for homes and businesses across Toronto.
            </p>
            <SocialLinks className="mt-6" />
          </div>

          <nav aria-label="Footer">
            <h2 className="text-eyebrow text-white/45">Explore</h2>
            <ul className="mt-5 space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[0.9375rem] text-white/75 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/booking" className="text-[0.9375rem] text-white/75 transition-colors hover:text-white">
                  Book a Service
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-eyebrow text-white/45">Services</h2>
            <ul className="mt-5 space-y-2.5">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="text-[0.9375rem] text-white/75 transition-colors hover:text-white">
                    {s.name}
                  </Link>
                </li>
              ))}
              <li>
                <a href={business.movingChecklistUrl} className="text-[0.9375rem] text-white/75 transition-colors hover:text-white">
                  Moving Checklist (PDF)
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-eyebrow text-white/45">Get in touch</h2>
            <ul className="mt-5 space-y-4 text-[0.9375rem]">
              <li>
                <a href={`tel:+1${phone.replace(/\D/g, '')}`} className="group flex items-center gap-3 text-white">
                  <Phone aria-hidden className="size-4 text-red-warm" />
                  <span className="group-hover:underline group-hover:underline-offset-4">{phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="group flex items-center gap-3 break-all text-white">
                  <Mail aria-hidden className="size-4 shrink-0 text-red-warm" />
                  <span className="group-hover:underline group-hover:underline-offset-4">{email}</span>
                </a>
              </li>
              <li className="flex gap-3 text-white/60">
                <MapPin aria-hidden className="mt-1 size-4 shrink-0 text-red-warm" />
                <span className="leading-relaxed">{serviceAreas.join(' · ')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-7 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} The Convenient Concierge. All rights reserved. ·{' '}
            <Link href="/privacy-policy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
          </p>
          <p>Deliveries · Moving · Tasks &amp; Errands</p>
        </div>
      </div>
    </footer>
  )
}
