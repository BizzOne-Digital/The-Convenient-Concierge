import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Splash } from '@/components/layout/splash'
import { JsonLd } from '@/components/ui/json-ld'
import { getSiteSettings } from '@/lib/data'
import { localBusinessJsonLd } from '@/lib/seo'

// Static pages, refreshed every 5 minutes; admin edits also revalidate on save.
export const revalidate = 300

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  return (
    <>
      <Splash />
      <a
        href="#main"
        className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink shadow-lift transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <SiteHeader phone={settings.contactPhone} />
      <main id="main">{children}</main>
      <SiteFooter phone={settings.contactPhone} email={settings.contactEmail} />
      <JsonLd data={localBusinessJsonLd(settings.contactPhone, settings.contactEmail)} />
    </>
  )
}
