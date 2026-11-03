import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE, getAdminFromToken, type AdminIdentity } from '@/lib/auth'

/** For Server Components and Server Actions. */
export async function getCurrentAdmin(): Promise<AdminIdentity | null> {
  const jar = await cookies()
  try {
    return await getAdminFromToken(jar.get(SESSION_COOKIE)?.value)
  } catch {
    return null
  }
}

export async function requireAdmin(): Promise<AdminIdentity> {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')
  return admin
}
