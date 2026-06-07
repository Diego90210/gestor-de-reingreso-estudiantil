"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

interface ActorOption {
  id: string
  nombre: string
}

export function AuditoriaFiltros({
  actor_id,
  accion,
  desde,
  hasta,
  actores,
  acciones,
}: {
  actor_id: string
  accion: string
  desde: string
  hasta: string
  actores: ActorOption[]
  acciones: string[]
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
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Actor
        </label>
        <Select
          value={actor_id || "_"}
          onValueChange={(v) => actualizar("actor_id", v === "_" ? "" : v)}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Todos los actores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_">Todos los actores</SelectItem>
            {actores.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Acción
        </label>
        <Select
          value={accion || "_"}
          onValueChange={(v) => actualizar("accion", v === "_" ? "" : v)}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Todas las acciones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_">Todas las acciones</SelectItem>
            {acciones.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Desde
        </label>
        <div className="relative">
          <CalendarIcon className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="date"
            defaultValue={desde}
            onBlur={(e) => actualizar("desde", e.target.value)}
            className="w-44 pl-8"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Hasta
        </label>
        <div className="relative">
          <CalendarIcon className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="date"
            defaultValue={hasta}
            onBlur={(e) => actualizar("hasta", e.target.value)}
            className="w-44 pl-8"
          />
        </div>
      </div>
    </div>
  )
}
