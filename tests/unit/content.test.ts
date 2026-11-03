import { describe, expect, it } from 'vitest'
import { business, defaultFaqs, getService, organisations, serviceAreas, services } from '@/lib/content'

describe('business content integrity', () => {
  it('keeps the verified contact details', () => {
    expect(business.phone).toBe('647-457-5252')
    expect(business.email).toBe('info@theconvenientconcierge.ca')
    for (const s of business.social) expect(s.href).toMatch(/^https:\/\/www\.(facebook|instagram)\.com\//)
  })

  it('preserves all three original service categories', () => {
    expect(services.map((s) => s.type)).toEqual(['moving', 'delivery', 'tasks'])
    expect(new Set(services.map((s) => s.slug)).size).toBe(3)
    for (const s of services) {
      expect(getService(s.slug)).toBe(s)
      expect(s.images.length).toBeGreaterThan(0)
      expect(s.seo.description.length).toBeLessThanOrEqual(170)
    }
  })

  it('preserves every listed service from the original website', () => {
    expect(getService('moving')!.items).toHaveLength(10)
    expect(getService('pick-up-delivery')!.items).toHaveLength(10)
    expect(getService('tasks-errands')!.items).toHaveLength(7)
    expect(getService('tasks-errands')!.benefits).toEqual(['Convenience', 'Reliability', 'Personalized Service', 'Local Expertise'])
    const all = services.flatMap((s) => s.items).join('|')
    for (const must of ['Penguin Pick-Ups', 'Propane Tanks', 'Junk Removal', 'Micro Moves', 'Furniture Removal for Staging', 'Shop & Ship', 'Garden Centre'])
      expect(all).toContain(must)
  })

  it('keeps the no-assembly limitation on moving', () => {
    expect(getService('moving')!.notice).toMatch(/do not offer disassembly or assembly/i)
    expect(defaultFaqs.find((f) => /assembly/i.test(f.question))!.answer).toMatch(/^No\./)
  })

  it('keeps all 27 organisations and 11 service areas, without duplicates', () => {
    expect(organisations).toHaveLength(27)
    expect(new Set(organisations).size).toBe(27)
    expect(serviceAreas).toHaveLength(11)
    expect(serviceAreas).toContain('East Mississauga')
  })

  it('never publishes prices', () => {
    const pricing = defaultFaqs.find((f) => /price/i.test(f.question))!
    expect(pricing.answer).toMatch(/do not publish fixed prices/i)
    expect(JSON.stringify(services)).not.toMatch(/\$\s?\d/)
  })
})
