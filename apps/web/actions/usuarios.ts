"use server"

import { auth, clerkClient } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"
import type { RolSistema } from "@/lib/supabase/types"

export interface CrearUsuarioInput {
  email: string
  nombre: string
  apellido: string
  rol: RolSistema
  programa?: string
  codigo_estudiante?: string
}

export async function crearUsuario(data: CrearUsuarioInput) {
  const { userId } = await auth()
  if (!userId) throw new Error("No autenticado")

  const clerk = await clerkClient()

  const clerkUser = await clerk.users.createUser({
    emailAddress: [data.email],
    firstName: data.nombre,
    lastName: data.apellido,
    skipPasswordRequirement: true,
  })

  const supabase = createServerClient()

  const { error } = await supabase.from("profiles").insert({
    clerk_id: clerkUser.id,
    email: data.email,
    nombre: data.nombre,
    apellido: data.apellido,
    rol: data.rol,
    programa: data.programa ?? null,
    codigo_estudiante: data.codigo_estudiante ?? null,
  } as never)

  if (error) {
    await clerk.users.deleteUser(clerkUser.id)
    throw new Error(`Error al crear perfil: ${error.message}`)
  }

  const { data: perfil } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", clerkUser.id)
    .single()

  await supabase.from("audit_log").insert({
    actor_id: perfil ? (perfil as unknown as { id: string }).id : null,
    accion: "USER_CREATED",
    entidad: "profiles",
    detalle: { email: data.email, rol: data.rol },
  } as never)

  return { success: true }
}

export async function desactivarUsuario(profileId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("No autenticado")

  const supabase = createServerClient()

  const { data: perfil } = await supabase
    .from("profiles")
    .select("id, clerk_id, email, rol")
    .eq("id", profileId)
    .single()

  if (!perfil) throw new Error("Usuario no encontrado")

  const row = perfil as unknown as {
    id: string
    clerk_id: string
    email: string
    rol: string
  }

  const clerk = await clerkClient()
  await clerk.users.banUser(row.clerk_id)

  const { error } = await supabase
    .from("profiles")
    .update({ activo: false } as never)
    .eq("id", profileId)

  if (error) throw new Error(`Error al desactivar perfil: ${error.message}`)

  await supabase.from("audit_log").insert({
    actor_id: row.id,
    accion: "USER_DEACTIVATED",
    entidad: "profiles",
    entidad_id: profileId,
    detalle: { email: row.email, rol: row.rol },
  } as never)

  return { success: true }
}

export async function reactivarUsuario(profileId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("No autenticado")

  const supabase = createServerClient()

  const { data: perfil } = await supabase
    .from("profiles")
    .select("id, clerk_id, email, rol")
    .eq("id", profileId)
    .single()

  if (!perfil) throw new Error("Usuario no encontrado")

  const row = perfil as unknown as {
    id: string
    clerk_id: string
    email: string
    rol: string
  }

  const clerk = await clerkClient()
  await clerk.users.unbanUser(row.clerk_id)

  const { error } = await supabase
    .from("profiles")
    .update({ activo: true } as never)
    .eq("id", profileId)

  if (error) throw new Error(`Error al reactivar perfil: ${error.message}`)

  await supabase.from("audit_log").insert({
    actor_id: row.id,
    accion: "USER_REACTIVATED",
    entidad: "profiles",
    entidad_id: profileId,
    detalle: { email: row.email, rol: row.rol },
  } as never)

  return { success: true }
}

export async function getUsuarios(filtros: {
  search?: string
  rol?: string
  activo?: string
  page?: number
}) {
  const supabase = createServerClient()

  let query = supabase.from("profiles").select("*", { count: "exact" })

  if (filtros.search) {
    query = query.or(
      `nombre.ilike.%${filtros.search}%,apellido.ilike.%${filtros.search}%,email.ilike.%${filtros.search}%`
    )
  }
  if (filtros.rol) {
    query = query.eq("rol", filtros.rol as RolSistema)
  }
  if (filtros.activo === "si") {
    query = query.eq("activo", true)
  } else if (filtros.activo === "no") {
    query = query.eq("activo", false)
  }

  const page = Math.max(1, filtros.page ?? 1)
  const pageSize = 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) throw new Error(`Error al cargar usuarios: ${error.message}`)

  const usuarios = (data ?? []) as unknown as {
    id: string
    clerk_id: string
    email: string
    nombre: string
    apellido: string
    rol: RolSistema
    programa: string | null
    codigo_estudiante: string | null
    activo: boolean
    created_at: string
  }[]

  return {
    usuarios,
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}
