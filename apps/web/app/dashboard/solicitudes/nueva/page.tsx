import { getPeriodosActivos } from "@/actions/solicitudes"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { NuevaSolicitudForm } from "./nueva-solicitud-form"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/auth"

export default async function NuevaSolicitudPage() {
  const profile = await getUserProfile()
  if (profile?.rol !== "estudiante") redirect("/dashboard/no-autorizado")

  const periodos = await getPeriodosActivos()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/solicitudes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Nueva Solicitud de Reingreso
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete el formulario para radicar una nueva solicitud
          </p>
        </div>
      </div>

      <NuevaSolicitudForm periodos={periodos} />
    </div>
  )
}
