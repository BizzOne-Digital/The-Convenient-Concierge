import 'server-only'
import { createHmac, randomBytes } from 'node:crypto'
import { Types } from 'mongoose'
import { hashPassword, verifyPassword } from '@/lib/password'
import { connectDB } from '@/lib/mongodb'
import { rateLimit } from '@/lib/rate-limit'
import { AdminSession, AdminUser } from '@/models'

export const SESSION_TTL_SECONDS = 60 * 60 * 8
export const SESSION_COOKIE = process.env.NODE_ENV === 'production' ? '__Host-tcc_admin' : 'tcc_admin'

export type AdminIdentity = { id: string; email: string; role: string }

// Used to keep timing similar when the email does not exist.
let dummyHash: Promise<string> | null = null

function secret(): string {
  const s = process.env.AUTH_SECRET
  if (!s || s.length < 32) throw new Error('AUTH_SECRET must be set to at least 32 characters')
  return s
}
const hashToken = (token: string) => createHmac('sha256', secret()).update(token).digest('hex')

export type LoginResult = { ok: true; admin: AdminIdentity } | { ok: false; error: string }

export async function authenticate(emailInput: string, password: string, ip: string): Promise<LoginResult> {
  await connectDB()
  const email = emailInput.trim().toLowerCase()
  const [byIp, byEmail] = await Promise.all([rateLimit(`login-ip:${ip}`, 10, 900), rateLimit(`login-email:${email}`, 5, 900)])
  if (!byIp.ok || !byEmail.ok) return { ok: false, error: 'Too many sign-in attempts. Please wait 15 minutes and try again.' }

  const user = await AdminUser.findOne({ email }).select('+passwordHash').lean()
  if (!user) {
    dummyHash ??= hashPassword(randomBytes(16).toString('hex'))
    await verifyPassword(await dummyHash, password)
    return { ok: false, error: 'Incorrect email or password.' }
  }
  const valid = await verifyPassword(user.passwordHash, password)
  if (!valid || !user.isActive) return { ok: false, error: 'Incorrect email or password.' }
  return { ok: true, admin: { id: String(user._id), email: user.email, role: user.role } }
}

export async function createSession(adminId: string): Promise<{ token: string; expiresAt: Date }> {
  await connectDB()
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000)
  await AdminSession.create({ tokenHash: hashToken(token), adminId, expiresAt })
  return { token, expiresAt }
}

/** Resolves a session token to an active admin. Checks expiry and isActive on every call. */
export async function getAdminFromToken(token: string | undefined | null): Promise<AdminIdentity | null> {
  if (!token || token.length > 200) return null
  await connectDB()
  const session = await AdminSession.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }).lean()
  if (!session || !Types.ObjectId.isValid(session.adminId)) return null
  const user = await AdminUser.findOne({ _id: session.adminId, isActive: true }).lean()
  if (!user) return null
  return { id: String(user._id), email: user.email, role: user.role }
}

export async function destroySession(token: string | undefined | null) {
  if (!token) return
  await connectDB()
  await AdminSession.deleteOne({ tokenHash: hashToken(token) })
}

export function readCookie(headers: Headers, name: string): string | null {
  const raw = headers.get('cookie')
  if (!raw) return null
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

/** For Route Handlers: reads the session from the incoming request. */
export const getAdminFromRequest = (req: Request) => getAdminFromToken(readCookie(req.headers, SESSION_COOKIE))

export const sessionCookieOptions = (expires: Date) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  expires,
})
