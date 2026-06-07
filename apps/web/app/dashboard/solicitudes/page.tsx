import { createServerClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/auth"
import { ITEMS_POR_PAGINA } from "@/lib/constants"
import type { EstadoSolicitud } from "@/lib/supabase/types"
import { Button } from "@workspace/ui/components/button"
import { Plus } from "lucide-react"
import Link from "next/link"
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
    periodo?: string
    page?: string
  }>
}

export default async function SolicitudesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const profile = await getUserProfile()
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

  if (profile?.rol === "estudiante") {
    query = query.eq("estudiante_id", profile.id)
  }

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
  if (params.periodo) {
    query = query.eq("periodo_id", params.periodo)
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
  const esEstudiante = profile?.rol === "estudiante"
  const rol = profile?.rol ?? ""

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {esEstudiante ? "Mis Solicitudes" : "Solicitudes de Reingreso"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {esEstudiante
              ? "Consulta el estado de tus solicitudes de reingreso"
              : "Gestione y revise las solicitudes radicadas por los estudiantes"}
          </p>
        </div>
        {esEstudiante && (
          <Button asChild>
            <Link href="/dashboard/solicitudes/nueva">
              <Plus className="h-4 w-4" />
              Nueva Solicitud
            </Link>
          </Button>
        )}
      </div>
      <SolicitudFiltros
        q={params.q ?? ""}
        estado={params.estado ?? ""}
        programa={params.programa ?? ""}
        periodos={(periodos ?? []).map((p: { id: string; nombre: string }) => ({
          id: p.id,
          nombre: p.nombre,
        }))}
        rol={rol}
      />
      <SolicitudesTable
        solicitudes={solicitudes}
        total={total}
        page={page}
        totalPages={totalPages}
        rol={rol}
      />
    </div>
  )
}
