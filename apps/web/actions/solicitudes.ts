"use server"

import { createServerClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/auth"
import type { EstadoSolicitud } from "@/lib/supabase/types"
import { ESTADOS_SOLICITUD } from "@/lib/constants"
import {
  enviarNotificacionCambioEstado,
  enviarNotificacionNuevaSolicitud,
} from "@/lib/email"

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
    .select("estado, numero_radicado, estudiante_id")
    .eq("id", input.solicitud_id)
    .single()

  const solicitud = solicitudRaw as unknown as {
    estado: EstadoSolicitud
    numero_radicado: string
    estudiante_id: string
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
    detalle: {
      estado_anterior: solicitud.estado,
      estado_nuevo: input.estado_nuevo,
      justificacion: input.justificacion ?? null,
    },
  } as never)

  if (auditError)
    throw new Error(`Error al registrar auditoría: ${auditError.message}`)

  // Enviar email al estudiante (fallo no revierte la operación)
  try {
    const { data: estudianteRaw } = await supabase
      .from("profiles")
      .select("email, nombre, apellido")
      .eq("id", solicitud.estudiante_id)
      .single()

    const estudiante = estudianteRaw as unknown as {
      email: string
      nombre: string
      apellido: string
    } | null

    if (estudiante) {
      const estadoAnteriorLabel =
        ESTADOS_SOLICITUD.find((e) => e.value === solicitud.estado)?.label ??
        solicitud.estado
      const estadoNuevoLabel =
        ESTADOS_SOLICITUD.find((e) => e.value === input.estado_nuevo)?.label ??
        input.estado_nuevo

      await enviarNotificacionCambioEstado({
        emailEstudiante: estudiante.email,
        nombreEstudiante: `${estudiante.nombre} ${estudiante.apellido}`,
        numeroRadicado: solicitud.numero_radicado,
        estadoAnterior: estadoAnteriorLabel,
        estadoNuevo: estadoNuevoLabel,
        justificacion: input.justificacion ?? undefined,
      })
    }
  } catch (err) {
    console.error(
      `[email] Error al enviar notificación de cambio de estado (solicitud: ${input.solicitud_id}):`,
      err,
    )
  }

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

  const { data: solicitudCreadaRaw, error } = await supabase
    .from("solicitudes")
    .insert({
      estudiante_id: profile.id,
      periodo_id: data.periodo_id,
      programa: data.programa,
      motivo_solicitud: data.motivo_solicitud,
    } as never)
    .select("numero_radicado, periodo_id")
    .single()

  if (error) throw new Error(`Error al crear solicitud: ${error.message}`)

  const solicitudCreada = solicitudCreadaRaw as unknown as {
    numero_radicado: string
    periodo_id: string
  }
  if (!solicitudCreada) throw new Error("Error al obtener datos de la solicitud")

  await supabase.from("audit_log").insert({
    actor_id: profile.id,
    accion: "SOLICITUD_RADICADA",
    entidad: "solicitudes",
    detalle: { programa: data.programa, periodo_id: data.periodo_id },
  } as never)

  // Notificar a los administradores (fallo no revierte la radicación)
  try {
    const { data: adminsRaw } = await supabase
      .from("profiles")
      .select("email")
      .eq("rol", "registro_control")
      .eq("activo", true)

    const admins = adminsRaw as unknown as { email: string }[]
    const emails = admins?.map((a) => a.email) ?? []

    if (emails.length > 0) {
      const { data: periodoRaw } = await supabase
        .from("periodos_academicos")
        .select("nombre")
        .eq("id", solicitudCreada.periodo_id)
        .single()

      const periodo = periodoRaw as unknown as { nombre: string } | null

      await enviarNotificacionNuevaSolicitud({
        emailsRegistroControl: emails,
        nombreEstudiante: `${profile.nombre} ${profile.apellido}`,
        programa: data.programa,
        numeroRadicado: solicitudCreada.numero_radicado,
        periodoNombre: periodo?.nombre ?? "",
      })
    }
  } catch (err) {
    console.error(
      `[email] Error al notificar nueva solicitud (radicado: ${solicitudCreada.numero_radicado}):`,
      err,
    )
  }

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
