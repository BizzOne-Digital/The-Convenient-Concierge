import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { CityRoutes } from '@/components/ui/city-routes'
import { JsonLd } from '@/components/ui/json-ld'
import { breadcrumbJsonLd } from '@/lib/seo'

export type Crumb = { name: string; path: string }

/** Cinematic dark hero for sub-pages, with breadcrumbs (visible + structured data). */
export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  imageAlt = '',
  crumbs,
  children,
  imagePosition = 'center',
  aside,
}: {
  /** Optional framed visual on the right (desktop), used for lower-resolution client photos. */
  aside?: ReactNode
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
  image: string
  imageAlt?: string
  crumbs: Crumb[]
  children?: ReactNode
  imagePosition?: string
}) {
  const trail = [{ name: 'Home', path: '/' }, ...crumbs]
  return (
    <section className="on-dark grain relative isolate overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 -z-10">
        <Image src={image} alt={imageAlt} fill priority sizes="100vw" quality={80} className="kenburns object-cover opacity-55" style={{ objectPosition: imagePosition }} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(16_16_18/0.95)_0%,rgb(16_16_18/0.78)_45%,rgb(16_16_18/0.35)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      </div>
      <CityRoutes tone="dark" className="-z-10 opacity-80" />
      <JsonLd data={breadcrumbJsonLd(trail)} />

      <div
        className={`container-x relative grid items-center gap-12 pb-20 pt-[calc(var(--header-h)+5.5rem)] md:pb-28 md:pt-[calc(var(--header-h)+7.5rem)] ${aside ? 'lg:grid-cols-[1.25fr_0.75fr]' : ''}`}
      >
        <div>
        <nav aria-label="Breadcrumb" className="rise mb-8" style={{ ['--d' as string]: 0 }}>
          <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-white/55">
            {trail.map((c, i) => (
              <li key={c.path} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight aria-hidden className="size-3.5 text-white/30" />}
                {i === trail.length - 1 ? (
                  <span aria-current="page" className="text-white/85">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.path} className="transition-colors hover:text-white">
                    {c.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <p className="rise text-eyebrow eyebrow-rule text-red-warm" style={{ ['--d' as string]: 80 }}>
          {eyebrow}
        </p>
        <h1 className="rise mt-6 max-w-4xl text-h1" style={{ ['--d' as string]: 160 }}>
          {title}
        </h1>
        {lead && (
          <p className="rise mt-7 max-w-2xl text-lead text-white/75" style={{ ['--d' as string]: 260 }}>
            {lead}
          </p>
        )}
        {children && (
          <div className="rise mt-10 flex flex-wrap gap-3" style={{ ['--d' as string]: 360 }}>
            {children}
          </div>
        )}
        </div>
        {aside && (
          <div className="rise hidden lg:block" style={{ ['--d' as string]: 300 }}>
            {aside}
          </div>
        )}
      </div>
    </section>
  )
}
