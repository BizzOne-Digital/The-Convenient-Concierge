'use client'

import Image from 'next/image'
import { useId, useRef, useState } from 'react'
import { CircleAlert, CircleCheck, ImagePlus, LoaderCircle, RefreshCw, Trash2 } from 'lucide-react'
import type { PublicFolder } from '@/lib/uploads'

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_BYTES = 4 * 1024 * 1024

type Toast = { kind: 'ok' | 'err'; text: string } | null

/**
 * Admin image picker. Uploads to POST /api/upload (stored in MongoDB) and reports the saved public URL
 * through onChange(url). The old image is only deleted server-side after the content record is saved.
 */
export function LocalImageField({
  label,
  value,
  onChange,
  folder = 'pages',
  name,
  aspect = 'aspect-[16/10]',
  hint,
}: {
  label: string
  value: string
  onChange: (url: string) => void
  folder?: PublicFolder
  name?: string
  aspect?: string
  hint?: string
}) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<Toast>(null)

  function notify(t: Toast) {
    setToast(t)
    if (t?.kind === 'ok') setTimeout(() => setToast(null), 3500)
  }

  async function upload(file: File) {
    if (!ACCEPT.includes(file.type)) return notify({ kind: 'err', text: 'Please choose a JPEG, PNG, WebP or GIF image.' })
    if (file.size > MAX_BYTES) return notify({ kind: 'err', text: 'This image is over 4 MB. Please resize or compress it first.' })
    setBusy(true)
    notify(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = (await res.json().catch(() => ({}))) as { success?: boolean; url?: string; error?: string }
      if (!res.ok || !json.success || !json.url) throw new Error(json.error || 'Upload failed. Please try again.')
      onChange(json.url)
      notify({ kind: 'ok', text: 'Image uploaded. Remember to save.' })
    } catch (e) {
      notify({ kind: 'err', text: (e as Error).message })
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div>
      <p id={`${id}-label`} className="mb-1.5 text-sm font-semibold">
        {label}
      </p>
      {name && <input type="hidden" name={name} value={value} />}
      <div className={`relative ${aspect} overflow-hidden rounded-xl border border-dashed border-[#d9cec7] bg-[#faf8f6]`}>
        {value ? (
          <Image src={value} alt="" fill sizes="400px" className="object-cover" unoptimized={value.startsWith('/api/')} />
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted transition-colors hover:bg-cream"
          >
            <ImagePlus aria-hidden className="size-6" />
            Choose an image
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-white/75 backdrop-blur-sm">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <LoaderCircle aria-hidden className="size-4 animate-spin" /> Uploading…
            </span>
          </div>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept={ACCEPT.join(',')}
        className="sr-only"
        aria-labelledby={`${id}-label`}
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#e3dad3] bg-white px-3 text-xs font-semibold hover:bg-cream disabled:opacity-50"
        >
          <RefreshCw aria-hidden className="size-3.5" /> {value ? 'Replace' : 'Upload'}
        </button>
        {value && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              onChange('')
              notify({ kind: 'ok', text: 'Image removed. Save to apply; the default image will be used.' })
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-red hover:bg-red/[0.06] disabled:opacity-50"
          >
            <Trash2 aria-hidden className="size-3.5" /> Remove
          </button>
        )}
        <span className="text-xs text-muted">{hint ?? 'JPEG, PNG, WebP or GIF · max 4 MB'}</span>
      </div>
      <div aria-live="polite">
        {toast && (
          <p className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${toast.kind === 'ok' ? 'text-emerald-700' : 'text-red'}`}>
            {toast.kind === 'ok' ? <CircleCheck aria-hidden className="size-3.5" /> : <CircleAlert aria-hidden className="size-3.5" />}
            {toast.text}
          </p>
        )}
      </div>
    </div>
  )
}
