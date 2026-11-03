import Image from 'next/image'
import { redirect } from 'next/navigation'
import { CityRoutes } from '@/components/ui/city-routes'
import { LoginForm } from '@/components/admin/login-form'
import { getCurrentAdmin } from '@/lib/session'

export const metadata = { title: 'Sign in' }

export default async function LoginPage() {
  if (await getCurrentAdmin()) redirect('/admin')
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="on-dark relative isolate hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <CityRoutes tone="dark" className="-z-10" />
        <Image src="/images/brand/logo-on-dark.png" alt="The Convenient Concierge" width={900} height={498} className="h-auto w-48" />
        <div>
          <p className="text-h2">
            Your day, <span className="em-red">organised.</span>
          </p>
          <p className="mt-4 max-w-sm text-white/60">Manage booking requests, articles, FAQs, testimonials and website images.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <Image src="/images/brand/logo-on-light.png" alt="The Convenient Concierge" width={900} height={498} className="mb-10 h-auto w-40 lg:hidden" />
          <h1 className="text-h3">Admin sign in</h1>
          <p className="mt-2 text-sm text-muted">Authorised staff only.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
