import { auth } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/types"

export async function getUserProfile(): Promise<
  Database["public"]["Tables"]["profiles"]["Row"] | null
> {
  const { userId } = await auth()

  if (!userId) return null

  const supabase = createServerClient()

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_id", userId)
    .single()

  return data
}
