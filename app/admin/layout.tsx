import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Admin | The Convenient Concierge' },
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-[#f4f1ee]">{children}</div>
}
