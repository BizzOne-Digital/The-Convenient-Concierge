import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { isFaqPublic, isPostPublic } from '@/lib/data'
import { Markdown, safeHref } from '@/lib/markdown'

describe('publication filtering', () => {
  const now = new Date('2026-06-01T12:00:00Z')
  it('only shows published posts whose date has arrived', () => {
    expect(isPostPublic({ status: 'published', publishedAt: new Date('2026-05-01') }, now)).toBe(true)
    expect(isPostPublic({ status: 'published', publishedAt: new Date('2026-07-01') }, now)).toBe(false)
    expect(isPostPublic({ status: 'published', publishedAt: null }, now)).toBe(false)
    expect(isPostPublic({ status: 'draft', publishedAt: new Date('2026-05-01') }, now)).toBe(false)
  })
  it('only shows published FAQs', () => {
    expect(isFaqPublic({ isPublished: true })).toBe(true)
    expect(isFaqPublic({ isPublished: false })).toBe(false)
  })
})

describe('safe blog rendering', () => {
  it('never renders raw HTML from content', () => {
    const html = renderToStaticMarkup(<Markdown source={'<img src=x onerror=alert(1)>\n\n## Title'} />)
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img')
    expect(html).toContain('<h2>Title</h2>')
  })
  it('blocks javascript: and protocol-relative links', () => {
    expect(safeHref('javascript:alert(1)')).toBeNull()
    expect(safeHref('//evil.com')).toBeNull()
    expect(safeHref('https://example.com')).toBe('https://example.com')
    const html = renderToStaticMarkup(<Markdown source={'[click](javascript:alert(1)) and [ok](/booking)'} />)
    expect(html).not.toContain('javascript:')
    expect(html).toContain('href="/booking"')
  })
  it('renders lists, bold and external links safely', () => {
    const html = renderToStaticMarkup(<Markdown source={'- **One**\n- Two\n\n[site](https://x.ca)'} />)
    expect(html).toContain('<ul><li><strong>One</strong></li><li>Two</li></ul>')
    expect(html).toContain('rel="noopener noreferrer nofollow"')
  })
})
