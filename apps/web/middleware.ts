import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"
import type { NextRequest } from "next/server"

const isAdminRoute = createRouteMatcher([
  "/dashboard/usuarios(.*)",
  "/dashboard/reportes(.*)",
  "/dashboard/auditoria(.*)",
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (!isAdminRoute(req)) return

  const { userId } = await auth()
  if (!userId) return

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("clerk_id", userId)
    .single()

  if (profile && (profile as unknown as { rol: string }).rol === "estudiante") {
    return Response.redirect(new URL("/dashboard/no-autorizado", req.url))
  }
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
