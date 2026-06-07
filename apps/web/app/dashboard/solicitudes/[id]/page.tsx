import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/auth"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ESTADOS_COLOR, ESTADOS_SOLICITUD } from "@/lib/constants"
import type { EstadoSolicitud } from "@/lib/supabase/types"
import { SolicitudDetalleClient } from "./solicitud-detalle-client"
import { DocumentosSection } from "./documentos-section"

interface PageProps {
  params: Promise<{ id: string }>
}

async function getSolicitud(id: string) {
  const supabase = createServerClient()

  const { data: solicitud } = await supabase
    .from("solicitudes")
    .select(
      `
      *,
      estudiante:profiles!estudiante_id(nombre, apellido, email, codigo_estudiante),
      periodo:periodos_academicos(nombre)
    `
    )
    .eq("id", id)
    .single()

  if (!solicitud) return null

  const { data: historialRaw } = await supabase
    .from("historial_estados")
    .select(
      `
      *,
      actor:profiles!actor_id(nombre, apellido)
    `
    )
    .eq("solicitud_id", id)
    .order("created_at", { ascending: false })

  const { data: docsRaw } = await supabase
    .from("documentos_solicitud")
    .select("*")
    .eq("solicitud_id", id)

  const historial = (historialRaw ?? []) as unknown as {
    id: string
    estado_anterior: EstadoSolicitud | null
    estado_nuevo: EstadoSolicitud
    justificacion: string | null
    created_at: string
    actor: { nombre: string; apellido: string } | null
  }[]

  const documentos = (docsRaw ?? []) as unknown as {
    id: string
    solicitud_id: string
    tipo: string
    url: string
    nombre_archivo: string
    uploaded_at: string
  }[]

  return { solicitud, historial, documentos }
}

export default async function SolicitudDetallePage({ params }: PageProps) {
  const { id } = await params
  const profile = await getUserProfile()
  const data = await getSolicitud(id)

  if (!data) notFound()

  const { solicitud, historial, documentos } = data
  const solicitudRow = solicitud as unknown as {
    id: string
    numero_radicado: string
    programa: string
    estado: EstadoSolicitud
    motivo_solicitud: string
    created_at: string
    updated_at: string
    estudiante: {
      nombre: string
      apellido: string
      email: string
      codigo_estudiante: string | null
    }
    periodo: { nombre: string } | null
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/solicitudes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {solicitudRow.numero_radicado}
          </h1>
          <p className="text-sm text-muted-foreground">
            Expediente de solicitud de reingreso
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-medium">
              Información de la Solicitud
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Estado</dt>
                <dd className="mt-1">
                  <Badge
                    className={`font-medium ${ESTADOS_COLOR[solicitudRow.estado]} border-0`}
                  >
                    {
                      ESTADOS_SOLICITUD.find(
                        (e) => e.value === solicitudRow.estado
                      )?.label
                    }
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Período</dt>
                <dd className="mt-1">{solicitudRow.periodo?.nombre ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Programa</dt>
                <dd className="mt-1">{solicitudRow.programa}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Radicado</dt>
                <dd className="mt-1 font-mono text-xs">
                  {solicitudRow.numero_radicado}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Fecha de Radicación</dt>
                <dd className="mt-1">
                  {new Date(solicitudRow.created_at).toLocaleDateString(
                    "es-CO",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">
                  Motivo de la Solicitud
                </dt>
                <dd className="mt-1 text-justify">
                  {solicitudRow.motivo_solicitud}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-medium">Historial de Estados</h2>
            {historial.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay cambios de estado registrados
              </p>
            ) : (
              <div className="space-y-0">
                {historial.map((h, i) => (
                  <div
                    key={h.id}
                    className="relative flex gap-4 pb-6 last:pb-0"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`z-10 h-3 w-3 rounded-full ring-2 ring-background ${
                          i === 0 ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                      />
                      {i < historial.length - 1 && (
                        <div className="mt-0.5 h-full w-px bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`font-medium ${ESTADOS_COLOR[h.estado_nuevo]} border-0`}
                        >
                          {
                            ESTADOS_SOLICITUD.find(
                              (e) => e.value === h.estado_nuevo
                            )?.label
                          }
                        </Badge>
                        {h.estado_anterior && (
                          <span className="text-xs text-muted-foreground">
                            desde{" "}
                            {
                              ESTADOS_SOLICITUD.find(
                                (e) => e.value === h.estado_anterior!
                              )?.label
                            }
                          </span>
                        )}
                      </div>
                      {h.justificacion && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {h.justificacion}
                        </p>
                      )}
                      <div className="mt-1 text-xs text-muted-foreground">
                        {h.actor?.nombre ?? "Sistema"} {h.actor?.apellido ?? ""}{" "}
                        —{" "}
                        {new Date(h.created_at).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {profile?.rol !== "estudiante" && (
            <div className="rounded-lg border p-6">
              <h2 className="mb-4 text-lg font-medium">Estudiante</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Nombre</dt>
                  <dd className="mt-1 font-medium">
                    {solicitudRow.estudiante.nombre}{" "}
                    {solicitudRow.estudiante.apellido}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="mt-1">{solicitudRow.estudiante.email}</dd>
                </div>
                {solicitudRow.estudiante.codigo_estudiante && (
                  <div>
                    <dt className="text-muted-foreground">Código</dt>
                    <dd className="mt-1">
                      {solicitudRow.estudiante.codigo_estudiante}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <DocumentosSection
            solicitudId={solicitudRow.id}
            documentos={documentos}
            rol={profile?.rol ?? ""}
          />

          {profile?.rol !== "estudiante" && (
            <SolicitudDetalleClient
              solicitudId={solicitudRow.id}
              radicado={solicitudRow.numero_radicado}
              estado={solicitudRow.estado}
            />
          )}
        </div>
      </div>
    </div>
  )
}
