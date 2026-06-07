"use server"

import { createServerClient } from "@/lib/supabase/server"

export interface DashboardMetrics {
  totalSolicitudes: number
  aprobadas: number
  pendientes: number
  observadas: number
  usuariosActivos: number
  ultimasSolicitudes: {
    id: string
    numero_radicado: string
    estado: string
    programa: string
    created_at: string
  }[]
}

export interface StudentDashboardMetrics {
  totalSolicitudes: number
  aprobadas: number
  pendientes: number
  observadas: number
  ultimasSolicitudes: {
    id: string
    numero_radicado: string
    estado: string
    programa: string
    created_at: string
  }[]
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createServerClient()

  const [
    totalRes,
    aprobadasRes,
    pendientesRes,
    observadasRes,
    usuariosRes,
    ultimasRes,
  ] = await Promise.all([
    supabase.from("solicitudes").select("*", { count: "exact", head: true }),
    supabase
      .from("solicitudes")
      .select("*", { count: "exact", head: true })
      .eq("estado", "aprobada"),
    supabase
      .from("solicitudes")
      .select("*", { count: "exact", head: true })
      .not("estado", "in", '("aprobada","rechazada")'),
    supabase
      .from("solicitudes")
      .select("*", { count: "exact", head: true })
      .eq("estado", "observada"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("activo", true),
    supabase
      .from("solicitudes")
      .select("id, numero_radicado, estado, programa, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  return {
    totalSolicitudes: totalRes.count ?? 0,
    aprobadas: aprobadasRes.count ?? 0,
    pendientes: pendientesRes.count ?? 0,
    observadas: observadasRes.count ?? 0,
    usuariosActivos: usuariosRes.count ?? 0,
    ultimasSolicitudes: ultimasRes.data ?? [],
  }
}

export async function getStudentDashboardMetrics(
  estudianteId: string
): Promise<StudentDashboardMetrics> {
  const supabase = createServerClient()

  const baseQuery = supabase
    .from("solicitudes")
    .select("*", { count: "exact", head: true })
    .eq("estudiante_id", estudianteId)

  const [totalRes, aprobadasRes, pendientesRes, observadasRes, ultimasRes] =
    await Promise.all([
      baseQuery,
      supabase
        .from("solicitudes")
        .select("*", { count: "exact", head: true })
        .eq("estudiante_id", estudianteId)
        .eq("estado", "aprobada"),
      supabase
        .from("solicitudes")
        .select("*", { count: "exact", head: true })
        .eq("estudiante_id", estudianteId)
        .not("estado", "in", '("aprobada","rechazada")'),
      supabase
        .from("solicitudes")
        .select("*", { count: "exact", head: true })
        .eq("estudiante_id", estudianteId)
        .eq("estado", "observada"),
      supabase
        .from("solicitudes")
        .select("id, numero_radicado, estado, programa, created_at")
        .eq("estudiante_id", estudianteId)
        .order("created_at", { ascending: false })
        .limit(5),
    ])

  return {
    totalSolicitudes: totalRes.count ?? 0,
    aprobadas: aprobadasRes.count ?? 0,
    pendientes: pendientesRes.count ?? 0,
    observadas: observadasRes.count ?? 0,
    ultimasSolicitudes: ultimasRes.data ?? [],
  }
}
