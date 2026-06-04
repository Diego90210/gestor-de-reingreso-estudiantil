import { ShieldAlert } from "lucide-react"
import Link from "next/link"

export default function NoAutorizadoPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Sin autorización
        </h1>
        <p className="mt-2 text-muted-foreground">
          No tienes permisos suficientes para acceder a esta sección. Si crees
          que esto es un error, contacta al administrador del sistema.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
