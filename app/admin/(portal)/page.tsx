import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PageHeader, Panel, StatusBadge } from '@/components/admin/page-header'
import { getDashboardStats } from '@/lib/admin-service'
import { connectDB } from '@/lib/mongodb'
import { serviceByType } from '@/lib/content'
import { BookingInquiry } from '@/models'

export const metadata = { title: 'Overview' }

export default async function AdminDashboard() {
  await connectDB()
  const [stats, recent] = await Promise.all([
    getDashboardStats(),
    BookingInquiry.find().sort({ createdAt: -1 }).limit(6).select('name serviceType status createdAt').lean(),
  ])
  const cards = [
    { label: 'Total requests', value: stats.total, href: '/admin/bookings' },
    { label: 'New', value: stats.new, href: '/admin/bookings?status=new', accent: true },
    { label: 'In progress', value: stats.inProgress, href: '/admin/bookings?status=in-progress' },
    { label: 'Completed', value: stats.completed, href: '/admin/bookings?status=completed' },
  ]
  const content = [
    { label: 'Published blog posts', value: stats.posts, href: '/admin/blog' },
    { label: 'Published FAQs', value: stats.faqs, href: '/admin/faqs' },
    { label: 'Published testimonials', value: stats.testimonials, href: '/admin/testimonials' },
  ]
  return (
    <>
      <PageHeader title="Overview" description="A snapshot of booking requests and published content." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className={`rounded-2xl border p-5 transition-shadow hover:shadow-card ${c.accent ? 'border-red bg-red text-white' : 'border-[#e8e0da] bg-white'}`}>
            <p className={`text-sm ${c.accent ? 'text-white/80' : 'text-muted'}`}>{c.label}</p>
            <p className="mt-3 font-serif text-5xl leading-none">{c.value}</p>
          </Link>
        ))}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {content.map((c) => (
          <Link key={c.label} href={c.href} className="flex items-center justify-between rounded-2xl border border-[#e8e0da] bg-white p-5 transition-shadow hover:shadow-card">
            <span>
              <span className="block text-sm text-muted">{c.label}</span>
              <span className="mt-1 block text-2xl font-semibold">{c.value}</span>
            </span>
            <ArrowRight aria-hidden className="size-4 text-muted" />
          </Link>
        ))}
      </div>

      <Panel className="mt-8">
        <div className="flex items-center justify-between border-b border-[#efe8e2] px-5 py-4">
          <h2 className="font-semibold">Latest requests</h2>
          <Link href="/admin/bookings" className="text-sm font-semibold text-red">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">No booking requests yet. New requests from the website will appear here.</p>
        ) : (
          <ul className="divide-y divide-[#efe8e2]">
            {recent.map((b) => (
              <li key={String(b._id)}>
                <Link href={`/admin/bookings/${b._id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-[#faf8f6]">
                  <span>
                    <span className="block font-medium">{b.name}</span>
                    <span className="text-sm text-muted">
                      {serviceByType(b.serviceType)?.name ?? 'General enquiry'} · {new Date(b.createdAt as Date).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </span>
                  <StatusBadge status={b.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  )
}
