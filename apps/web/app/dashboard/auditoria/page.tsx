import {
  getAuditoria,
  getAccionesUnicas,
  getActoresAuditoria,
} from "@/actions/auditoria"
import { AuditoriaFiltros } from "./_components/auditoria-filtros"
import { AuditoriaTable } from "./_components/auditoria-table"

interface PageProps {
  searchParams: Promise<{
    actor_id?: string
    accion?: string
    desde?: string
    hasta?: string
    page?: string
  }>
}

export default async function AuditoriaPage({ searchParams }: PageProps) {
  const params = await searchParams

  const [auditoria, acciones, actores] = await Promise.all([
    getAuditoria({
      actor_id: params.actor_id,
      accion: params.accion,
      desde: params.desde,
      hasta: params.hasta,
      page: params.page ? Number(params.page) : undefined,
    }),
    getAccionesUnicas(),
    getActoresAuditoria(),
  ])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Log de Auditoría
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registro de todas las acciones realizadas en el sistema
        </p>
      </div>
      <AuditoriaFiltros
        actor_id={params.actor_id ?? ""}
        accion={params.accion ?? ""}
        desde={params.desde ?? ""}
        hasta={params.hasta ?? ""}
        actores={actores}
        acciones={acciones}
      />
      <AuditoriaTable
        items={auditoria.items}
        total={auditoria.total}
        page={auditoria.page}
        totalPages={auditoria.totalPages}
      />
    </div>
  )
}
