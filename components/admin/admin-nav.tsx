'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CircleHelp, Images, Inbox, LayoutDashboard, MessageSquareQuote, Newspaper, Settings } from 'lucide-react'

const items = [
  { href: '/admin', label: 'Overview', Icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Booking requests', Icon: Inbox },
  { href: '/admin/blog', label: 'Blog', Icon: Newspaper },
  { href: '/admin/faqs', label: 'FAQs', Icon: CircleHelp },
  { href: '/admin/testimonials', label: 'Testimonials', Icon: MessageSquareQuote },
  { href: '/admin/images', label: 'Website images', Icon: Images },
  { href: '/admin/settings', label: 'Contact details', Icon: Settings },
]

export function AdminNav({ newCount }: { newCount: number }) {
  const path = usePathname()
  return (
    <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {items.map(({ href, label, Icon }) => {
        const active = href === '/admin' ? path === '/admin' : path.startsWith(href)
        return (
          <li key={href} className="shrink-0">
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon aria-hidden className={`size-4 ${active ? 'text-red-warm' : ''}`} />
              {label}
              {href === '/admin/bookings' && newCount > 0 && (
                <span className="ml-auto rounded-full bg-red px-2 py-0.5 text-[0.7rem] font-bold text-white">{newCount}</span>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
