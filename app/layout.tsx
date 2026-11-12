import type { Metadata, Viewport } from 'next'
import { DM_Sans, Instrument_Serif } from 'next/font/google'
import { business } from '@/lib/content'
import './globals.css'

const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-instrument', display: 'swap' })
const sans = DM_Sans({ subsets: ['latin'], variable: '--font-dm', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  title: { default: `${business.name} | Moving, Deliveries, Tasks & Errands in Toronto`, template: `%s | ${business.name}` },
  description:
    'Your personal concierge in Toronto. Moving, pick-up & delivery, and tasks & errands for homes and businesses in Toronto, Etobicoke, Mississauga and the GTA.',
  applicationName: business.name,
  formatDetection: { telephone: false },
}

export const viewport: Viewport = { themeColor: '#101012', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the splash script sets data-splash on <html> before hydration.
    <html lang="en-CA" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
