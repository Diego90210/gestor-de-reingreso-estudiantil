"use server"

import { createServerClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/auth"
import type { Database } from "@/lib/supabase/types"

type DocumentoRow = Database["public"]["Tables"]["documentos_solicitud"]["Row"]

async function verificarPropietarioSolicitud(
  solicitudId: string,
  profileId: string
): Promise<void> {
  const supabase = createServerClient()
  const { data, error } = (await supabase
    .from("solicitudes")
    .select("estudiante_id")
    .eq("id", solicitudId)
    .single()) as unknown as {
    data: { estudiante_id: string } | null
    error: unknown
  }

  if (error || !data) throw new Error("Solicitud no encontrada")
  if (data.estudiante_id !== profileId) throw new Error("No autorizado")
}

export async function getSignedUploadUrl(
  solicitudId: string,
  fileName: string
) {
  const profile = await getUserProfile()
  if (!profile) throw new Error("No autenticado")

  if (profile.rol === "estudiante") {
    await verificarPropietarioSolicitud(solicitudId, profile.id)
  } else {
    throw new Error("No autorizado")
  }

  const supabase = createServerClient()
  const filePath = `${solicitudId}/${crypto.randomUUID()}-${fileName}`

  const { data, error } = await supabase.storage
    .from("documentos-solicitudes")
    .createSignedUploadUrl(filePath)

  if (error) throw new Error(`Error al generar URL de carga: ${error.message}`)

  return { signedUrl: data.signedUrl, path: filePath }
}

export async function confirmarDocumento(
  solicitudId: string,
  tipo: string,
  path: string,
  nombreArchivo: string
) {
  const profile = await getUserProfile()
  if (!profile) throw new Error("No autenticado")

  if (profile.rol === "estudiante") {
    await verificarPropietarioSolicitud(solicitudId, profile.id)
  } else {
    throw new Error("No autorizado")
  }

  const supabase = createServerClient()

  const insertPayload = {
    solicitud_id: solicitudId,
    tipo,
    url: path,
    nombre_archivo: nombreArchivo,
  } as never

  const { data, error } = await supabase
    .from("documentos_solicitud")
    .insert(insertPayload)
    .select("id")
    .single()

  if (error) throw new Error(`Error al registrar documento: ${error.message}`)

  const row = data as { id: string }

  await supabase.from("audit_log").insert({
    actor_id: profile.id,
    accion: "DOCUMENTO_SUBIDO",
    entidad: "documentos_solicitud",
    entidad_id: row.id,
    detalle: { solicitud_id: solicitudId, tipo, nombre_archivo: nombreArchivo },
  } as never)

  return row.id
}

export async function getDocumentos(solicitudId: string) {
  const profile = await getUserProfile()
  if (!profile) throw new Error("No autenticado")

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("documentos_solicitud")
    .select("*")
    .eq("solicitud_id", solicitudId)
    .order("uploaded_at", { ascending: false })

  if (error) throw new Error(`Error al cargar documentos: ${error.message}`)

  return (data ?? []) as DocumentoRow[]
}

export async function getDocumentoDownloadUrl(path: string) {
  const profile = await getUserProfile()
  if (!profile) throw new Error("No autenticado")

  const supabase = createServerClient()

  const { data, error } = await supabase.storage
    .from("documentos-solicitudes")
    .createSignedUrl(path, 60 * 60)

  if (error)
    throw new Error(`Error al generar URL de descarga: ${error.message}`)

  return data.signedUrl
}
