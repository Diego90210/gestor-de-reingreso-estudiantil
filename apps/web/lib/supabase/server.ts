import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"

export function createServerClient() {
  const keys = JSON.parse(process.env.SUPABASE_SECRET_KEYS!)
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    keys["mi-clave"],
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  )
}
