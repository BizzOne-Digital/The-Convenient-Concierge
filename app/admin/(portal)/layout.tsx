import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, LogOut } from 'lucide-react'
import { AdminNav } from '@/components/admin/admin-nav'
import { logoutAction } from '@/app/admin/actions'
import { requireAdmin } from '@/lib/session'
import { connectDB } from '@/lib/mongodb'
import { BookingInquiry } from '@/models'

export const dynamic = 'force-dynamic'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()
  await connectDB()
  const newCount = await BookingInquiry.countDocuments({ status: 'new' })
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[16.5rem_1fr]">
      <aside className="on-dark bg-ink text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <div className="flex items-center justify-between gap-4 px-4 py-4 lg:block lg:px-5 lg:py-7">
          <Link href="/admin" aria-label="Admin overview">
            <Image src="/images/brand/logo-nav-dark.png" alt="The Convenient Concierge" width={640} height={330} className="h-10 w-auto lg:h-12" />
          </Link>
        </div>
        <nav aria-label="Admin" className="px-3 pb-3 lg:flex-1 lg:pb-0">
          <AdminNav newCount={newCount} />
        </nav>
        <div className="hidden border-t border-white/10 p-4 lg:block">
          <p className="truncate px-1 text-xs text-white/45">Signed in as</p>
          <p className="truncate px-1 text-sm font-medium">{admin.email}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/" target="_blank" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/15 py-2 text-xs font-semibold text-white/80 hover:bg-white/5">
              <ExternalLink aria-hidden className="size-3.5" /> View site
            </Link>
            <form action={logoutAction} className="flex-1">
              <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/15 py-2 text-xs font-semibold text-white/80 hover:bg-white/5">
                <LogOut aria-hidden className="size-3.5" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="flex items-center justify-end gap-2 border-b border-[#e8e0da] bg-white px-4 py-2 lg:hidden">
          <form action={logoutAction}>
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold">
              <LogOut aria-hidden className="size-3.5" /> Sign out
            </button>
          </form>
        </div>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:py-12">{children}</main>
      </div>
    </div>
  )
}
