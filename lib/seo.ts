import type { Metadata } from 'next'
import { areaSummary, business, serviceAreas, services } from '@/lib/content'

export const absoluteUrl = (path = '/') => new URL(path, business.siteUrl).toString()

export function pageMetadata({
  title,
  description,
  path,
  image = '/images/og-default.jpg',
  type = 'website',
}: {
  title: string
  description: string
  path: string
  image?: string
  type?: 'website' | 'article'
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${business.name}`,
      description,
      url: path,
      siteName: business.name,
      locale: 'en_CA',
      type,
      images: [{ url: image, width: 1200, height: 630, alt: business.name }],
    },
    twitter: { card: 'summary_large_image', title: `${title} | ${business.name}`, description, images: [image] },
  }
}

const areaServed = [
  { '@type': 'City', name: 'Toronto, ON' },
  { '@type': 'AdministrativeArea', name: 'Greater Toronto Area, ON' },
  ...serviceAreas.filter((n) => n !== 'Downtown Toronto').map((name) => ({ '@type': 'Place', name: `${name}, ON` })),
]

export function localBusinessJsonLd(phone: string, email: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': absoluteUrl('/#business'),
    name: business.name,
    slogan: business.promise,
    description:
      `Moving, pick-up & delivery, and tasks & errands for residential and corporate clients in ${areaSummary}.`,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/images/brand/logo-on-light.png'),
    image: absoluteUrl('/images/og-default.jpg'),
    telephone: `+1-${phone}`,
    email,
    areaServed,
    sameAs: business.social.map((s) => s.href),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Concierge services',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name, url: absoluteUrl(`/services/${s.slug}`) },
      })),
    },
  }
}

export function serviceJsonLd(slug: string) {
  const s = services.find((x) => x.slug === slug)
  if (!s) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    serviceType: s.name,
    description: s.summary,
    url: absoluteUrl(`/services/${s.slug}`),
    provider: { '@id': absoluteUrl('/#business') },
    areaServed,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: s.name,
      itemListElement: s.items.map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
    },
  }
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: absoluteUrl(t.path) })),
  }
}
