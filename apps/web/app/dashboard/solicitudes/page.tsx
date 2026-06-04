import { createServerClient } from "@/lib/supabase/server"
import { ITEMS_POR_PAGINA } from "@/lib/constants"
import type { EstadoSolicitud } from "@/lib/supabase/types"
import { SolicitudFiltros } from "./_components/solicitud-filtros"
import { SolicitudesTable } from "./_components/solicitudes-table"

type SolicitudRow = {
  id: string
  numero_radicado: string
  estudiante_id: string
  periodo_id: string
  programa: string
  estado: EstadoSolicitud
  motivo_solicitud: string
  created_at: string
  updated_at: string
  profiles: { nombre: string; apellido: string; email: string } | null
  periodos_academicos: { nombre: string } | null
}

export type SolicitudItem = {
  id: string
  numero_radicado: string
  estudiante_id: string
  periodo_id: string
  programa: string
  estado: EstadoSolicitud
  motivo_solicitud: string
  created_at: string
  updated_at: string
  estudiante: { nombre: string; apellido: string; email: string } | null
  periodo: { nombre: string } | null
}

interface PageProps {
  searchParams: Promise<{
    q?: string
    estado?: string
    programa?: string
    page?: string
  }>
}

export default async function SolicitudesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = createServerClient()
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = ITEMS_POR_PAGINA

  let query = supabase.from("solicitudes").select(
    `
      id,
      numero_radicado,
      estudiante_id,
      periodo_id,
      programa,
      estado,
      motivo_solicitud,
      created_at,
      updated_at,
      profiles!estudiante_id(nombre, apellido, email),
      periodos_academicos!periodo_id(nombre)
    `,
    { count: "exact" }
  )

  if (params.q) {
    query = query.or(
      `numero_radicado.ilike.%${params.q}%,motivo_solicitud.ilike.%${params.q}%`
    )
  }
  if (params.estado) {
    query = query.eq("estado", params.estado as EstadoSolicitud)
  }
  if (params.programa) {
    query = query.eq("programa", params.programa)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(`Error al cargar solicitudes: ${error.message}`)
  }

  const { data: periodos } = await supabase
    .from("periodos_academicos")
    .select("id, nombre")
    .order("nombre", { ascending: false })

  const solicitudes: SolicitudItem[] =
    (data as unknown as SolicitudRow[])?.map((s) => ({
      id: s.id,
      numero_radicado: s.numero_radicado,
      estudiante_id: s.estudiante_id,
      periodo_id: s.periodo_id,
      programa: s.programa,
      estado: s.estado,
      motivo_solicitud: s.motivo_solicitud,
      created_at: s.created_at,
      updated_at: s.updated_at,
      estudiante: s.profiles,
      periodo: s.periodos_academicos,
    })) ?? []

  const total = count ?? 0
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Solicitudes de Reingreso
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestione y revise las solicitudes radicadas por los estudiantes
        </p>
      </div>
      <SolicitudFiltros
        q={params.q ?? ""}
        estado={params.estado ?? ""}
        programa={params.programa ?? ""}
        periodos={(periodos ?? []).map((p: { id: string; nombre: string }) => ({
          id: p.id,
          nombre: p.nombre,
        }))}
      />
      <SolicitudesTable
        solicitudes={solicitudes}
        total={total}
        page={page}
        totalPages={totalPages}
      />
    </div>
  )
}
