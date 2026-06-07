"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Ban,
  CheckCircle,
  Pencil,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { ROLES_USUARIO } from "@/lib/constants"
import type { RolSistema } from "@/lib/supabase/types"
import { desactivarUsuario, reactivarUsuario } from "@/actions/usuarios"
import { toast } from "sonner"

type UsuarioRow = {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: RolSistema
  programa: string | null
  codigo_estudiante: string | null
  activo: boolean
  created_at: string
}

interface UsuariosTableProps {
  usuarios: UsuarioRow[]
  total: number
  page: number
  totalPages: number
}

export function UsuariosTable({
  usuarios,
  total,
  page,
  totalPages,
}: UsuariosTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  function irPagina(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (p > 1) {
      params.set("page", String(p))
    } else {
      params.delete("page")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  async function toggleActivo(usuario: UsuarioRow) {
    startTransition(async () => {
      try {
        if (usuario.activo) {
          await desactivarUsuario(usuario.id)
        } else {
          await reactivarUsuario(usuario.id)
        }
        toast.success(
          usuario.activo
            ? "Usuario desactivado correctamente"
            : "Usuario reactivado correctamente",
        )
        router.refresh()
      } catch {
        toast.error("Error al cambiar estado del usuario")
      }
    })
  }

  if (usuarios.length === 0) {
    return (
      <div className="mt-8 rounded-lg border p-12 text-center">
        <p className="text-muted-foreground">No se encontraron usuarios</p>
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="hidden md:table-cell">Rol</TableHead>
            <TableHead className="hidden md:table-cell">Programa</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-24" />
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((u) => (
            <TableRow key={u.id} className={u.activo ? "" : "opacity-60"}>
              <TableCell>
                <div className="text-sm font-medium">
                  {u.nombre} {u.apellido}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {u.email}
              </TableCell>
              <TableCell className="hidden text-sm md:table-cell">
                {ROLES_USUARIO.find((r) => r.value === u.rol)?.label ?? u.rol}
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                {u.programa ?? "—"}
              </TableCell>
              <TableCell>
                <Badge
                  className={`border-0 font-medium ${
                    u.activo
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {u.activo ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" asChild>
                  <Link
                    href={`/dashboard/usuarios/${u.id}`}
                    title="Editar usuario"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Link>
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={pending}
                  onClick={() => toggleActivo(u)}
                  title={u.activo ? "Desactivar usuario" : "Reactivar usuario"}
                >
                  {u.activo ? (
                    <Ban className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <span className="sr-only">
                    {u.activo ? "Desactivar" : "Reactivar"}
                  </span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {total} usuario{total !== 1 ? "s" : ""} — Página {page} de{" "}
            {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => irPagina(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => irPagina(page + 1)}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
