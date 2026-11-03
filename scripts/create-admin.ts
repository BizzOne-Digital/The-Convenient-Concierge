/**
 * Bootstraps (or re-activates) the administrator from environment variables.
 *   ADMIN_EMAIL           admin login email
 *   ADMIN_PASSWORD_HASH   Argon2id hash from `npm run hash-password -- "<password>"`
 * No password is ever stored in source code or passed on the command line here.
 */
import { requireEnv } from './env'
import mongoose from 'mongoose'
import { AdminUser } from '../models'

async function main() {
  const uri = requireEnv('MONGODB_URI')
  const email = requireEnv('ADMIN_EMAIL').trim().toLowerCase()
  const passwordHash = requireEnv('ADMIN_PASSWORD_HASH')
  if (!passwordHash.startsWith('$argon2id$')) {
    console.error('ADMIN_PASSWORD_HASH must be an Argon2id hash. Generate it with: npm run hash-password -- "<password>"')
    process.exit(1)
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('ADMIN_EMAIL is not a valid email address.')
    process.exit(1)
  }
  await mongoose.connect(uri)
  await AdminUser.createIndexes()
  const res = await AdminUser.updateOne({ email }, { $set: { email, passwordHash, isActive: true }, $setOnInsert: { role: 'owner' } }, { upsert: true })
  console.log(res.upsertedCount ? `Administrator ${email} created.` : `Administrator ${email} updated (password replaced, account active).`)
  console.log('You can now remove ADMIN_PASSWORD_HASH from your environment.')
  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error('create-admin failed:', err.message)
  await mongoose.disconnect()
  process.exit(1)
})
