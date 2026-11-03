import { beforeEach, describe, expect, it } from 'vitest'
import { POST as upload } from '@/app/api/upload/route'
import { GET as getUpload } from '@/app/api/uploads/[folder]/[filename]/route'
import { SESSION_COOKIE, createSession } from '@/lib/auth'
import { hashPassword } from '@/lib/password'
import { deleteUploadIfUnreferenced, saveUpload } from '@/lib/upload-store'
import { updateImageSettings } from '@/lib/admin-service'
import { AdminUser, SiteSettings, StoredUpload } from '@/models'
import { JPEG, PNG, SVG, multipart, setupTestDb } from '../helpers/db'

setupTestDb()

let cookie = ''
beforeEach(async () => {
  const u = await AdminUser.create({ email: 'admin@example.com', passwordHash: await hashPassword('x-password-123'), role: 'admin' })
  cookie = `${SESSION_COOKIE}=${(await createSession(String(u._id))).token}`
})

const file = (buf: Buffer, name: string, type: string) => new File([new Uint8Array(buf)], name, { type })
const get = (folder: string, filename: string) => getUpload(new Request('http://localhost/x'), { params: Promise.resolve({ folder, filename }) })

describe('POST /api/upload', () => {
  it('rejects unauthenticated uploads', async () => {
    const res = await upload(new Request('http://localhost/api/upload', multipart({ file: file(PNG, 'a.png', 'image/png'), folder: 'pages' })))
    expect(res.status).toBe(401)
    expect(await StoredUpload.countDocuments()).toBe(0)
  })

  it('stores a valid image in MongoDB and returns its public URL', async () => {
    const res = await upload(new Request('http://localhost/api/upload', multipart({ file: file(PNG, 'a.png', 'image/png'), folder: 'pages' }, { cookie })))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json).toMatchObject({ success: true, folder: 'pages', size: PNG.length })
    expect(json.url).toMatch(/^\/api\/uploads\/pages\/\d{13}-[a-f0-9]{16}\.png$/)
    const doc = await StoredUpload.findOne({ filename: json.filename }).lean()
    expect(doc?.mimeType).toBe('image/png')
  })

  it('rejects disguised and unsupported files', async () => {
    const svgAsPng = await upload(new Request('http://localhost/api/upload', multipart({ file: file(SVG, 'evil.png', 'image/png'), folder: 'pages' }, { cookie })))
    expect(svgAsPng.status).toBe(415)
    const badFolder = await upload(new Request('http://localhost/api/upload', multipart({ file: file(PNG, 'a.png', 'image/png'), folder: '../etc' }, { cookie })))
    expect(badFolder.status).toBe(400)
    expect(await StoredUpload.countDocuments()).toBe(0)
  })

  it('rejects files over the configured limit before storing them', async () => {
    process.env.MAX_UPLOAD_BYTES = '100'
    try {
      const big = Buffer.concat([JPEG, Buffer.alloc(500)])
      const res = await upload(new Request('http://localhost/api/upload', multipart({ file: file(big, 'a.jpg', 'image/jpeg'), folder: 'pages' }, { cookie })))
      expect(res.status).toBe(413)
      expect(await StoredUpload.countDocuments()).toBe(0)
    } finally {
      delete process.env.MAX_UPLOAD_BYTES
    }
  })
})

describe('GET /api/uploads/[folder]/[filename]', () => {
  it('serves stored bytes with safe, cacheable headers', async () => {
    const { filename } = await saveUpload('pages', PNG, { mime: 'image/png', ext: 'png' })
    const res = await get('pages', filename)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('image/png')
    expect(res.headers.get('content-length')).toBe(String(PNG.length))
    expect(res.headers.get('cache-control')).toBe('public, max-age=31536000, immutable')
    expect(res.headers.get('x-content-type-options')).toBe('nosniff')
    expect(Buffer.from(await res.arrayBuffer()).equals(PNG)).toBe(true)
  })

  it('returns 404 for missing files, traversal and private folders', async () => {
    const priv = await saveUpload('bookings', Buffer.from('%PDF-1.4 secret'), { mime: 'application/pdf', ext: 'pdf' })
    expect((await get('pages', '1700000000000-0123456789abcdef.png')).status).toBe(404)
    expect((await get('pages', '..%2F..%2Fetc')).status).toBe(404)
    expect((await get('pages', '../x.png')).status).toBe(404)
    expect((await get('bookings', priv.filename)).status).toBe(404)
  })
})

describe('replacing and deleting images', () => {
  it('keeps referenced files and removes replaced ones after the update succeeds', async () => {
    const a = await saveUpload('pages', PNG, { mime: 'image/png', ext: 'png' })
    const b = await saveUpload('pages', JPEG, { mime: 'image/jpeg', ext: 'jpg' })
    const empty = { movingImageUrl: '', deliveryImageUrl: '', tasksImageUrl: '', aboutImageUrl: '', galleryImageUrls: [] as string[] }

    expect((await updateImageSettings({ ...empty, homepageHeroImageUrl: a.url })).ok).toBe(true)
    expect(await deleteUploadIfUnreferenced(a.url)).toBe(false) // still referenced
    expect(await StoredUpload.countDocuments({ filename: a.filename })).toBe(1)

    expect((await updateImageSettings({ ...empty, homepageHeroImageUrl: b.url })).ok).toBe(true)
    expect(await StoredUpload.countDocuments({ filename: a.filename })).toBe(0) // old one cleaned up
    expect(await StoredUpload.countDocuments({ filename: b.filename })).toBe(1)
    expect((await SiteSettings.findOne({ key: 'site' }).lean())?.homepageHeroImageUrl).toBe(b.url)
  })

  it('does not delete a file another record still uses', async () => {
    const a = await saveUpload('pages', PNG, { mime: 'image/png', ext: 'png' })
    const empty = { deliveryImageUrl: '', tasksImageUrl: '', aboutImageUrl: '', galleryImageUrls: [] as string[] }
    await updateImageSettings({ ...empty, homepageHeroImageUrl: a.url, movingImageUrl: a.url })
    await updateImageSettings({ ...empty, homepageHeroImageUrl: '', movingImageUrl: a.url })
    expect(await StoredUpload.countDocuments({ filename: a.filename })).toBe(1)
  })

  it('ignores URLs that are not stored uploads', async () => {
    expect(await deleteUploadIfUnreferenced('/images/photos/couple-at-home.jpg')).toBe(false)
    expect(await deleteUploadIfUnreferenced('https://evil.example/a.png')).toBe(false)
  })
})
