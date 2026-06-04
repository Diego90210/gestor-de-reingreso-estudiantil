"use client"

import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Eye, ChevronLeft, ChevronRight } from "lucide-react"
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
import { ESTADOS_COLOR, ESTADOS_SOLICITUD } from "@/lib/constants"
import type { SolicitudItem } from "../page"

interface SolicitudesTableProps {
  solicitudes: SolicitudItem[]
  total: number
  page: number
  totalPages: number
}

export function SolicitudesTable({
  solicitudes,
  total,
  page,
  totalPages,
}: SolicitudesTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function irPagina(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (p > 1) {
      params.set("page", String(p))
    } else {
      params.delete("page")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  if (solicitudes.length === 0) {
    return (
      <div className="mt-8 rounded-lg border p-12 text-center">
        <p className="text-muted-foreground">No se encontraron solicitudes</p>
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-36">Radicado</TableHead>
            <TableHead>Estudiante</TableHead>
            <TableHead className="hidden md:table-cell">Programa</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="hidden md:table-cell">Fecha</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {solicitudes.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-mono text-xs font-medium">
                {s.numero_radicado}
              </TableCell>
              <TableCell>
                <div className="text-sm font-medium">
                  {s.estudiante?.nombre ?? "—"} {s.estudiante?.apellido ?? ""}
                </div>
                <div className="text-xs text-muted-foreground">
                  {s.estudiante?.email ?? ""}
                </div>
              </TableCell>
              <TableCell className="hidden text-sm md:table-cell">
                {s.programa}
              </TableCell>
              <TableCell>
                <Badge
                  className={`font-medium ${ESTADOS_COLOR[s.estado]} border-0`}
                >
                  {ESTADOS_SOLICITUD.find((e) => e.value === s.estado)?.label ??
                    s.estado}
                </Badge>
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                {new Date(s.created_at).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/dashboard/solicitudes/${s.id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver detalle</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {total} solicitud{total !== 1 ? "es" : ""} — Página {page} de{" "}
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
