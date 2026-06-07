"use server"

import { createServerClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/types"

type SolicitudRow = Database["public"]["Tables"]["solicitudes"]["Row"]

function contarDiasHabiles(desde: Date, hasta: Date): number {
  const totalDays = Math.floor(
    (hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (totalDays <= 0) return 0

  const weeks = Math.floor(totalDays / 7)
  const remainder = totalDays % 7
  let businessDays = weeks * 5

  let currentDay = desde.getDay()
  for (let i = 0; i < remainder; i++) {
    if (currentDay !== 0 && currentDay !== 6) businessDays++
    currentDay = (currentDay + 1) % 7
  }

  return businessDays
}

export interface ReportePeriodo {
  porEstado: Record<string, number>
  porPrograma: Record<string, number>
  tiempoPromedioDias: number | null
  solicitudesEstancadas: number
  total: number
}

export async function getReportePeriodo(
  periodo_id: string
): Promise<ReportePeriodo> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("solicitudes")
    .select("estado, programa, created_at, updated_at")
    .eq("periodo_id", periodo_id)

  if (error) throw new Error(`Error al cargar reporte: ${error.message}`)

  const solicitudes = (data ?? []) as Pick<
    SolicitudRow,
    "estado" | "programa" | "created_at" | "updated_at"
  >[]

  const porEstado = {} as Record<string, number>
  const porPrograma = {} as Record<string, number>

  for (const s of solicitudes) {
    porEstado[s.estado] = (porEstado[s.estado] ?? 0) + 1
    porPrograma[s.programa] = (porPrograma[s.programa] ?? 0) + 1
  }

  const cerradas = solicitudes.filter((s) =>
    ["aprobada", "rechazada"].includes(s.estado)
  )

  const tiempoPromedioDias =
    cerradas.length > 0
      ? cerradas.reduce((acc, s) => {
          const diff =
            new Date(s.updated_at).getTime() - new Date(s.created_at).getTime()
          return acc + diff / (1000 * 60 * 60 * 24)
        }, 0) / cerradas.length
      : null

  const ahora = new Date()
  const solicitudesEstancadas = solicitudes.filter((s) => {
    if (["aprobada", "rechazada"].includes(s.estado)) return false
    const diasHabiles = contarDiasHabiles(new Date(s.updated_at), ahora)
    return diasHabiles > 5
  }).length

  return {
    porEstado,
    porPrograma,
    tiempoPromedioDias,
    solicitudesEstancadas,
    total: solicitudes.length,
  }
}

export async function getPeriodosAcademicos() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("periodos_academicos")
    .select("id, nombre, activo")
    .order("created_at", { ascending: false })

  if (error) throw new Error(`Error al cargar períodos: ${error.message}`)

  return data ?? []
}
