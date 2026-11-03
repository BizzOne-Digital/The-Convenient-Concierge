'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import { isLegacyUploadUrl } from '@/lib/uploads'

/**
 * next/image for admin-managed URLs. Legacy "/uploads/..." paths and broken images fall back to a
 * branded placeholder of the same box, so the layout never breaks.
 */
export function SafeImage({ src, alt, fallback, ...rest }: ImageProps & { src: string; fallback?: string }) {
  const [failed, setFailed] = useState(false)
  const bad = failed || !src || isLegacyUploadUrl(src)
  if (bad && fallback) return <Image src={fallback} alt={alt} {...rest} />
  if (bad)
    return (
      <span
        role="img"
        aria-label={alt}
        className={`${rest.className ?? ''} block bg-[radial-gradient(circle_at_30%_20%,#2a2629,#101012)]`}
        style={rest.fill ? { position: 'absolute', inset: 0 } : { width: rest.width, height: rest.height }}
      />
    )
  return <Image src={src} alt={alt} onError={() => setFailed(true)} {...rest} />
}
