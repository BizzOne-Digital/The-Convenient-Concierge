import Link from 'next/link'
import Image from 'next/image'
import { CityRoutes } from '@/components/ui/city-routes'
import { buttonClass } from '@/components/ui/button'

export const metadata = { title: 'Page not found', robots: { index: false } }

export default function NotFound() {
  return (
    <main className="on-dark grain relative isolate grid min-h-dvh place-items-center overflow-hidden bg-ink px-4 text-center text-white">
      <CityRoutes tone="dark" className="-z-10" />
      <div>
        <Link href="/" aria-label="The Convenient Concierge, home">
          <Image src="/images/brand/logo-nav-dark.png" alt="The Convenient Concierge" width={640} height={330} className="mx-auto h-14 w-auto" />
        </Link>
        <p className="mt-14 text-eyebrow text-red-warm">404 · Wrong turn</p>
        <h1 className="mt-6 text-h1">
          This route doesn&rsquo;t <span className="em-red">exist.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-white/65">The page you&rsquo;re looking for has moved or never existed. Let&rsquo;s get you back on track.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonClass('primary')}>
            Back to Home
          </Link>
          <Link href="/booking" className={buttonClass('outline-light')}>
            Book a Service
          </Link>
        </div>
      </div>
    </main>
  )
}
