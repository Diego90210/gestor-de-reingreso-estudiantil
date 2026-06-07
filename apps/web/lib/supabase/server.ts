import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import { readSupabaseUrl, readSecretKey } from "@/lib/supabase/keys"

export function createServerClient() {
  return createClient<Database>(
    readSupabaseUrl(),
    readSecretKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  )
}
