import { getUsuario } from "@/actions/usuarios"
import { EditarUsuarioForm } from "./editar-usuario-form"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarUsuarioPage({ params }: PageProps) {
  const { id } = await params

  let usuario
  try {
    usuario = await getUsuario(id)
  } catch {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/usuarios">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Editar Usuario
          </h1>
          <p className="text-sm text-muted-foreground">
            Modifique los datos del usuario en el sistema
          </p>
        </div>
      </div>

      <EditarUsuarioForm usuario={usuario} />
    </div>
  )
}
