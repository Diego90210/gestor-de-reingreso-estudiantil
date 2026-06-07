import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import { readSecretKey } from "@/lib/supabase/keys"

export function createServerClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    readSecretKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  )
}
