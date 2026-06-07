function readPublishableKey(): string {
  const json = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEYS
  if (json) {
    try {
      return JSON.parse(json)["publica"]
    } catch {
      /* fall through */
    }
  }
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_publica ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    ""
  )
}

function readSecretKey(): string {
  const json = process.env.SUPABASE_SECRET_KEYS
  if (json) {
    try {
      return JSON.parse(json)["secreta"]
    } catch {
      /* fall through */
    }
  }
  return (
    process.env.SUPABASE_SECRET_secreta ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    ""
  )
}

export { readPublishableKey, readSecretKey }
