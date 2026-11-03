import { Lock } from 'lucide-react'
import { PageHeader, Panel } from '@/components/admin/page-header'
import { AdminField, AdminForm, SubmitButton, adminInput } from '@/components/admin/ui'
import { saveContactSettingsAction } from '@/app/admin/actions'
import { getSiteSettings } from '@/lib/data'

export const metadata = { title: 'Contact details' }

export default async function AdminSettings() {
  const s = await getSiteSettings()
  return (
    <>
      <PageHeader title="Contact details" description="The phone number and email shown in the header, footer, contact page and search results." />
      <Panel className="max-w-xl p-6">
        <AdminForm action={saveContactSettingsAction} className="space-y-5">
          <AdminField name="contactPhone" label="Business phone" hint="Format: 647-457-5252">
            <input id="contactPhone" name="contactPhone" type="tel" defaultValue={s.contactPhone} className={adminInput} />
          </AdminField>
          <AdminField name="contactEmail" label="Business email">
            <input id="contactEmail" name="contactEmail" type="email" defaultValue={s.contactEmail} className={adminInput} />
          </AdminField>
          <SubmitButton>Save contact details</SubmitButton>
        </AdminForm>
      </Panel>
      <p className="mt-6 flex max-w-xl items-start gap-2 text-sm text-muted">
        <Lock aria-hidden className="mt-0.5 size-4 shrink-0" />
        Services, service areas, page layouts, colours and other core website content are managed by your web team to keep the site consistent and secure.
      </p>
    </>
  )
}
