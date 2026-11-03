'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { saveImageSettingsAction } from '@/app/admin/actions'
import { AdminForm, SubmitButton } from './ui'
import { LocalImageField } from './local-image-field'

type Slots = { homepageHeroImageUrl: string; movingImageUrl: string; deliveryImageUrl: string; tasksImageUrl: string; aboutImageUrl: string }

const slotMeta: { key: keyof Slots; label: string; hint: string; aspect: string }[] = [
  { key: 'homepageHeroImageUrl', label: 'Homepage hero', hint: 'Wide landscape, at least 2000px wide', aspect: 'aspect-[16/7]' },
  { key: 'movingImageUrl', label: 'Moving service', hint: 'Landscape, at least 1200px wide', aspect: 'aspect-[16/11]' },
  { key: 'deliveryImageUrl', label: 'Pick-up & Delivery service', hint: 'Landscape, at least 1200px wide', aspect: 'aspect-[16/11]' },
  { key: 'tasksImageUrl', label: 'Tasks & Errands service', hint: 'Landscape, at least 1200px wide', aspect: 'aspect-[16/11]' },
  { key: 'aboutImageUrl', label: 'About / Why choose us', hint: 'Portrait or square, warm lifestyle photo', aspect: 'aspect-[4/5]' },
]

export function ImageSettingsForm({ initial, gallery: initialGallery }: { initial: Slots; gallery: string[] }) {
  const [slots, setSlots] = useState(initial)
  const [gallery, setGallery] = useState(initialGallery)
  const [pending, setPending] = useState('')

  return (
    <AdminForm action={saveImageSettingsAction} className="space-y-8">
      <div className="grid gap-6 rounded-2xl border border-[#e8e0da] bg-white p-6 sm:grid-cols-2">
        {slotMeta.map((m) => (
          <div key={m.key} className={m.key === 'homepageHeroImageUrl' ? 'sm:col-span-2' : ''}>
            <LocalImageField
              label={m.label}
              hint={`${m.hint} · empty uses the default image`}
              value={slots[m.key]}
              onChange={(url) => setSlots((s) => ({ ...s, [m.key]: url }))}
              folder="pages"
              name={m.key}
              aspect={m.aspect}
            />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#e8e0da] bg-white p-6">
        <h2 className="font-semibold">Gallery</h2>
        <p className="mt-1 text-sm text-muted">Up to 12 photos, shown on the About page. Leave empty to hide the gallery.</p>
        <ul className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {gallery.map((url) => (
            <li key={url} className="relative">
              <input type="hidden" name="galleryImageUrls" value={url} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
              <button
                type="button"
                aria-label="Remove from gallery"
                onClick={() => setGallery((g) => g.filter((u) => u !== url))}
                className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 text-red shadow"
              >
                <X aria-hidden className="size-4" />
              </button>
            </li>
          ))}
          {gallery.length < 12 && (
            <li>
              <LocalImageField
                label="Add photo"
                value={pending}
                folder="gallery"
                aspect="aspect-[4/3]"
                hint="max 4 MB"
                onChange={(url) => {
                  if (url) setGallery((g) => [...g, url])
                  setPending('')
                }}
              />
            </li>
          )}
        </ul>
        {gallery.length >= 12 && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
            <Plus aria-hidden className="size-3.5" /> Gallery is full. Remove a photo to add another.
          </p>
        )}
      </div>

      <div className="sticky bottom-4 flex justify-end">
        <SubmitButton className="shadow-lift">Save images</SubmitButton>
      </div>
    </AdminForm>
  )
}
