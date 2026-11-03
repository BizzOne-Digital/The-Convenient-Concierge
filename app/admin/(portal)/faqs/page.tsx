import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { PageHeader, Panel } from '@/components/admin/page-header'
import { ActionButton, AdminField, AdminForm, ConfirmButton, SubmitButton, adminInput } from '@/components/admin/ui'
import { deleteFaqAction, moveFaqAction, saveFaqAction } from '@/app/admin/actions'
import { connectDB } from '@/lib/mongodb'
import { FAQ } from '@/models'

export const metadata = { title: 'FAQs' }

export default async function AdminFaqs() {
  await connectDB()
  const faqs = await FAQ.find().sort({ sortOrder: 1, createdAt: 1 }).lean()
  return (
    <>
      <PageHeader title="FAQs" description="Questions shown on the FAQ page, in this order. Unpublished questions stay hidden." />

      <Panel className="mb-8 p-6">
        <h2 className="mb-4 font-semibold">Add a question</h2>
        <AdminForm action={saveFaqAction.bind(null, null)} resetOnSuccess className="space-y-4">
          <AdminField name="question" label="Question">
            <input id="question" name="question" className={adminInput} required />
          </AdminField>
          <AdminField name="answer" label="Answer">
            <textarea id="answer" name="answer" rows={3} className={adminInput} required />
          </AdminField>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="isPublished" defaultChecked className="size-4 accent-[#c8102e]" /> Publish now
            </label>
            <SubmitButton>Add FAQ</SubmitButton>
          </div>
        </AdminForm>
      </Panel>

      {faqs.length === 0 ? (
        <Panel className="px-5 py-14 text-center text-sm text-muted">No FAQs yet. Run the seed script to add the verified starter questions.</Panel>
      ) : (
        <ol className="space-y-3">
          {faqs.map((f, i) => {
            const id = String(f._id)
            return (
              <li key={id}>
                <Panel>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4">
                      <span className="w-6 text-xs font-semibold tabular-nums text-muted">{String(i + 1).padStart(2, '0')}</span>
                      <span className="flex-1 font-medium">{f.question}</span>
                      {!f.isPublished && <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-semibold">Hidden</span>}
                      <ChevronDown aria-hidden className="size-4 text-muted transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-[#efe8e2] p-5">
                      <AdminForm action={saveFaqAction.bind(null, id)} className="space-y-4">
                        <AdminField name="question" label="Question">
                          <input id={`q-${id}`} name="question" defaultValue={f.question} className={adminInput} />
                        </AdminField>
                        <AdminField name="answer" label="Answer">
                          <textarea id={`a-${id}`} name="answer" defaultValue={f.answer} rows={4} className={adminInput} />
                        </AdminField>
                        <input type="hidden" name="sortOrder" value={f.sortOrder} />
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <label className="flex items-center gap-2 text-sm font-medium">
                            <input type="checkbox" name="isPublished" defaultChecked={f.isPublished} className="size-4 accent-[#c8102e]" /> Published
                          </label>
                          <div className="flex items-center gap-2">
                            <ActionButton label="Move up" action={moveFaqAction.bind(null, id, 'up')} className={i === 0 ? 'invisible' : ''}>
                              <ChevronUp aria-hidden className="size-4" />
                            </ActionButton>
                            <ActionButton label="Move down" action={moveFaqAction.bind(null, id, 'down')} className={i === faqs.length - 1 ? 'invisible' : ''}>
                              <ChevronDown aria-hidden className="size-4" />
                            </ActionButton>
                            <ConfirmButton action={deleteFaqAction.bind(null, id)} message="Delete this FAQ?">
                              <Trash2 aria-hidden className="size-4" /> Delete
                            </ConfirmButton>
                            <SubmitButton>Save</SubmitButton>
                          </div>
                        </div>
                      </AdminForm>
                    </div>
                  </details>
                </Panel>
              </li>
            )
          })}
        </ol>
      )}
    </>
  )
}
