import { createServerClient } from "@/lib/supabase/server"
import type { RolSistema } from "@/lib/supabase/types"
import { UsuarioFiltros } from "./_components/usuario-filtros"
import { UsuariosTable } from "./_components/usuarios-table"

interface PageProps {
  searchParams: Promise<{
    search?: string
    rol?: string
    activo?: string
    page?: string
  }>
}

export default async function UsuariosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = createServerClient()

  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = 20

  let query = supabase.from("profiles").select("*", { count: "exact" })

  if (params.search) {
    query = query.or(
      `nombre.ilike.%${params.search}%,apellido.ilike.%${params.search}%,email.ilike.%${params.search}%`
    )
  }
  if (params.rol) {
    query = query.eq("rol", params.rol as RolSistema)
  }
  if (params.activo === "si") {
    query = query.eq("activo", true)
  } else if (params.activo === "no") {
    query = query.eq("activo", false)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(`Error al cargar usuarios: ${error.message}`)
  }

  const usuarios = (data ?? []) as {
    id: string
    email: string
    nombre: string
    apellido: string
    rol: RolSistema
    programa: string | null
    codigo_estudiante: string | null
    activo: boolean
    created_at: string
  }[]

  const total = count ?? 0
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Usuarios del Sistema
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestione los usuarios y sus roles en el sistema
        </p>
      </div>
      <UsuarioFiltros
        search={params.search ?? ""}
        rol={params.rol ?? ""}
        activo={params.activo ?? ""}
      />
      <UsuariosTable
        usuarios={usuarios}
        total={total}
        page={page}
        totalPages={totalPages}
      />
    </div>
  )
}
