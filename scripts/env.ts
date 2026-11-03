// Loads .env.local / .env for CLI scripts (Node >= 20.12).
for (const f of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(f)
  } catch {
    /* file not present */
  }
}

export function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) {
    console.error(`Missing ${name}. Add it to .env.local (see .env.example).`)
    process.exit(1)
  }
  return v
}
