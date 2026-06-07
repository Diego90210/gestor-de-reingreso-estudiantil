import { createClient } from "@supabase/supabase-js"
import { readSupabaseUrl, readPublishableKey } from "@/lib/supabase/keys"

export function createBrowserClient() {
  return createClient(
    readSupabaseUrl(),
    readPublishableKey(),
  )
}
