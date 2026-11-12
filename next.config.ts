import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

// 'unsafe-inline' scripts are required by Next.js hydration on statically rendered pages.
// ponytail: switch to a nonce-based CSP (forces dynamic rendering) if a stricter policy is ever mandated.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isProd ? ['upgrade-insecure-requests'] : []),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
]

/**
 * 301s from the previous WordPress site (taken from its wp-sitemap.xml, 2026-11-13).
 * Only URLs with a real equivalent are mapped. Deliberately left to 404: LCBO/Beer Store and
 * airport-service forms (not offered on the new site), account/login pages, and WordPress defaults.
 */
const quote = (service?: 'moving' | 'delivery' | 'tasks') => (service ? `/booking?service=${service}` : '/booking')
const legacyRedirects: [string, string][] = [
  ['/new-order-page', quote()],
  ['/order-forms-casual-service', quote()],
  ['/order-forms-standard-service', quote()],
  ['/order-forms-es', quote()],
  ['/new-order-page/moving-form', quote('moving')],
  ['/new-order-page/deliveries-form', quote('delivery')],
  ['/order-forms-casual-service/deliveries-cs', quote('delivery')],
  ['/order-forms-standard-service/deliveries-ss', quote('delivery')],
  ['/order-forms-es/deliveries-es', quote('delivery')],
  ['/new-order-page/tasks-and-errands', quote('tasks')],
  ['/new-order-page/grocery-form', quote('tasks')],
  ['/new-order-page/any-shop-form', quote('tasks')],
  ['/order-forms-casual-service/shop-any-store-cs', quote('tasks')],
  ['/order-forms-casual-service/grocery-from-cs', quote('tasks')],
  ['/order-forms-standard-service/shop-any-store-ss', quote('tasks')],
  ['/order-forms-standard-service/grocery-form-ss', quote('tasks')],
  ['/order-forms-es/any-store-es', quote('tasks')],
  ['/order-forms-es/grocery-form-es', quote('tasks')],
  ['/wp-content/uploads/2022/03/1.TCC-Moving-Checklist.pdf', '/documents/tcc-moving-checklist.pdf'],
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    // Old URLs end in "/": Next.js first 308s them to the slash-less path (also permanent), then this 301 applies.
    return legacyRedirects.map(([source, destination]) => ({ source, destination, statusCode: 301 }))
  },
  serverExternalPackages: ['@node-rs/argon2'],
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 80],
    localPatterns: [{ pathname: '/images/**' }, { pathname: '/api/uploads/**' }],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/admin', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ]
  },
}

export default nextConfig
