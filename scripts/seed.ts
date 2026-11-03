/**
 * Idempotent seed: safe to run repeatedly. Upserts only; never deletes.
 * Creates: site settings (verified phone/email), verified FAQs, the 27 organisation names, and all indexes.
 * Does NOT create testimonials, blog posts, bookings or any invented content.
 */
import { requireEnv } from './env'
import mongoose from 'mongoose'
import { business, defaultFaqs, organisations } from '../lib/content'
import * as models from '../models'

async function main() {
  const uri = requireEnv('MONGODB_URI')
  await mongoose.connect(uri)
  console.log(`Connected to database "${mongoose.connection.name}"`)

  await Promise.all(Object.values(mongoose.models).map((m) => m.createIndexes()))
  console.log('Indexes ensured')

  await models.SiteSettings.updateOne(
    { key: 'site' },
    { $setOnInsert: { key: 'site', contactPhone: business.phone, contactEmail: business.email } },
    { upsert: true },
  )
  console.log('Site settings ready (existing values are kept)')

  let added = 0
  for (const [i, f] of defaultFaqs.entries()) {
    const r = await models.FAQ.updateOne(
      { question: f.question },
      { $setOnInsert: { question: f.question, answer: f.answer, sortOrder: (i + 1) * 10, isPublished: true } },
      { upsert: true },
    )
    added += r.upsertedCount
  }
  console.log(`FAQs: ${added} added, ${defaultFaqs.length - added} already present`)

  await models.Organisation.bulkWrite(
    organisations.map((name, i) => ({ updateOne: { filter: { name }, update: { $set: { name, sortOrder: i } }, upsert: true } })),
  )
  console.log(`Organisations: ${organisations.length} ensured`)

  await mongoose.disconnect()
  console.log('Seed complete.')
}

main().catch(async (err) => {
  console.error('Seed failed:', err.message)
  await mongoose.disconnect()
  process.exit(1)
})
