import { createServerClient } from "@/lib/supabase/server"
import { getReportePeriodo } from "@/actions/reportes"
import { ReportePeriodoClient } from "./_components/reporte-periodo"

export default async function ReportesPage() {
  const supabase = createServerClient()

  const { data: periodos } = await supabase
    .from("periodos_academicos")
    .select("id, nombre, activo")
    .order("created_at", { ascending: false })

  const periodosList = (periodos ?? []) as {
    id: string
    nombre: string
    activo: boolean
  }[]

  const periodoActivo = periodosList.find((p) => p.activo)
  const initialPeriodoId = periodoActivo?.id ?? periodosList[0]?.id ?? ""
  const initialReporte = initialPeriodoId
    ? await getReportePeriodo(initialPeriodoId)
    : null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Reportes por Período
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Métricas y estadísticas del proceso de reingreso
        </p>
      </div>
      <ReportePeriodoClient
        periodos={periodosList}
        initialPeriodoId={initialPeriodoId}
        initialReporte={initialReporte}
      />
    </div>
  )
}
