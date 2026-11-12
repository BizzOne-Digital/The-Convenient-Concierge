import { describe, expect, it } from 'vitest'
import { POST as submitBooking } from '@/app/api/bookings/route'
import { POST as submitContact } from '@/app/api/contact/route'
import { deleteBooking, updateBookingStatus, updateContactSettings, saveBlogPost } from '@/lib/admin-service'
import { getPublishedPosts, getPublishedTestimonials, getSiteSettings } from '@/lib/data'
import { BookingInquiry, SiteSettings, StoredUpload, Testimonial } from '@/models'
import { multipart, setupTestDb } from '../helpers/db'

setupTestDb()

const human = () => String(Date.now() - 20_000)
const valid = { name: 'Jane Doe', email: 'jane@example.com', phone: '647-555-0100', serviceType: 'tasks', pickupAddress: 'Liberty Village', description: 'Weekly grocery run from Loblaws, please.' }
const post = (fields: Record<string, string | Blob | Blob[]>, ip = '10.0.0.1') =>
  submitBooking(new Request('http://localhost/api/bookings', multipart({ startedAt: human(), company: '', ...fields }, { 'x-forwarded-for': ip })))

describe('POST /api/bookings', () => {
  it('persists a valid enquiry as "new" and returns no internal data', async () => {
    const res = await post(valid)
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(Object.keys(json).sort()).toEqual(['message', 'success'])
    expect(json.message).toMatch(/not a confirmed booking/i)
    const saved = await BookingInquiry.findOne({ email: 'jane@example.com' }).lean()
    expect(saved).toMatchObject({ serviceType: 'tasks', status: 'new', name: 'Jane Doe' })
  })

  it('rejects invalid submissions with field errors', async () => {
    const res = await post({ ...valid, email: 'not-an-email', serviceType: 'moving', form: 'full' })
    const json = await res.json()
    expect(res.status).toBe(422)
    expect(json.errors.email).toBeTruthy()
    expect(json.errors.destinationAddress).toBeTruthy()
    expect(await BookingInquiry.countDocuments()).toBe(0)
  })

  it('silently drops honeypot and too-fast submissions', async () => {
    expect((await post({ ...valid, company: 'Spam Inc' })).status).toBe(200)
    expect((await post({ ...valid, startedAt: String(Date.now()) })).status).toBe(200)
    expect(await BookingInquiry.countDocuments()).toBe(0)
  })

  it('ignores injected fields (no mass assignment, no operator injection)', async () => {
    await post({ ...valid, status: 'completed', attachmentUrl: '/evil', 'email[$ne]': 'x' })
    const saved = await BookingInquiry.findOne().lean()
    expect(saved?.status).toBe('new')
    expect(saved?.attachmentUrl).toBe('')
  })

  const move = {
    ...valid,
    serviceType: 'moving',
    form: 'full',
    description: '',
    preferredDate: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
    pickupAddress: '1 King St W',
    destinationAddress: '2 Queen St W',
    accessDetails: '2nd-floor walk-up at pickup, elevator at destination',
    itemDetails: 'Queen bed, 3-seat sofa, 20 boxes',
    packing: 'I would like help with packing',
  }
  const png = () => new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0])], 'p.jpg', { type: 'image/jpeg' })

  it('stores a full moving request with checklist and photos privately, then deletes them with the request', async () => {
    const pdf = new File([new TextEncoder().encode('%PDF-1.4 checklist')], 'list.pdf', { type: 'application/pdf' })
    const res = await post({ ...move, attachment: pdf, photos: [png(), png()] })
    expect(res.status).toBe(200)
    const saved = await BookingInquiry.findOne().lean()
    expect(saved).toMatchObject({ accessDetails: move.accessDetails, packing: move.packing, itemDetails: move.itemDetails })
    expect(saved?.attachmentUrl).toMatch(/^\/api\/admin\/attachments\//)
    expect(saved?.photoUrls).toHaveLength(2)
    for (const u of saved!.photoUrls) expect(u).toMatch(/^\/api\/admin\/attachments\/\d{13}-[a-f0-9]{16}\.png$/)
    expect(await StoredUpload.countDocuments({ folder: 'bookings' })).toBe(3)
    expect((await deleteBooking(String(saved!._id))).ok).toBe(true)
    expect(await StoredUpload.countDocuments({ folder: 'bookings' })).toBe(0)
  })

  it('rejects non-image photos, too many photos and photos on other services, storing nothing', async () => {
    const fake = new File([new TextEncoder().encode('<svg onload=alert(1)>')], 'x.png', { type: 'image/png' })
    expect((await post({ ...move, photos: [png(), fake] }, '10.0.0.2')).status).toBe(422)
    expect((await post({ ...move, photos: Array.from({ length: 6 }, png) }, '10.0.0.2')).status).toBe(422)
    expect((await post({ ...valid, form: 'full', pickupAddress: 'Liberty Village', photos: [png()] }, '10.0.0.2')).status).toBe(422)
    expect(await StoredUpload.countDocuments()).toBe(0)
    expect(await BookingInquiry.countDocuments()).toBe(0)
  })

  it('rate-limits repeated submissions from one address', async () => {
    for (let i = 0; i < 5; i++) expect((await post(valid, '10.9.9.9')).status).toBe(200)
    expect((await post(valid, '10.9.9.9')).status).toBe(429)
  })
})

