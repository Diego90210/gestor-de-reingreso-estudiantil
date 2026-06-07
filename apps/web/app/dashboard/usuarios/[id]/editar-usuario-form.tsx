"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { actualizarUsuario } from "@/actions/usuarios"
import { toast } from "sonner"

interface UsuarioData {
  id: string
  clerk_id: string
  email: string
  nombre: string
  apellido: string
  rol: RolSistema
  programa: string | null
  codigo_estudiante: string | null
  activo: boolean
  created_at: string
}

export function EditarUsuarioForm({ usuario }: { usuario: UsuarioData }) {
  const router = useRouter()
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState("")

  const rolesConPrograma: RolSistema[] = ["coordinador_programa", "estudiante"]

  async function handleSubmit(form: FormData) {
    setError("")
    setEnviando(true)

    try {
      const rol = form.get("rol") as RolSistema
      await actualizarUsuario(usuario.id, {
        nombre: form.get("nombre") as string,
        apellido: form.get("apellido") as string,
        email: form.get("email") as string,
        rol,
        programa: rolesConPrograma.includes(rol)
          ? (form.get("programa") as string)
          : undefined,
        codigo_estudiante:
          rol === "estudiante"
            ? (form.get("codigo_estudiante") as string)
            : undefined,
      })
      toast.success("Usuario actualizado correctamente")
      router.push("/dashboard/usuarios")
      router.refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al actualizar usuario"
      setError(msg)
      toast.error(msg)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 rounded-lg border p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            name="nombre"
            required
            defaultValue={usuario.nombre}
            placeholder="Nombres"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apellido">Apellido *</Label>
          <Input
            id="apellido"
            name="apellido"
            required
            defaultValue={usuario.apellido}
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
          defaultValue={usuario.email}
          placeholder="usuario@ejemplo.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rol">Rol *</Label>
        <Select name="rol" required defaultValue={usuario.rol}>
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
        <Select name="programa" defaultValue={usuario.programa ?? ""}>
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
          defaultValue={usuario.codigo_estudiante ?? ""}
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
          {enviando ? "Guardando..." : "Guardar Cambios"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/usuarios">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
