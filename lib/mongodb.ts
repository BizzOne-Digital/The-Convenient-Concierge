import mongoose from 'mongoose'

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
const g = globalThis as typeof globalThis & { __mongoose?: Cache }
const cache: Cache = (g.__mongoose ??= { conn: null, promise: null })

/** Reuses one connection across hot reloads and serverless invocations. */
export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not configured')
  cache.promise ??= mongoose.connect(uri, {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
  })
  try {
    cache.conn = await cache.promise
  } catch (err) {
    cache.promise = null
    throw err
  }
  return cache.conn
}

export const isDbConfigured = () => Boolean(process.env.MONGODB_URI)
