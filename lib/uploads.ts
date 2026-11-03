/** Pure helpers (safe for client and server). Storage lives in upload-store.ts. */

/** Public image folders (served by GET /api/uploads/[folder]/[filename]). */
export const PUBLIC_FOLDERS = ['products', 'gallery', 'pages', 'misc'] as const
export type PublicFolder = (typeof PUBLIC_FOLDERS)[number]
/** Private folder for customer attachments, only served to admins. */
export const PRIVATE_FOLDER = 'bookings'

const MB = 1024 * 1024
export const HARD_MAX_BYTES = 8 * MB

/** Configurable via MAX_UPLOAD_BYTES. Defaults to 4 MB (Vercel Functions reject bodies over 4.5 MB). */
export function maxUploadBytes(env: string | undefined = process.env.MAX_UPLOAD_BYTES): number {
  const n = Number(env)
  if (!Number.isFinite(n) || n <= 0) return 4 * MB
  return Math.min(Math.floor(n), HARD_MAX_BYTES)
}

export const isPublicFolder = (f: unknown): f is PublicFolder =>
  typeof f === 'string' && (PUBLIC_FOLDERS as readonly string[]).includes(f)

export type Sniffed = { mime: string; ext: string }
const IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }

/** Detects the real type from magic bytes. The declared MIME type is never trusted. */
export function sniffFileType(buf: Uint8Array): Sniffed | null {
  const at = (i: number) => buf[i]
  const ascii = (start: number, len: number) => String.fromCharCode(...buf.subarray(start, start + len))
  if (buf.length >= 3 && at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return { mime: 'image/jpeg', ext: 'jpg' }
  if (buf.length >= 8 && ascii(1, 3) === 'PNG' && at(0) === 0x89 && at(4) === 0x0d && at(5) === 0x0a && at(6) === 0x1a && at(7) === 0x0a)
    return { mime: 'image/png', ext: 'png' }
  if (buf.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') return { mime: 'image/webp', ext: 'webp' }
  if (buf.length >= 6 && (ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a')) return { mime: 'image/gif', ext: 'gif' }
  if (buf.length >= 5 && ascii(0, 5) === '%PDF-') return { mime: 'application/pdf', ext: 'pdf' }
  return null
}

export const isAllowedImage = (s: Sniffed | null): s is Sniffed => !!s && s.mime in IMAGE_TYPES
export const isAllowedAttachment = (s: Sniffed | null): s is Sniffed => !!s && (s.mime in IMAGE_TYPES || s.mime === 'application/pdf')

const FILENAME_RE = /^\d{13}-[a-f0-9]{16}\.(jpg|png|webp|gif|pdf)$/

/** Strict filename check: blocks traversal, separators and anything not produced by generateFilename. */
export function isValidFilename(name: unknown): name is string {
  if (typeof name !== 'string') return false
  if (name.includes('..') || name.includes('/') || name.includes('\\') || name.includes('\0')) return false
  return FILENAME_RE.test(name)
}

export const publicUploadUrl = (folder: PublicFolder, filename: string) => `/api/uploads/${folder}/${filename}`

/** Parses "/api/uploads/<folder>/<filename>" into its parts, or null when it is not a valid stored-upload URL. */
export function parseUploadUrl(url: unknown): { folder: PublicFolder; filename: string } | null {
  if (typeof url !== 'string') return null
  const m = /^\/api\/uploads\/([a-z]+)\/([^/?#]+)$/.exec(url)
  if (!m) return null
  const [, folder, filename] = m
  if (!isPublicFolder(folder) || !isValidFilename(filename)) return null
  return { folder, filename }
}

/** Legacy WordPress-style "/uploads/..." paths no longer exist on the serverless deployment. */
export const isLegacyUploadUrl = (url: string) => url.startsWith('/uploads/')

/** Accepts only image URLs the site itself produces or ships. Used to validate admin-saved image fields. */
export function isAllowedImageUrl(url: string): boolean {
  return url === '' || parseUploadUrl(url) !== null || /^\/images\/[\w\-/.]+$/.test(url)
}
