import { createClient } from "@supabase/supabase-js"
import { readPublishableKey } from "@/lib/supabase/keys"

export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    readPublishableKey(),
  )
}
