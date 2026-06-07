import {
  FileText,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react"
import {
  getDashboardMetrics,
  getStudentDashboardMetrics,
} from "@/actions/dashboard"
import { getUserProfile } from "@/lib/auth"
import { ESTADOS_COLOR, ESTADOS_SOLICITUD } from "@/lib/constants"

export default async function DashboardPage() {
  const profile = await getUserProfile()

  if (profile?.rol === "estudiante") {
    return <StudentDashboard profileId={profile.id} />
  }

  return <AdminDashboard />
}

async function AdminDashboard() {
  const metrics = await getDashboardMetrics()

  const cards = [
    {
      label: "Total Solicitudes",
      value: metrics.totalSolicitudes,
      icon: FileText,
      description: "Solicitudes registradas",
    },
    {
      label: "Aprobadas",
      value: metrics.aprobadas,
      icon: CheckCircle2,
      description: "Solicitudes aprobadas",
    },
    {
      label: "Pendientes",
      value: metrics.pendientes,
      icon: Clock,
      description: "En trámite",
    },
    {
      label: "Usuarios Activos",
      value: metrics.usuariosActivos,
      icon: Users,
      description: "Usuarios del sistema",
    },
    {
      label: "Observadas",
      value: metrics.observadas,
      icon: AlertTriangle,
      description: "Requieren atención",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel Principal</h1>
        <p className="text-muted-foreground">
          Resumen del estado actual del sistema de reingreso estudiantil.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-xs"
          >
            <div className="flex items-center gap-2">
              <card.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {card.label}
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {metrics.ultimasSolicitudes.length > 0 && (
        <UltimasSolicitudesTable solicitudes={metrics.ultimasSolicitudes} />
      )}

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

async function StudentDashboard({ profileId }: { profileId: string }) {
  const metrics = await getStudentDashboardMetrics(profileId)

  const cards = [
    {
      label: "Total Enviadas",
      value: metrics.totalSolicitudes,
      icon: FileText,
      description: "Solicitudes enviadas",
    },
    {
      label: "Aprobadas",
      value: metrics.aprobadas,
      icon: CheckCircle2,
      description: "Solicitudes aprobadas",
    },
    {
      label: "Pendientes",
      value: metrics.pendientes,
      icon: Clock,
      description: "En trámite",
    },
    {
      label: "Observadas",
      value: metrics.observadas,
      icon: AlertTriangle,
      description: "Requieren atención",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis Solicitudes</h1>
        <p className="text-muted-foreground">
          Resumen de tus solicitudes de reingreso estudiantil.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-xs"
          >
            <div className="flex items-center gap-2">
              <card.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {card.label}
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {metrics.ultimasSolicitudes.length > 0 && (
        <UltimasSolicitudesTable solicitudes={metrics.ultimasSolicitudes} />
      )}

      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-xs">
        <h2 className="mb-2 text-lg font-semibold">Bienvenido</h2>
        <p className="text-sm text-muted-foreground">
          Aquí puedes consultar el estado de tus solicitudes de reingreso y
          gestionar los documentos adjuntos.
        </p>
      </div>
    </div>
  )
}

function UltimasSolicitudesTable({
  solicitudes,
}: {
  solicitudes: {
    id: string
    numero_radicado: string
    estado: string
    programa: string
    created_at: string
  }[]
}) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-xs">
      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold">Últimas Solicitudes</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th className="px-6 py-3">Radicado</th>
              <th className="px-6 py-3">Programa</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Creada</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((s) => {
              const estadoLabel =
                ESTADOS_SOLICITUD.find((e) => e.value === s.estado)?.label ??
                s.estado
              const colorClass =
                ESTADOS_COLOR[s.estado as keyof typeof ESTADOS_COLOR] ?? ""
              return (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="px-6 py-3 font-medium">{s.numero_radicado}</td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {s.programa}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
                    >
                      {estadoLabel}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
