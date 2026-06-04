import {
  FileText,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react"

const metrics = [
  {
    label: "Total Solicitudes",
    value: "—",
    icon: FileText,
    description: "Solicitudes registradas",
  },
  {
    label: "Aprobadas",
    value: "—",
    icon: CheckCircle2,
    description: "Solicitudes aprobadas",
  },
  {
    label: "Pendientes",
    value: "—",
    icon: Clock,
    description: "En trámite",
  },
  {
    label: "Usuarios Activos",
    value: "—",
    icon: Users,
    description: "Usuarios del sistema",
  },
  {
    label: "Observadas",
    value: "—",
    icon: AlertTriangle,
    description: "Requieren atención",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel Principal</h1>
        <p className="text-muted-foreground">
          Resumen del estado actual del sistema de reingreso estudiantil.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-xs"
          >
            <div className="flex items-center gap-2">
              <metric.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {metric.label}
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold">{metric.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {metric.description}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-xs">
        <h2 className="mb-2 text-lg font-semibold">Bienvenido</h2>
        <p className="text-sm text-muted-foreground">
          Este es el panel de administración de Registro y Control Académico.
          Use el menú lateral para navegar entre las secciones de solicitudes,
          usuarios, reportes y auditoría.
        </p>
      </div>
    </div>
  )
}
