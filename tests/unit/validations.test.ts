import { describe, expect, it } from 'vitest'
import {
  blogPostSchema,
  bookingSchema,
  contactSettingsSchema,
  imageSettingsSchema,
  looksLikeSpam,
  pick,
  slugify,
} from '@/lib/validations'

const tomorrow = new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10)
const base = { name: 'Jane Doe', email: ' Jane@Example.com ', phone: '647-555-0100', description: 'Please help me move a sofa.' }

describe('slugify', () => {
  it('creates clean, readable slugs', () => {
    expect(slugify('  Moving Day: 10 Tips & Tricks!  ')).toBe('moving-day-10-tips-and-tricks')
    expect(slugify('Café déménagement')).toBe('cafe-demenagement')
    expect(slugify('---')).toBe('')
    expect(slugify('a'.repeat(120))).toHaveLength(80)
  })
})

describe('booking validation', () => {
  it('accepts a quick request and normalises email', () => {
    const r = bookingSchema.safeParse({ ...base, form: 'quick', serviceType: 'moving', preferredDate: tomorrow })
    expect(r.success).toBe(true)
    expect(r.data?.email).toBe('jane@example.com')
  })

  it('requires the moving details for full moving requests, but not the free-text note', () => {
    const r = bookingSchema.safeParse({ ...base, form: 'full', serviceType: 'moving', description: '' })
    expect(r.success).toBe(false)
    expect(new Set(r.error!.issues.map((i) => i.path[0]))).toEqual(
      new Set(['preferredDate', 'pickupAddress', 'destinationAddress', 'accessDetails', 'itemDetails', 'packing']),
    )
    const ok = bookingSchema.safeParse({
      ...base,
      form: 'full',
      serviceType: 'moving',
      description: '',
      preferredDate: tomorrow,
      pickupAddress: '1 King St W',
      destinationAddress: '2 Queen St W',
      accessDetails: 'Elevator at both',
      itemDetails: 'Queen bed, sofa',
      packing: 'Not sure yet',
    })
    expect(ok.success).toBe(true)
    expect(bookingSchema.safeParse({ ...ok.data, packing: 'Bubble wrap everything' }).success).toBe(false)
  })

  it('requires a location for full tasks requests', () => {
    const r = bookingSchema.safeParse({ ...base, form: 'full', serviceType: 'tasks' })
    expect(r.error?.issues.map((i) => i.path[0])).toEqual(['pickupAddress'])
  })

  it('requires item details for full delivery requests', () => {
    const r = bookingSchema.safeParse({ ...base, form: 'full', serviceType: 'delivery', pickupAddress: 'A', destinationAddress: 'B' })
    expect(r.error?.issues.map((i) => i.path[0])).toEqual(['itemDetails'])
  })

  it('rejects bad email, phone, service, past dates and short descriptions', () => {
    const r = bookingSchema.safeParse({ name: 'J', email: 'nope', phone: '12', serviceType: 'spaceship', preferredDate: '2001-01-01', description: 'hi' })
    expect(r.success).toBe(false)
    const paths = new Set(r.error!.issues.map((i) => i.path[0]))
    for (const p of ['name', 'email', 'phone', 'serviceType', 'preferredDate', 'description']) expect(paths).toContain(p)
  })

  it('rejects oversized input', () => {
    expect(bookingSchema.safeParse({ ...base, serviceType: 'tasks', description: 'x'.repeat(4001) }).success).toBe(false)
  })
})

describe('spam protection', () => {
  const now = 1_700_000_000_000
  it('flags filled honeypots and instant submissions', () => {
    expect(looksLikeSpam('ACME', now - 10_000, now)).toBe(true)
    expect(looksLikeSpam('', now - 500, now)).toBe(true)
    expect(looksLikeSpam('', 'garbage', now)).toBe(true)
  })
  it('allows a human-paced submission', () => {
    expect(looksLikeSpam('', now - 15_000, now)).toBe(false)
    expect(looksLikeSpam(null, String(now - 15_000), now)).toBe(false)
  })
})

describe('admin allowlists', () => {
  it('contact settings reject any field outside phone/email', () => {
    expect(contactSettingsSchema.safeParse({ contactPhone: '647-457-5252', contactEmail: 'a@b.ca' }).success).toBe(true)
    expect(contactSettingsSchema.safeParse({ contactPhone: '647-457-5252', contactEmail: 'a@b.ca', homepageHeroImageUrl: '/x' }).success).toBe(false)
  })

  it('image settings only accept site-hosted image URLs', () => {
    const ok = { homepageHeroImageUrl: '/api/uploads/pages/1700000000000-0123456789abcdef.webp', movingImageUrl: '', deliveryImageUrl: '/images/services/delivery-parcel.jpg', tasksImageUrl: '', aboutImageUrl: '', galleryImageUrls: [] }
    expect(imageSettingsSchema.safeParse(ok).success).toBe(true)
    expect(imageSettingsSchema.safeParse({ ...ok, movingImageUrl: 'https://evil.example/x.png' }).success).toBe(false)
    expect(imageSettingsSchema.safeParse({ ...ok, movingImageUrl: 'javascript:alert(1)' }).success).toBe(false)
  })

  it('blog posts derive a slug from the title and reject unknown fields', () => {
    const r = blogPostSchema.safeParse({ title: 'Moving Checklist Tips', status: 'draft' })
    expect(r.data?.slug).toBe('moving-checklist-tips')
    expect(blogPostSchema.safeParse({ title: 'Hi there', status: 'draft', views: '999' }).success).toBe(false)
  })

  it('pick() only copies allowlisted string fields (mass-assignment guard)', () => {
    const fd = new FormData()
    fd.set('status', 'contacted')
    fd.set('email', 'attacker@x.com')
    fd.set('$where', '1')
    expect(pick(fd, ['status'])).toEqual({ status: 'contacted' })
  })
})
