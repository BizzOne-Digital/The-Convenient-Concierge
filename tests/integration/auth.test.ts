import { describe, expect, it } from 'vitest'
import { SESSION_COOKIE, authenticate, createSession, destroySession, getAdminFromRequest, getAdminFromToken } from '@/lib/auth'
import { hashPassword } from '@/lib/password'
import { AdminSession, AdminUser } from '@/models'
import { setupTestDb } from '../helpers/db'

setupTestDb()

const PASSWORD = 'correct-horse-battery-9'
async function makeAdmin(overrides: Partial<{ email: string; isActive: boolean }> = {}) {
  return AdminUser.create({ email: 'owner@example.com', passwordHash: await hashPassword(PASSWORD), role: 'owner', ...overrides })
}

describe('admin authentication', () => {
  it('logs in with valid credentials and stores only a hash', async () => {
    await makeAdmin()
    const res = await authenticate('Owner@Example.com ', PASSWORD, '1.1.1.1')
    expect(res.ok).toBe(true)
    const stored = await AdminUser.findOne({ email: 'owner@example.com' }).select('+passwordHash').lean()
    expect(stored!.passwordHash).toMatch(/^\$argon2id\$/)
    expect(stored!.passwordHash).not.toContain(PASSWORD)
  })

  it('rejects wrong passwords and unknown emails with the same message', async () => {
    await makeAdmin()
    const a = await authenticate('owner@example.com', 'wrong-password-1', '1.1.1.2')
    const b = await authenticate('nobody@example.com', PASSWORD, '1.1.1.3')
    expect(a).toEqual({ ok: false, error: 'Incorrect email or password.' })
    expect(b).toEqual(a)
  })

  it('rejects inactive accounts', async () => {
    await makeAdmin({ isActive: false })
    expect((await authenticate('owner@example.com', PASSWORD, '1.1.1.4')).ok).toBe(false)
  })

  it('locks out brute-force attempts per email', async () => {
    await makeAdmin()
    for (let i = 0; i < 5; i++) await authenticate('owner@example.com', 'nope-nope-1', `2.2.2.${i}`)
    const res = await authenticate('owner@example.com', PASSWORD, '2.2.2.99')
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toMatch(/too many/i)
  })

  it('sessions resolve to the admin, and stop working when deactivated, expired or logged out', async () => {
    const user = await makeAdmin()
    const { token } = await createSession(String(user._id))
    expect((await getAdminFromToken(token))?.email).toBe('owner@example.com')

    // Cookie parsing for route handlers
    const req = new Request('http://localhost/api/upload', { headers: { cookie: `x=1; ${SESSION_COOKIE}=${encodeURIComponent(token)}` } })
    expect((await getAdminFromRequest(req))?.id).toBe(String(user._id))

    await AdminUser.updateOne({ _id: user._id }, { isActive: false })
    expect(await getAdminFromToken(token)).toBeNull()

    await AdminUser.updateOne({ _id: user._id }, { isActive: true })
    await AdminSession.updateMany({}, { expiresAt: new Date(Date.now() - 1000) })
    expect(await getAdminFromToken(token)).toBeNull()

    const fresh = await createSession(String(user._id))
    await destroySession(fresh.token)
    expect(await getAdminFromToken(fresh.token)).toBeNull()
  })

  it('never stores raw session tokens', async () => {
    const user = await makeAdmin()
    const { token } = await createSession(String(user._id))
    const s = await AdminSession.findOne().lean()
    expect(s!.tokenHash).not.toBe(token)
    expect(await getAdminFromToken('forged-token')).toBeNull()
    expect(await getAdminFromToken(undefined)).toBeNull()
  })
})
