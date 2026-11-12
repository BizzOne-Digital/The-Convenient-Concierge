import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { connectDB } from '@/lib/mongodb'

/** Isolated in-memory MongoDB per test file. Never touches a real database. */
export function setupTestDb() {
  let server: MongoMemoryServer
  beforeAll(async () => {
    server = await MongoMemoryServer.create()
    process.env.MONGODB_URI = server.getUri('tcc-test')
    await connectDB()
    await Promise.all(Object.values(mongoose.models).map((m) => m.createIndexes()))
  })
  afterEach(async () => {
    await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})))
  })
  afterAll(async () => {
    await mongoose.disconnect()
    await server?.stop()
  })
}

// Minimal valid file signatures.
export const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c626001000000050001a5f645400000000049454e44ae426082', 'hex')
export const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01])
export const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')

export function multipart(fields: Record<string, string | Blob | Blob[]>, headers: Record<string, string> = {}): RequestInit & { headers: Record<string, string> } {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) for (const item of Array.isArray(v) ? v : [v]) fd.append(k, item)
  return { method: 'POST', body: fd, headers }
}
