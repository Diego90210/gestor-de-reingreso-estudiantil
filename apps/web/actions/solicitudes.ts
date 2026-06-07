"use server"

import { createServerClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/auth"
import type { EstadoSolicitud } from "@/lib/supabase/types"

export interface CambiarEstadoInput {
  solicitud_id: string
  estado_nuevo: EstadoSolicitud
  justificacion?: string
}

export async function cambiarEstadoSolicitud(input: CambiarEstadoInput) {
  if (
    ["rechazada", "observada"].includes(input.estado_nuevo) &&
    !input.justificacion?.trim()
  ) {
    throw new Error("La justificación es obligatoria para este estado.")
  }

  const profile = await getUserProfile()
  if (!profile) throw new Error("No autenticado")
  if (profile.rol === "estudiante") throw new Error("No autorizado")

  const supabase = createServerClient()

  const { data: solicitudRaw } = await supabase
    .from("solicitudes")
    .select("estado")
    .eq("id", input.solicitud_id)
    .single()

  const solicitud = solicitudRaw as unknown as {
    estado: EstadoSolicitud
  } | null
  if (!solicitud) throw new Error("Solicitud no encontrada")

  const { error: updateError } = await supabase
    .from("solicitudes")
    .update({
      estado: input.estado_nuevo,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", input.solicitud_id)

  if (updateError)
    throw new Error(`Error al actualizar estado: ${updateError.message}`)

  const { error: historialError } = await supabase
    .from("historial_estados")
    .insert({
      solicitud_id: input.solicitud_id,
      estado_anterior: solicitud.estado as EstadoSolicitud,
      estado_nuevo: input.estado_nuevo,
      actor_id: profile.id,
      justificacion: input.justificacion ?? null,
    } as never)

  if (historialError)
    throw new Error(`Error al registrar historial: ${historialError.message}`)

  const { error: auditError } = await supabase.from("audit_log").insert({
    actor_id: profile.id,
    accion: `SOLICITUD_${input.estado_nuevo.toUpperCase()}`,
    entidad: "solicitudes",
    entidad_id: input.solicitud_id,
    detalle: { justificacion: input.justificacion ?? null },
  } as never)

  if (auditError)
    throw new Error(`Error al registrar auditoría: ${auditError.message}`)

  return { success: true }
}

export async function crearSolicitud(data: {
  periodo_id: string
  programa: string
  motivo_solicitud: string
}) {
  const profile = await getUserProfile()
  if (!profile) throw new Error("No autenticado")
  if (profile.rol !== "estudiante") throw new Error("No autorizado")

  const supabase = createServerClient()

  const { error } = await supabase.from("solicitudes").insert({
    estudiante_id: profile.id,
    periodo_id: data.periodo_id,
    programa: data.programa,
    motivo_solicitud: data.motivo_solicitud,
  } as never)

  if (error) throw new Error(`Error al crear solicitud: ${error.message}`)

  await supabase.from("audit_log").insert({
    actor_id: profile.id,
    accion: "SOLICITUD_RADICADA",
    entidad: "solicitudes",
    detalle: { programa: data.programa, periodo_id: data.periodo_id },
  } as never)

  return { success: true }
}

export async function getPeriodosActivos() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("periodos_academicos")
    .select("id, nombre")
    .eq("activo", true)
    .order("created_at", { ascending: false })

  if (error) throw new Error("Error al cargar períodos")

  return (data ?? []) as { id: string; nombre: string }[]
}
