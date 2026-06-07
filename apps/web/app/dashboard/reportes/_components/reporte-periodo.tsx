"use client"

import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { ESTADOS_COLOR, ESTADOS_SOLICITUD } from "@/lib/constants"
import { getReportePeriodo } from "@/actions/reportes"
import type { ReportePeriodo } from "@/actions/reportes"

interface Periodo {
  id: string
  nombre: string
  activo: boolean
}

const CHART_COLORS = [
  "#3b82f6",
  "#eab308",
  "#f97316",
  "#a855f7",
  "#ef4444",
  "#6366f1",
  "#22c55e",
  "#6b7280",
]

function colorHex(estado: string): string {
  const cls = ESTADOS_COLOR[estado as keyof typeof ESTADOS_COLOR] ?? ""
  const map: Record<string, string> = {
    "bg-blue-100 text-blue-800": "#3b82f6",
    "bg-yellow-100 text-yellow-800": "#eab308",
    "bg-orange-100 text-orange-800": "#f97316",
    "bg-purple-100 text-purple-800": "#a855f7",
    "bg-red-100 text-red-800": "#ef4444",
    "bg-indigo-100 text-indigo-800": "#6366f1",
    "bg-green-100 text-green-800": "#22c55e",
    "bg-gray-100 text-gray-800": "#6b7280",
  }
  return map[cls] ?? "#6b7280"
}

function estadoLabel(value: string): string {
  return ESTADOS_SOLICITUD.find((e) => e.value === value)?.label ?? value
}

export function ReportePeriodoClient({
  periodos,
  initialPeriodoId,
  initialReporte,
}: {
  periodos: Periodo[]
  initialPeriodoId: string
  initialReporte: ReportePeriodo | null
}) {
  const [periodoId, setPeriodoId] = useState(initialPeriodoId)
  const [reporte, setReporte] = useState<ReportePeriodo | null>(initialReporte)

  useEffect(() => {
    if (!periodoId) return
    const controller = new AbortController()
    getReportePeriodo(periodoId)
      .then((r) => {
        if (!controller.signal.aborted) setReporte(r)
      })
      .catch(() => {
        if (!controller.signal.aborted) setReporte(null)
      })
    return () => controller.abort()
  }, [periodoId])

  const estadoData = reporte
    ? Object.entries(reporte.porEstado).map(([estado, count]) => ({
        name: estadoLabel(estado),
        value: count,
        fill: colorHex(estado),
      }))
    : []

  const programaData = reporte
    ? Object.entries(reporte.porPrograma)
        .map(([programa, count]) => ({ name: programa, solicitudes: count }))
        .sort((a, b) => b.solicitudes - a.solicitudes)
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-64">
          <Select value={periodoId} onValueChange={setPeriodoId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              {periodos.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nombre} {p.activo ? "(Activo)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {!reporte && (
          <span className="text-sm text-muted-foreground">
            {periodoId ? "Cargando..." : ""}
          </span>
        )}
      </div>

      {reporte ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Solicitudes
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{reporte.total}</p>
                <p className="text-xs text-muted-foreground">
                  En el período seleccionado
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Tiempo Promedio
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {reporte.tiempoPromedioDias !== null
                    ? `${Math.round(reporte.tiempoPromedioDias * 10) / 10} días`
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {reporte.tiempoPromedioDias !== null
                    ? "Desde radicación hasta cierre"
                    : "Sin solicitudes cerradas"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Sin Movimiento
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {reporte.solicitudesEstancadas}
                </p>
                <p className="text-xs text-muted-foreground">
                  &gt;5 días sin actualización
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Aprobadas / Rechazadas
                </CardTitle>
                <div className="flex gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <XCircle className="h-4 w-4 text-gray-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {`${reporte.porEstado["aprobada"] ?? 0} / ${reporte.porEstado["rechazada"] ?? 0}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Aprobadas / Rechazadas
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ minHeight: 300 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={estadoData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) =>
                          `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                      >
                        {estadoData.map((entry, i) => (
                          <Cell
                            key={entry.name}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Solicitudes por Programa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {programaData.length > 0 ? (
                    programaData.map(({ name, solicitudes }) => (
                      <div
                        key={name}
                        className="flex items-center justify-between rounded-lg border px-4 py-3"
                      >
                        <span className="text-sm font-medium">{name}</span>
                        <span className="text-sm text-muted-foreground tabular-nums">
                          {solicitudes} solicitud{solicitudes !== 1 ? "es" : ""}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hay solicitudes registradas en este período.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {ESTADOS_SOLICITUD.map(({ value, label }) => (
                  <div
                    key={value}
                    className={`rounded-lg border p-3 ${ESTADOS_COLOR[value]}`}
                  >
                    <p className="text-xs font-medium">{label}</p>
                    <p className="mt-1 text-2xl font-bold">
                      {reporte.porEstado[value] ?? 0}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
          {periodoId
            ? "No se encontraron solicitudes para este período."
            : "Seleccione un período académico para ver las métricas."}
        </div>
      )}
    </div>
  )
}
