"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, Plus } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import { ROLES_USUARIO } from "@/lib/constants"

export function UsuarioFiltros({
  search,
  rol,
  activo,
}: {
  search: string
  rol: string
  activo: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function actualizar(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== "page") {
      params.delete("page")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 md:max-w-xs">
        <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar nombre, apellido o email..."
          defaultValue={search}
          onBlur={(e) => actualizar("search", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              actualizar("search", e.currentTarget.value)
            }
          }}
          className="pl-8"
        />
      </div>
      <Select
        value={rol || "_"}
        onValueChange={(v) => actualizar("rol", v === "_" ? "" : v)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Todos los roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_">Todos los roles</SelectItem>
          {ROLES_USUARIO.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={activo || "_"}
        onValueChange={(v) => actualizar("activo", v === "_" ? "" : v)}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_">Todos</SelectItem>
          <SelectItem value="si">Activos</SelectItem>
          <SelectItem value="no">Inactivos</SelectItem>
        </SelectContent>
      </Select>
      <Button asChild className="ml-auto">
        <Link href="/dashboard/usuarios/nuevo">
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Link>
      </Button>
    </div>
  )
}
