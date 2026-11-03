import { NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { isAllowedImage, isPublicFolder, maxUploadBytes, sniffFileType } from '@/lib/uploads'
import { saveUpload } from '@/lib/upload-store'

export const runtime = 'nodejs'

const err = (status: number, error: string) => NextResponse.json({ success: false, error }, { status })

export async function POST(req: Request) {
  let admin
  try {
    admin = await getAdminFromRequest(req)
  } catch {
    return err(503, 'Service unavailable')
  }
  if (!admin) return err(401, 'Unauthorized')

  const max = maxUploadBytes()
  if (Number(req.headers.get('content-length') ?? 0) > max + 64 * 1024)
    return err(413, `File is too large. Maximum size is ${(max / 1024 / 1024).toFixed(0)} MB.`)
  if (!(await rateLimit(`upload:${admin.id}`, 60, 600)).ok) return err(429, 'Too many uploads. Please wait a few minutes.')

  let fd: FormData
  try {
    fd = await req.formData()
  } catch {
    return err(400, 'Invalid upload request')
  }
  const folder = fd.get('folder')
  const file = fd.get('file')
  if (!isPublicFolder(folder)) return err(400, 'Invalid folder')
  if (!(file instanceof File) || file.size === 0) return err(400, 'No file provided')
  if (file.size > max) return err(413, `File is too large. Maximum size is ${(max / 1024 / 1024).toFixed(0)} MB.`)

  const data = Buffer.from(await file.arrayBuffer())
  const type = sniffFileType(data)
  if (!isAllowedImage(type)) return err(415, 'Unsupported file. Please upload a JPEG, PNG, WebP or GIF image.')

  const saved = await saveUpload(folder, data, type)
  return NextResponse.json({ success: true, url: saved.url, filename: saved.filename, size: data.length, folder })
}
