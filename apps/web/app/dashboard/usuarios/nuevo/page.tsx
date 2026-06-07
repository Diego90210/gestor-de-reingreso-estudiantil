"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { ROLES_USUARIO, PROGRAMAS } from "@/lib/constants"
import type { RolSistema } from "@/lib/supabase/types"
import { crearUsuario } from "@/actions/usuarios"
import { toast } from "sonner"

export default function NuevoUsuarioPage() {
  const router = useRouter()
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState("")

  const rolesConPrograma: RolSistema[] = ["coordinador_programa", "estudiante"]

  async function handleSubmit(form: FormData) {
    setError("")
    setEnviando(true)

    try {
      const rol = form.get("rol") as RolSistema
      await crearUsuario({
        email: form.get("email") as string,
        nombre: form.get("nombre") as string,
        apellido: form.get("apellido") as string,
        rol,
        programa: rolesConPrograma.includes(rol)
          ? (form.get("programa") as string)
          : undefined,
        codigo_estudiante:
          rol === "estudiante"
            ? (form.get("codigo_estudiante") as string)
            : undefined,
      })
      toast.success("Usuario creado correctamente")
      router.push("/dashboard/usuarios")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al crear usuario"
      setError(msg)
      toast.error(msg)
    } finally {
      setEnviando(false)
    }
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
            Nuevo Usuario
          </h1>
          <p className="text-sm text-muted-foreground">
            Cree un nuevo usuario en el sistema
          </p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-6 rounded-lg border p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input id="nombre" name="nombre" required placeholder="Nombres" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellido">Apellido *</Label>
            <Input
              id="apellido"
              name="apellido"
              required
              placeholder="Apellidos"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="usuario@ejemplo.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rol">Rol *</Label>
          <Select name="rol" required>
            <SelectTrigger id="rol">
              <SelectValue placeholder="Seleccione un rol" />
            </SelectTrigger>
            <SelectContent>
              {ROLES_USUARIO.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="programa">Programa</Label>
          <Select name="programa">
            <SelectTrigger id="programa">
              <SelectValue placeholder="Seleccione un programa (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {PROGRAMAS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Requerido para roles Coordinador de Programa y Estudiante
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="codigo_estudiante">Código de Estudiante</Label>
          <Input
            id="codigo_estudiante"
            name="codigo_estudiante"
            placeholder="Ej: 2020123456"
          />
          <p className="text-xs text-muted-foreground">
            Solo aplica para el rol Estudiante
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={enviando}>
            {enviando ? "Creando..." : "Crear Usuario"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/usuarios">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
