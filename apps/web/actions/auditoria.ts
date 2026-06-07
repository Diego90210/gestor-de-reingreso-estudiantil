"use server"

import { createServerClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/types"

type AuditLogRow = Database["public"]["Tables"]["audit_log"]["Row"]

export interface AuditoriaFiltros {
  actor_id?: string
  accion?: string
  desde?: string
  hasta?: string
  page?: number
}

export interface AuditoriaItem {
  id: string
  actor: { nombre: string; apellido: string } | null
  accion: string
  entidad: string
  entidad_id: string | null
  detalle: Record<string, unknown> | null
  created_at: string
}

export async function getAuditoria(filtros: AuditoriaFiltros) {
  const supabase = createServerClient()
  const pageSize = 30
  const page = Math.max(1, filtros.page ?? 1)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("audit_log")
    .select("*, actor:profiles!actor_id(nombre, apellido)", { count: "exact" })

  if (filtros.actor_id) {
    query = query.eq("actor_id", filtros.actor_id)
  }
  if (filtros.accion) {
    query = query.eq("accion", filtros.accion)
  }
  if (filtros.desde) {
    query = query.gte("created_at", filtros.desde)
  }
  if (filtros.hasta) {
    query = query.lte("created_at", filtros.hasta)
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) throw new Error(`Error al cargar auditoría: ${error.message}`)

  const items = (data ?? []) as unknown[] as (AuditLogRow & {
    actor: { nombre: string; apellido: string } | null
  })[]

  const result: AuditoriaItem[] = items.map((item) => ({
    id: item.id,
    actor: item.actor,
    accion: item.accion,
    entidad: item.entidad,
    entidad_id: item.entidad_id,
    detalle: item.detalle as Record<string, unknown> | null,
    created_at: item.created_at,
  }))

  return {
    items: result,
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

export async function getAccionesUnicas() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("audit_log")
    .select("accion")
    .order("accion", { ascending: true })

  if (error) throw new Error(`Error al cargar acciones: ${error.message}`)

  const rawData = (data ?? []) as { accion: string }[]
  const acciones = [...new Set(rawData.map((d) => d.accion))]

  return acciones
}

export async function getActoresAuditoria() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("audit_log")
    .select("actor_id")
    .not("actor_id", "is", null)
    .order("actor_id", { ascending: true })

  if (error) throw new Error(`Error al cargar actores: ${error.message}`)

  const rawLogs = (data ?? []) as { actor_id: string }[]
  const actorIds = [...new Set(rawLogs.map((d) => d.actor_id))]

  if (actorIds.length === 0) return []

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nombre, apellido")
    .in("id", actorIds)

  const rawProfiles = (profiles ?? []) as {
    id: string
    nombre: string
    apellido: string
  }[]

  return rawProfiles.map((p) => ({
    id: p.id,
    nombre: `${p.nombre} ${p.apellido}`,
  }))
}
