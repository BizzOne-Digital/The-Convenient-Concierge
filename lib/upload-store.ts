import 'server-only'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { BlogPost, SiteSettings, StoredUpload, imageSettingKeys } from '@/models'
import { randomBytes } from 'node:crypto'
import { parseUploadUrl, publicUploadUrl, type PublicFolder, type Sniffed } from '@/lib/uploads'

/** `<timestamp>-<randomHex>.<ext>`: 64 random bits per millisecond, so collisions are practically impossible. */
export function generateFilename(ext: string, now = Date.now()): string {
  return `${now}-${randomBytes(8).toString('hex')}.${ext}`
}

/** Exact bytes of a stored binary. (Buffer#buffer may expose the whole shared pool, so never use it directly.) */
export function binaryToBuffer(d: unknown): Buffer {
  if (Buffer.isBuffer(d)) return d
  if (d instanceof mongoose.mongo.Binary) return Buffer.from(d.buffer.subarray(0, d.position))
  throw new Error('Unexpected binary type')
}

export async function saveUpload(folder: PublicFolder | 'bookings', data: Buffer, type: Sniffed) {
  await connectDB()
  const filename = generateFilename(type.ext)
  await StoredUpload.create({ folder, filename, mimeType: type.mime, size: data.length, data })
  return { filename, url: folder === 'bookings' ? '' : publicUploadUrl(folder, filename) }
}

/** Counts content records that still point at this URL. */
export async function countUploadReferences(url: string): Promise<number> {
  await connectDB()
  const settingsQuery = { $or: [...imageSettingKeys.map((k) => ({ [k]: url })), { galleryImageUrls: url }] }
  const [settings, posts] = await Promise.all([
    SiteSettings.countDocuments(settingsQuery),
    BlogPost.countDocuments({ featuredImageUrl: url }),
  ])
  return settings + posts
}

/**
 * Deletes a stored upload only when the URL is one of ours and nothing references it any more.
 * Call after the content update that dropped the reference has succeeded.
 */
export async function deleteUploadIfUnreferenced(url: string | null | undefined): Promise<boolean> {
  const parsed = parseUploadUrl(url)
  if (!parsed || !url) return false
  if ((await countUploadReferences(url)) > 0) return false
  const res = await StoredUpload.deleteOne({ folder: parsed.folder, filename: parsed.filename })
  return res.deletedCount === 1
}

/** After a successful content update, remove the images that were replaced. */
export async function cleanupReplaced(oldUrls: (string | undefined)[], newUrls: (string | undefined)[]) {
  const keep = new Set(newUrls.filter(Boolean))
  for (const u of oldUrls) if (u && !keep.has(u)) await deleteUploadIfUnreferenced(u)
}
