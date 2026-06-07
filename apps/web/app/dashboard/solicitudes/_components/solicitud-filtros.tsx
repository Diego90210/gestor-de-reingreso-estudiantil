"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { ESTADOS_SOLICITUD, PROGRAMAS } from "@/lib/constants"

interface SolicitudFiltrosProps {
  q: string
  estado: string
  programa: string
  periodos: { id: string; nombre: string }[]
  rol: string
}

export function SolicitudFiltros({
  q,
  estado,
  programa,
  periodos,
  rol,
}: SolicitudFiltrosProps) {
  const esEstudiante = rol === "estudiante"
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

  const periodo = searchParams.get("periodo") ?? ""

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 md:max-w-xs">
        <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar radicado o motivo..."
          defaultValue={q}
          onBlur={(e) => actualizar("q", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              actualizar("q", e.currentTarget.value)
            }
          }}
          className="pl-8"
        />
      </div>
      <Select
        value={estado || "_"}
        onValueChange={(v) => actualizar("estado", v === "_" ? "" : v)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Todos los estados" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_">Todos los estados</SelectItem>
          {ESTADOS_SOLICITUD.map((e) => (
            <SelectItem key={e.value} value={e.value}>
              {e.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!esEstudiante && (
        <Select
          value={programa || "_"}
          onValueChange={(v) => actualizar("programa", v === "_" ? "" : v)}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Todos los programas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_">Todos los programas</SelectItem>
            {PROGRAMAS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {periodos.length > 0 && (
        <Select
          value={periodo || "_"}
          onValueChange={(v) => actualizar("periodo", v === "_" ? "" : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_">Todos los períodos</SelectItem>
            {periodos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
