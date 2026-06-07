"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import type { AuditoriaItem } from "@/actions/auditoria"

function formatearFecha(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function AccionBadge({ accion }: { accion: string }) {
  if (accion.startsWith("SOLICITUD")) {
    const estado = accion.replace("SOLICITUD_", "").toLowerCase()
    const colors: Record<string, string> = {
      aprobada: "bg-green-100 text-green-800",
      rechazada: "bg-red-100 text-red-800",
      radicada: "bg-blue-100 text-blue-800",
      observada: "bg-orange-100 text-orange-800",
    }
    return (
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[estado] ?? "bg-gray-100 text-gray-800"}`}
      >
        {accion}
      </span>
    )
  }
  if (accion.startsWith("USER")) {
    return (
      <span className="inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
        {accion}
      </span>
    )
  }
  return (
    <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
      {accion}
    </span>
  )
}

export function AuditoriaTable({
  items,
  total,
  page,
  totalPages,
}: {
  items: AuditoriaItem[]
  total: number
  page: number
  totalPages: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function irPagina(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div>
      <div className="mb-2 text-sm text-muted-foreground">
        {total} registro{total !== 1 ? "s" : ""} encontrado
        {total !== 1 ? "s" : ""}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Actor</th>
              <th className="px-4 py-3 font-medium">Acción</th>
              <th className="px-4 py-3 font-medium">Entidad</th>
              <th className="px-4 py-3 font-medium">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground tabular-nums">
                  {formatearFecha(item.created_at)}
                </td>
                <td className="px-4 py-3">
                  {item.actor
                    ? `${item.actor.nombre} ${item.actor.apellido}`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <AccionBadge accion={item.accion} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {item.entidad}
                  {item.entidad_id && (
                    <span className="ml-1 font-mono text-xs text-muted-foreground/60">
                      ({item.entidad_id.slice(0, 8)}...)
                    </span>
                  )}
                </td>
                <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-muted-foreground">
                  {item.detalle ? JSON.stringify(item.detalle) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No se encontraron registros de auditoría con los filtros
            seleccionados.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => irPagina(1)}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => irPagina(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => irPagina(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => irPagina(totalPages)}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
