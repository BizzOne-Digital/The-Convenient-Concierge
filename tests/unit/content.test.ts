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
    expect(getService('moving')!.items).toHaveLength(9)
    expect(getService('pick-up-delivery')!.items).toHaveLength(14)
    expect(getService('tasks-errands')!.items).toHaveLength(7)
    expect(getService('tasks-errands')!.benefits).toEqual(['Convenience', 'Reliability', 'Personalized Service', 'Local Expertise'])
    const all = services.flatMap((s) => s.items).join('|')
    for (const must of ['Penguin pick-ups', 'Propane tanks', 'Facebook Marketplace', 'Junk removal', 'Small moves and single-item moves', 'Storage moves and furniture staging', 'Shop & Ship', 'Garden centre'])
      expect(all).toContain(must)
  })

  it('uses the client-supplied Tasks & Errands wording verbatim, with the search terms', () => {
    const t = getService('tasks-errands')!
    expect(t.heroLead).toBe(
      'Life gets busy, and sometimes there simply aren’t enough hours in the day. The Convenient Concierge provides reliable, personalized tasks and errands services throughout Toronto and the GTA. Whether you need shopping completed, items picked up, help around your home, or assistance with a special request, we’re here to make your day easier.',
    )
    expect(t.cta).toBe('Tell Us What You Need')
    for (const term of ['errand services toronto', 'personal concierge toronto', 'grocery pickup and delivery']) expect(t.intro.toLowerCase()).toContain(term)
  })

  it('offers furniture assembly and disassembly on moving, with no contradicting copy', () => {
    expect(getService('moving')!.items).toContain('Furniture assembly and disassembly')
    expect(defaultFaqs.find((f) => /assembly/i.test(f.question))!.answer).toMatch(/^Yes\./)
    expect(JSON.stringify({ services, defaultFaqs })).not.toMatch(/do not offer/i)
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
