"use server"

import { auth } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"
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

  const { userId } = await auth()
  if (!userId) throw new Error("No autenticado")

  const supabase = createServerClient()

  const { data: perfilRaw } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single()

  const perfil = perfilRaw as unknown as { id: string } | null
  if (!perfil) throw new Error("Perfil de usuario no encontrado")

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
      actor_id: perfil.id,
      justificacion: input.justificacion ?? null,
    } as never)

  if (historialError)
    throw new Error(`Error al registrar historial: ${historialError.message}`)

  const { error: auditError } = await supabase.from("audit_log").insert({
    actor_id: perfil.id,
    accion: `SOLICITUD_${input.estado_nuevo.toUpperCase()}`,
    entidad: "solicitudes",
    entidad_id: input.solicitud_id,
    detalle: { justificacion: input.justificacion ?? null },
  } as never)

  if (auditError)
    throw new Error(`Error al registrar auditoría: ${auditError.message}`)

  return { success: true }
}
