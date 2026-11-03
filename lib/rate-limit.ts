import 'server-only'
import { connectDB } from '@/lib/mongodb'
import { RateLimit } from '@/models'

/**
 * Fixed-window limiter persisted in MongoDB (shared by every serverless instance).
 * ponytail: fixed window allows a 2x burst at window edges; move to sliding window if abuse shows up.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<{ ok: boolean; remaining: number }> {
  await connectDB()
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000))
  const doc = await RateLimit.findOneAndUpdate(
    { key: `${key}:${bucket}` },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 1) * windowSeconds * 1000) } },
    { upsert: true, returnDocument: 'after' },
  ).lean()
  const count = doc?.count ?? 1
  return { ok: count <= limit, remaining: Math.max(0, limit - count) }
}

export function clientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown'
}
