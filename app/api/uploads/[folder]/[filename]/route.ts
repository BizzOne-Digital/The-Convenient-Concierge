import { connectDB } from '@/lib/mongodb'
import { isPublicFolder, isValidFilename } from '@/lib/uploads'
import { StoredUpload } from '@/models'
import { binaryToBuffer } from '@/lib/upload-store'

export const runtime = 'nodejs'

const notFound = () => new Response('Not found', { status: 404, headers: { 'X-Content-Type-Options': 'nosniff' } })

export async function GET(_req: Request, { params }: { params: Promise<{ folder: string; filename: string }> }) {
  const { folder, filename } = await params
  if (!isPublicFolder(folder) || !isValidFilename(filename) || filename.endsWith('.pdf')) return notFound()
  try {
    await connectDB()
    const doc = await StoredUpload.findOne({ folder, filename }).lean()
    if (!doc) return notFound()
    const body = binaryToBuffer(doc.data)
    return new Response(new Uint8Array(body), {
      headers: {
        'Content-Type': doc.mimeType,
        'Content-Length': String(body.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; sandbox",
      },
    })
  } catch {
    return new Response('Service unavailable', { status: 503 })
  }
}
