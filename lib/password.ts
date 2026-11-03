import { hash, verify } from '@node-rs/argon2'

// Argon2id (library default algorithm) with OWASP-recommended cost. Shared by the app and CLI scripts.
const ARGON = { memoryCost: 19456, timeCost: 2, parallelism: 1 }
export const hashPassword = (password: string) => hash(password, ARGON)
export const verifyPassword = (passwordHash: string, password: string) => verify(passwordHash, password).catch(() => false)

/** Minimum policy for admin passwords. */
export function passwordProblem(pw: string): string | null {
  if (pw.length < 12) return 'Password must be at least 12 characters.'
  if (!/[a-z]/i.test(pw) || !/\d/.test(pw)) return 'Password must contain letters and numbers.'
  return null
}
