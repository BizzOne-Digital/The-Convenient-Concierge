'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, CalendarCheck, ChevronDown, MapPin, Menu, Phone, X } from 'lucide-react'
import { navLinks, services } from '@/lib/content'
import { ServiceIcon } from '@/components/ui/icons'
import { buttonClass } from '@/components/ui/button'

const tel = (p: string) => `tel:+1${p.replace(/\D/g, '')}`

export function SiteHeader({ phone }: { phone: string }) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const drawer = useRef<HTMLDialogElement>(null)
  const servicesRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menus on navigation.
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setServicesOpen(false)
  }
  useEffect(() => drawer.current?.close(), [pathname])

  useEffect(() => {
    if (!servicesOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setServicesOpen(false)
    const onClick = (e: MouseEvent) => !servicesRef.current?.contains(e.target as Node) && setServicesOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [servicesOpen])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <header className="on-dark fixed inset-x-0 top-0 z-50 text-white">
      {/* Information strip */}
      <div className="collapse-row" data-collapsed={scrolled}>
        <div>
          <div className="border-b border-white/10 bg-ink/70 backdrop-blur-sm">
            <div className="container-x flex h-10 items-center justify-between gap-4 text-[0.8125rem] text-white/75">
              <p className="flex min-w-0 items-center gap-2">
                <MapPin aria-hidden className="size-3.5 shrink-0 text-red-warm" />
                <span className="truncate">
                  <span className="sm:hidden">Serving Toronto &amp; Etobicoke</span>
                  <span className="hidden sm:inline">Serving Toronto, Etobicoke &amp; East Mississauga</span>
                </span>
              </p>
              <a href={tel(phone)} className="flex shrink-0 items-center gap-2 font-medium text-white transition-colors hover:text-red-warm">
                <Phone aria-hidden className="size-3.5" />
                {phone}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={`border-b transition-[background-color,border-color,box-shadow] duration-500 ease-[var(--ease-out-expo)] ${
          scrolled
            ? 'border-white/10 bg-ink/88 shadow-[0_20px_40px_-30px_rgb(0_0_0/0.8)] backdrop-blur-xl'
            : 'border-transparent bg-gradient-to-b from-ink/60 to-transparent'
        }`}
      >
        <nav aria-label="Main" className={`container-x flex items-center justify-between gap-6 transition-[height] duration-500 ${scrolled ? 'h-[72px]' : 'h-[84px]'}`}>
          <Link href="/" className="relative shrink-0" aria-label="The Convenient Concierge, home">
            <Image
              src="/images/brand/logo-nav-dark.png"
              alt="The Convenient Concierge"
              width={640}
              height={330}
              priority
              className={`w-auto transition-[height] duration-500 ${scrolled ? 'h-11' : 'h-[52px]'}`}
            />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) =>
              l.href === '/services' ? (
                <li
                  key={l.href}
                  ref={servicesRef}
                  className="relative"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <div className="flex items-center">
                    <Link href="/services" className={navItem(isActive(l.href))} aria-current={isActive(l.href) ? 'page' : undefined}>
                      Services
                    </Link>
                    <button
                      type="button"
                      aria-expanded={servicesOpen}
                      aria-controls="services-menu"
                      aria-label="Show services"
                      onClick={() => setServicesOpen((v) => !v)}
                      className="-ml-2 grid size-8 place-items-center rounded-full text-white/70 hover:text-white"
                    >
                      <ChevronDown aria-hidden className={`size-4 transition-transform duration-300 ${servicesOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  <div
                    id="services-menu"
                    className={`absolute left-1/2 top-full w-[26rem] -translate-x-1/2 pt-3 transition-[opacity,translate] duration-300 ease-[var(--ease-out-expo)] ${
                      servicesOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden rounded-2xl bg-paper p-2 text-text shadow-lift ring-1 ring-black/5">
                      {services.map((s) => (
                        <Link
                          key={s.slug}
                          href={`/services/${s.slug}`}
                          className="group/item flex items-start gap-4 rounded-xl p-3.5 transition-colors hover:bg-cream"
                        >
                          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-red/[0.08] text-red transition-colors group-hover/item:bg-red group-hover/item:text-white">
                            <ServiceIcon icon={s.icon} className="size-5" />
                          </span>
                          <span>
                            <span className="block font-semibold">{s.name}</span>
                            <span className="mt-0.5 line-clamp-2 text-sm leading-snug text-muted">{s.summary}</span>
                          </span>
                        </Link>
                      ))}
                      <Link
                        href="/services"
                        className="mt-1 flex items-center justify-between rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-2"
                      >
                        View all services
                        <ArrowRight aria-hidden className="size-4" />
                      </Link>
                    </div>
                  </div>
                </li>
              ) : (
                <li key={l.href}>
                  <Link href={l.href} className={navItem(isActive(l.href))} aria-current={isActive(l.href) ? 'page' : undefined}>
                    {l.label}
                  </Link>
                </li>
              ),
            )}
          </ul>

          <div className="flex items-center gap-2">
            <Link href="/booking" className={buttonClass('primary', 'min-h-11 whitespace-nowrap px-5 text-sm max-sm:hidden')}>
              <CalendarCheck aria-hidden className="size-4" />
              Book a Service
            </Link>
            <button
              type="button"
              onClick={() => drawer.current?.showModal()}
              className="grid size-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 lg:hidden"
              aria-label="Open menu"
              aria-haspopup="dialog"
            >
              <Menu aria-hidden className="size-5" />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile drawer */}
      <dialog
        ref={drawer}
        className="drawer on-dark"
        aria-label="Menu"
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      >
        <div className="relative flex h-full flex-col overflow-y-auto">
          <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 px-6">
            <Image src="/images/brand/logo-nav-dark.png" alt="" width={640} height={330} className="h-10 w-auto" />
            <button
              type="button"
              onClick={() => drawer.current?.close()}
              className="grid size-11 place-items-center rounded-full border border-white/20"
              aria-label="Close menu"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>
          <ul className="px-6 pt-6">
            {navLinks.map((l, i) => (
              <li key={l.href} className="border-b border-white/[0.07]">
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? 'page' : undefined}
                  className={`flex items-baseline justify-between py-3.5 font-serif text-[2rem] leading-none transition-colors ${
                    isActive(l.href) ? 'text-white' : 'text-white/75 hover:text-white'
                  }`}
                >
                  {l.label}
                  <span className="font-sans text-xs tabular-nums text-white/35">0{i + 1}</span>
                </Link>
                {l.href === '/services' && (
                  <ul className="-mt-1 mb-4 grid gap-1">
                    {services.map((s) => (
                      <li key={s.slug}>
                        <Link href={`/services/${s.slug}`} className="flex items-center gap-3 py-1.5 text-[0.9375rem] text-white/70 hover:text-white">
                          <ServiceIcon icon={s.icon} className="size-4 text-red-warm" />
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-auto space-y-3 p-6">
            <Link href="/booking" className={buttonClass('primary', 'w-full')}>
              Book a Service
            </Link>
            <a href={tel(phone)} className={buttonClass('outline-light', 'w-full')}>
              <Phone aria-hidden className="size-4" />
              Call {phone}
            </a>
          </div>
        </div>
      </dialog>
    </header>
  )
}

const navItem = (active: boolean) =>
  `relative inline-flex h-10 items-center rounded-full px-3.5 text-[0.9375rem] font-medium transition-colors after:absolute after:inset-x-3.5 after:bottom-1 after:h-[2px] after:origin-left after:rounded-full after:bg-red-warm after:transition-transform after:duration-500 after:ease-[var(--ease-out-expo)] ${
    active ? 'text-white after:scale-x-100' : 'text-white/75 after:scale-x-0 hover:text-white hover:after:scale-x-100'
  }`
