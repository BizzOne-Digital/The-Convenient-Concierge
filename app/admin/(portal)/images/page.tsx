import { PageHeader } from '@/components/admin/page-header'
import { ImageSettingsForm } from '@/components/admin/image-settings-form'
import { connectDB } from '@/lib/mongodb'
import { SiteSettings } from '@/models'

export const metadata = { title: 'Website images' }

export default async function AdminImages() {
  await connectDB()
  const s = await SiteSettings.findOne({ key: 'site' }).lean()
  return (
    <>
      <PageHeader
        title="Website images"
        description="Replace the main photos used across the website. New images are stored securely and old ones are removed automatically after you save."
      />
      <ImageSettingsForm
        initial={{
          homepageHeroImageUrl: s?.homepageHeroImageUrl ?? '',
          movingImageUrl: s?.movingImageUrl ?? '',
          deliveryImageUrl: s?.deliveryImageUrl ?? '',
          tasksImageUrl: s?.tasksImageUrl ?? '',
          aboutImageUrl: s?.aboutImageUrl ?? '',
        }}
        gallery={s?.galleryImageUrls ?? []}
      />
    </>
  )
}
