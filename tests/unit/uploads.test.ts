import { describe, expect, it } from 'vitest'
import {
  isAllowedAttachment,
  isAllowedImage,
  isAllowedImageUrl,
  isLegacyUploadUrl,
  isPublicFolder,
  isValidFilename,
  maxUploadBytes,
  parseUploadUrl,
  sniffFileType,
} from '@/lib/uploads'
import { generateFilename } from '@/lib/upload-store'
import { JPEG, PNG, SVG } from '../helpers/db'

const b = (s: string) => Buffer.from(s, 'binary')

describe('MIME sniffing (real content, not declared type)', () => {
  it('detects allowed image formats', () => {
    expect(sniffFileType(JPEG)?.mime).toBe('image/jpeg')
    expect(sniffFileType(PNG)?.mime).toBe('image/png')
    expect(sniffFileType(b('RIFF\x00\x00\x00\x00WEBPVP8 '))?.mime).toBe('image/webp')
    expect(sniffFileType(b('GIF89a....'))?.mime).toBe('image/gif')
  })
  it('rejects SVG, HTML, executables and empty files as images', () => {
    expect(isAllowedImage(sniffFileType(SVG))).toBe(false)
    expect(isAllowedImage(sniffFileType(b('<!doctype html><html>')))).toBe(false)
    expect(isAllowedImage(sniffFileType(b('MZ\x90\x00')))).toBe(false)
    expect(isAllowedImage(sniffFileType(Buffer.alloc(0)))).toBe(false)
    expect(isAllowedImage(sniffFileType(b('%PDF-1.7')))).toBe(false)
  })
  it('allows PDFs only as booking attachments', () => {
    expect(isAllowedAttachment(sniffFileType(b('%PDF-1.7')))).toBe(true)
    expect(isAllowedAttachment(sniffFileType(SVG))).toBe(false)
  })
})

describe('upload size limit', () => {
  it('defaults to 4 MB and is capped at 8 MB', () => {
    expect(maxUploadBytes(undefined)).toBe(4 * 1024 * 1024)
    expect(maxUploadBytes('abc')).toBe(4 * 1024 * 1024)
    expect(maxUploadBytes('1000')).toBe(1000)
    expect(maxUploadBytes(String(50 * 1024 * 1024))).toBe(8 * 1024 * 1024)
  })
})

describe('folders and filenames', () => {
  it('whitelists public folders', () => {
    for (const f of ['products', 'gallery', 'pages', 'misc']) expect(isPublicFolder(f)).toBe(true)
    for (const f of ['bookings', '..', 'pages/../x', '', null]) expect(isPublicFolder(f)).toBe(false)
  })
  it('generates collision-resistant names in the required format', () => {
    const a = generateFilename('webp', 1700000000000)
    expect(a).toMatch(/^1700000000000-[a-f0-9]{16}\.webp$/)
    expect(isValidFilename(a)).toBe(true)
    expect(new Set(Array.from({ length: 500 }, () => generateFilename('png'))).size).toBe(500)
  })
  it('rejects traversal, separators and foreign names', () => {
    for (const n of ['../secret.png', '..\\x.png', 'a/b.png', 'a\\b.png', 'evil.svg', '1700000000000-0123456789abcdef.svg', '1700000000000-0123456789abcdef.png\0', ''])
      expect(isValidFilename(n)).toBe(false)
  })
})

describe('image URL parsing', () => {
  const good = '/api/uploads/pages/1700000000000-0123456789abcdef.jpg'
  it('parses stored-upload URLs', () => {
    expect(parseUploadUrl(good)).toEqual({ folder: 'pages', filename: '1700000000000-0123456789abcdef.jpg' })
  })
  it('rejects anything else', () => {
    for (const u of ['/api/uploads/bookings/1700000000000-0123456789abcdef.pdf', '/api/uploads/pages/../x.jpg', 'https://x.com/api/uploads/pages/a.jpg', '/images/a.jpg', null])
      expect(parseUploadUrl(u)).toBeNull()
  })
  it('recognises legacy and allowed URLs', () => {
    expect(isLegacyUploadUrl('/uploads/2022/03/a.jpg')).toBe(true)
    expect(isAllowedImageUrl(good)).toBe(true)
    expect(isAllowedImageUrl('/images/photos/a.jpg')).toBe(true)
    expect(isAllowedImageUrl('//evil.com/a.jpg')).toBe(false)
  })
})
