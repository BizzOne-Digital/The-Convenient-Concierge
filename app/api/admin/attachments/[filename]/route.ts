import { getAdminFromRequest } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { isValidFilename, PRIVATE_FOLDER } from '@/lib/uploads'
import { StoredUpload } from '@/models'
import { binaryToBuffer } from '@/lib/upload-store'

export const runtime = 'nodejs'

/** Customer attachments (e.g. moving checklists) are private: admins only, never cached publicly. */
export async function GET(req: Request, { params }: { params: Promise<{ filename: string }> }) {
  if (!(await getAdminFromRequest(req))) return new Response('Unauthorized', { status: 401 })
  const { filename } = await params
  if (!isValidFilename(filename)) return new Response('Not found', { status: 404 })
  await connectDB()
  const doc = await StoredUpload.findOne({ folder: PRIVATE_FOLDER, filename }).lean()
  if (!doc) return new Response('Not found', { status: 404 })
  const body = binaryToBuffer(doc.data)
  return new Response(new Uint8Array(body), {
    headers: {
      'Content-Type': doc.mimeType,
      'Content-Length': String(body.length),
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
