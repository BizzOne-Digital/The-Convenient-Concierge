import { ShieldCheck, Trash2 } from 'lucide-react'
import { PageHeader, Panel } from '@/components/admin/page-header'
import { AdminField, AdminForm, ConfirmButton, SubmitButton, adminInput } from '@/components/admin/ui'
import { deleteTestimonialAction, saveTestimonialAction } from '@/app/admin/actions'
import { connectDB } from '@/lib/mongodb'
import { services } from '@/lib/content'
import { Testimonial } from '@/models'

export const metadata = { title: 'Testimonials' }

function Fields({ t, idSuffix }: { t?: { customerName: string; quote: string; serviceType?: string | null; sortOrder: number; isPublished: boolean }; idSuffix: string }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[1fr_14rem_7rem]">
        <AdminField name="customerName" label="Customer name">
          <input id={`n-${idSuffix}`} name="customerName" defaultValue={t?.customerName} className={adminInput} />
        </AdminField>
        <AdminField name="serviceType" label="Service">
          <select id={`s-${idSuffix}`} name="serviceType" defaultValue={t?.serviceType ?? ''} className={adminInput}>
            <option value="">Not specified</option>
            {services.map((s) => (
              <option key={s.type} value={s.type}>
                {s.name}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField name="sortOrder" label="Order">
          <input id={`o-${idSuffix}`} name="sortOrder" type="number" min={0} defaultValue={t?.sortOrder ?? 0} className={adminInput} />
        </AdminField>
      </div>
      <AdminField name="quote" label="Testimonial (customer's own words)">
        <textarea id={`t-${idSuffix}`} name="quote" defaultValue={t?.quote} rows={3} className={adminInput} />
      </AdminField>
    </>
  )
}

export default async function AdminTestimonials() {
  await connectDB()
  const items = await Testimonial.find().sort({ sortOrder: 1, createdAt: -1 }).lean()
  return (
    <>
      <PageHeader title="Testimonials" description="Only publish genuine feedback that the customer has approved for use on the website." />
      <Panel className="mb-8 p-6">
        <div className="mb-5 flex items-start gap-3 rounded-xl bg-[#faf8f6] p-4 text-sm text-muted">
          <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-emerald-700" />
          Add real customer feedback only. Get the customer&rsquo;s permission before publishing their name and words.
        </div>
        <AdminForm action={saveTestimonialAction.bind(null, null)} resetOnSuccess className="space-y-4">
          <Fields idSuffix="new" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="isPublished" className="size-4 accent-[#c8102e]" /> Publish (customer approved)
            </label>
            <SubmitButton>Add testimonial</SubmitButton>
          </div>
        </AdminForm>
      </Panel>

      {items.length === 0 ? (
        <Panel className="px-5 py-14 text-center text-sm text-muted">No testimonials yet. The website shows an elegant placeholder until you publish one.</Panel>
      ) : (
        <ul className="space-y-4">
          {items.map((t) => {
            const id = String(t._id)
            return (
              <li key={id}>
                <Panel className="p-6">
                  <AdminForm action={saveTestimonialAction.bind(null, id)} className="space-y-4">
                    <Fields t={t} idSuffix={id} />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <input type="checkbox" name="isPublished" defaultChecked={t.isPublished} className="size-4 accent-[#c8102e]" /> Published
                      </label>
                      <div className="flex gap-2">
                        <ConfirmButton action={deleteTestimonialAction.bind(null, id)} message="Delete this testimonial?">
                          <Trash2 aria-hidden className="size-4" /> Delete
                        </ConfirmButton>
                        <SubmitButton>Save</SubmitButton>
                      </div>
                    </div>
                  </AdminForm>
                </Panel>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
