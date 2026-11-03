import Link from 'next/link'
import { Paperclip } from 'lucide-react'
import { PageHeader, Panel, StatusBadge } from '@/components/admin/page-header'
import { connectDB } from '@/lib/mongodb'
import { serviceByType } from '@/lib/content'
import { BookingInquiry, bookingStatuses } from '@/models'

export const metadata = { title: 'Booking requests' }

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const filter = (bookingStatuses as readonly string[]).includes(status ?? '') ? { status } : {}
  await connectDB()
  // ponytail: newest 200 only; add pagination when volume needs it.
  const rows = await BookingInquiry.find(filter).sort({ createdAt: -1 }).limit(200).select('name email phone serviceType status preferredDate createdAt attachmentUrl').lean()
  const tabs = [{ key: '', label: 'All' }, ...bookingStatuses.map((s) => ({ key: s, label: s.replace('-', ' ') }))]
  return (
    <>
      <PageHeader title="Booking requests" description="Requests and enquiries from the website. Open a request to update its status." />
      <nav aria-label="Filter by status" className="mb-4 flex flex-wrap gap-1.5">
        {tabs.map((t) => {
          const active = (status ?? '') === t.key
          return (
            <Link
              key={t.key}
              href={t.key ? `/admin/bookings?status=${t.key}` : '/admin/bookings'}
              aria-current={active ? 'page' : undefined}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-colors ${active ? 'bg-ink text-white' : 'bg-white text-text hover:bg-cream'}`}
            >
              {t.label}
            </Link>
          )
        })}
      </nav>
      <Panel className="overflow-x-auto">
        {rows.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-muted">No requests here yet.</p>
        ) : (
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="border-b border-[#efe8e2] text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Service</th>
                <th className="px-5 py-3 font-semibold">Preferred date</th>
                <th className="px-5 py-3 font-semibold">Received</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efe8e2]">
              {rows.map((b) => (
                <tr key={String(b._id)} className="hover:bg-[#faf8f6]">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/bookings/${b._id}`} className="font-semibold hover:text-red">
                      {b.name}
                    </Link>
                    <span className="block text-xs text-muted">{b.email}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5">
                      {serviceByType(b.serviceType)?.name ?? 'General enquiry'}
                      {b.attachmentUrl && <Paperclip aria-label="Has attachment" className="size-3.5 text-muted" />}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">{b.preferredDate ? new Date(b.preferredDate).toLocaleDateString('en-CA', { dateStyle: 'medium' }) : '-'}</td>
                  <td className="px-5 py-3.5 text-muted">{new Date(b.createdAt as Date).toLocaleDateString('en-CA', { dateStyle: 'medium' })}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  )
}
