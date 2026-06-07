"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { PROGRAMAS } from "@/lib/constants"
import { crearSolicitud } from "@/actions/solicitudes"
import { toast } from "sonner"

export function NuevaSolicitudForm({
  periodos,
}: {
  periodos: { id: string; nombre: string }[]
}) {
  const router = useRouter()
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState("")
  const [periodo, setPeriodo] = useState("")
  const [programa, setPrograma] = useState("")

  async function handleSubmit(form: FormData) {
    setError("")
    setEnviando(true)

    try {
      await crearSolicitud({
        periodo_id: form.get("periodo_id") as string,
        programa: form.get("programa") as string,
        motivo_solicitud: form.get("motivo_solicitud") as string,
      })
      toast.success("Solicitud radicada exitosamente")
      router.replace("/dashboard/solicitudes")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear solicitud")
      setEnviando(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 rounded-lg border p-6">
      <div className="space-y-2">
        <Label htmlFor="periodo_id">Período Académico *</Label>
        <Select
          name="periodo_id"
          value={periodo}
          onValueChange={setPeriodo}
          required
        >
          <SelectTrigger id="periodo_id">
            <SelectValue placeholder="Seleccione un período" />
          </SelectTrigger>
          <SelectContent>
            {periodos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="programa">Programa Académico *</Label>
        <Select
          name="programa"
          value={programa}
          onValueChange={setPrograma}
          required
        >
          <SelectTrigger id="programa">
            <SelectValue placeholder="Seleccione su programa" />
          </SelectTrigger>
          <SelectContent>
            {PROGRAMAS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivo_solicitud">Motivo de la Solicitud *</Label>
        <Textarea
          id="motivo_solicitud"
          name="motivo_solicitud"
          required
          placeholder="Describa el motivo de su solicitud de reingreso..."
          rows={5}
        />
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={enviando || !periodo || !programa}>
          {enviando ? "Radicando..." : "Radicar Solicitud"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/solicitudes">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