describe('POST /api/contact', () => {
  it('stores general enquiries for the admin inbox', async () => {
    const res = await submitContact(
      new Request('http://localhost/api/contact', multipart({ name: 'Sam', email: 'sam@example.com', message: 'Do you serve Leslieville?', startedAt: human() }, { 'x-forwarded-for': '10.0.0.7' })),
    )
    expect(res.status).toBe(200)
    expect((await BookingInquiry.findOne().lean())?.serviceType).toBe('general')
  })
})

describe('admin updates are allowlisted', () => {
  it('updates booking status and nothing else', async () => {
    const b = await BookingInquiry.create({ ...valid, status: 'new' })
    const r = await updateBookingStatus(String(b._id), { status: 'contacted', email: 'hacked@x.com', name: 'Hacked' } as never)
    expect(r.ok).toBe(true)
    const after = await BookingInquiry.findById(b._id).lean()
    expect(after).toMatchObject({ status: 'contacted', email: 'jane@example.com', name: 'Jane Doe' })
    expect((await updateBookingStatus(String(b._id), { status: 'deleted' })).ok).toBe(false)
    expect((await updateBookingStatus('not-an-id', { status: 'new' })).ok).toBe(false)
  })

  it('cannot modify settings outside phone and email', async () => {
    const r = await updateContactSettings({ contactPhone: '416-555-0100', contactEmail: 'hello@example.com', homepageHeroImageUrl: '/x', key: 'other' })
    expect(r.ok).toBe(false)
    expect(await SiteSettings.countDocuments()).toBe(0)
    expect((await updateContactSettings({ contactPhone: '416-555-0100', contactEmail: 'hello@example.com' })).ok).toBe(true)
    expect((await getSiteSettings()).contactPhone).toBe('416-555-0100')
  })
})

describe('public data never exposes private fields', () => {
  it('only returns published testimonials with public fields', async () => {
    await Testimonial.create([
      { customerName: 'Visible', quote: 'Great service!', isPublished: true },
      { customerName: 'Hidden', quote: 'Not approved yet', isPublished: false },
    ])
    const list = await getPublishedTestimonials()
    expect(list).toEqual([{ customerName: 'Visible', quote: 'Great service!', serviceType: '' }])
  })

  it('hides drafts and future posts', async () => {
    await saveBlogPost(null, { title: 'Draft post', status: 'draft' })
    await saveBlogPost(null, { title: 'Future post', status: 'published', publishedAt: new Date(Date.now() + 864e5 * 10).toISOString() })
    await saveBlogPost(null, { title: 'Live post', status: 'published' })
    const posts = await getPublishedPosts()
    expect(posts.map((p) => p.title)).toEqual(['Live post'])
    expect(Object.keys(posts[0]!).sort()).toEqual(['excerpt', 'featuredImageUrl', 'publishedAt', 'slug', 'title'])
  })

  it('enforces unique blog slugs', async () => {
    expect((await saveBlogPost(null, { title: 'Moving tips', status: 'draft' })).ok).toBe(true)
    const dup = await saveBlogPost(null, { title: 'Moving Tips', status: 'draft' })
    expect(dup.ok).toBe(false)
  })
})
