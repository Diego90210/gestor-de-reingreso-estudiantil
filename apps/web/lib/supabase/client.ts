import { createClient } from "@supabase/supabase-js"

export function createBrowserClient() {
  const keys = JSON.parse(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEYS!)
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    keys["mi-clave"],
  )
}
