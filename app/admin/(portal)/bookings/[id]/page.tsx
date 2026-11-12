import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Types } from 'mongoose'
import { ArrowLeft, Download, Mail, Phone, Trash2 } from 'lucide-react'
import { PageHeader, Panel, StatusBadge } from '@/components/admin/page-header'
import { AdminForm, ConfirmButton, SubmitButton, adminInput } from '@/components/admin/ui'
import { deleteBookingAction, setBookingStatusAction } from '@/app/admin/actions'
import { connectDB } from '@/lib/mongodb'
import { serviceByType } from '@/lib/content'
import { inquiryFieldLabels } from '@/lib/inquiries'
import { BookingInquiry, bookingStatuses } from '@/models'

export const metadata = { title: 'Booking request' }

export default async function BookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!Types.ObjectId.isValid(id)) notFound()
  await connectDB()
  const b = await BookingInquiry.findById(id).lean()
  if (!b) notFound()

  const l = inquiryFieldLabels(b.serviceType)
  const rows: [string, string | undefined | null][] = [
    ['Service', serviceByType(b.serviceType)?.name ?? 'General enquiry'],
    ['Preferred date', b.preferredDate ? new Date(b.preferredDate).toLocaleDateString('en-CA', { dateStyle: 'full' }) : null],
    [l.pickupAddress, b.pickupAddress],
    [l.destinationAddress, b.destinationAddress],
    ['Property type', b.propertyType],
    ['Stairs / elevator', b.accessDetails],
    ['Packing', b.packing],
    [l.itemDetails, b.itemDetails],
  ]
  const setStatus = setBookingStatusAction.bind(null, id)
  const remove = deleteBookingAction.bind(null, id)

  return (
    <>
      <Link href="/admin/bookings" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-text">
        <ArrowLeft aria-hidden className="size-4" /> All requests
      </Link>
      <PageHeader
        title={b.name}
        description={`Received ${new Date(b.createdAt as Date).toLocaleString('en-CA', { dateStyle: 'long', timeStyle: 'short' })}`}
        actions={<StatusBadge status={b.status} />}
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <Panel className="p-6">
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {rows
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{k}</dt>
                  <dd className="mt-1 whitespace-pre-line">{v}</dd>
                </div>
              ))}
          </dl>
          <div className="mt-6 border-t border-[#efe8e2] pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{b.serviceType === 'general' ? 'Message' : 'Description'}</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed">{b.description}</p>
          </div>
          {b.attachmentUrl && (
            <a href={b.attachmentUrl} className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#e3dad3] px-4 py-2.5 text-sm font-semibold hover:bg-cream">
              <Download aria-hidden className="size-4" /> Download attachment (moving checklist)
            </a>
          )}
          {b.photoUrls?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {b.photoUrls.map((url: string, i: number) => (
                <a key={url} href={url} className="inline-flex items-center gap-2 rounded-lg border border-[#e3dad3] px-4 py-2.5 text-sm font-semibold hover:bg-cream">
                  <Download aria-hidden className="size-4" /> Photo {i + 1}
                </a>
              ))}
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel className="p-6">
            <h2 className="font-semibold">Contact</h2>
            <a href={`mailto:${b.email}`} className="mt-4 flex items-center gap-2 break-all text-sm hover:text-red">
              <Mail aria-hidden className="size-4 shrink-0" /> {b.email}
            </a>
            {b.phone && (
              <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`} className="mt-2 flex items-center gap-2 text-sm hover:text-red">
                <Phone aria-hidden className="size-4" /> {b.phone}
              </a>
            )}
          </Panel>
          <Panel className="p-6">
            <h2 className="font-semibold">Status</h2>
            <AdminForm action={setStatus} className="mt-4 space-y-3">
              <label htmlFor="status" className="sr-only">
                Status
              </label>
              <select id="status" name="status" defaultValue={b.status} className={`${adminInput} capitalize`}>
                {bookingStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('-', ' ')}
                  </option>
                ))}
              </select>
              <SubmitButton className="w-full">Update status</SubmitButton>
            </AdminForm>
            {b.status === 'new' && (
              <AdminForm action={setStatus} className="mt-3">
                <input type="hidden" name="status" value="contacted" />
                <SubmitButton variant="ghost" className="w-full">
                  Mark as contacted
                </SubmitButton>
              </AdminForm>
            )}
          </Panel>
          <ConfirmButton action={remove} message="Delete this request permanently? This cannot be undone.">
            <Trash2 aria-hidden className="size-4" /> Delete request
          </ConfirmButton>
        </div>
      </div>
    </>
  )
}
