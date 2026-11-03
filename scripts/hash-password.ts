/** Prints an Argon2id hash for ADMIN_PASSWORD_HASH. Usage: npm run hash-password -- "<strong password>" */
import { hashPassword, passwordProblem } from '../lib/password'

const pw = process.argv[2]
if (!pw) {
  console.error('Usage: npm run hash-password -- "<strong password>"')
  process.exit(1)
}
const problem = passwordProblem(pw)
if (problem) {
  console.error(problem)
  process.exit(1)
}
hashPassword(pw).then((h) => {
  console.log(h)
  console.log('\nPaste this into ADMIN_PASSWORD_HASH in .env.local (wrap it in single quotes), then run: npm run create-admin')
})
