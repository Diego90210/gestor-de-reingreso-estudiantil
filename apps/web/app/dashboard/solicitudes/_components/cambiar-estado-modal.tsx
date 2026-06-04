"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@workspace/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { ESTADOS_SOLICITUD, ESTADOS_COLOR } from "@/lib/constants"
import type { EstadoSolicitud } from "@/lib/supabase/types"
import { cambiarEstadoSolicitud } from "@/actions/solicitudes"

interface CambiarEstadoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitudId: string
  radicado: string
  estadoActual: EstadoSolicitud
}

const ESTADOS_DESCARTADOS: EstadoSolicitud[] = ["aprobada", "rechazada"]

const TRANSICIONES: Record<EstadoSolicitud, EstadoSolicitud[]> = {
  radicada: ["en_revision", "documentacion_incompleta", "rechazada"],
  en_revision: ["en_validacion", "documentacion_incompleta", "rechazada"],
  documentacion_incompleta: ["en_revision", "rechazada"],
  en_validacion: ["en_evaluacion_academica", "observada", "rechazada"],
  observada: ["en_validacion", "rechazada"],
  en_evaluacion_academica: ["aprobada", "observada", "rechazada"],
  aprobada: [],
  rechazada: [],
}

export function CambiarEstadoModal({
  open,
  onOpenChange,
  solicitudId,
  radicado,
  estadoActual,
}: CambiarEstadoModalProps) {
  const router = useRouter()
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<
    EstadoSolicitud | ""
  >("")
  const [justificacion, setJustificacion] = useState("")
  const [error, setError] = useState("")
  const [enviando, setEnviando] = useState(false)

  if (ESTADOS_DESCARTADOS.includes(estadoActual)) return null

  const transiciones = TRANSICIONES[estadoActual] ?? []

  function resetForm() {
    setEstadoSeleccionado("")
    setJustificacion("")
    setError("")
  }

  async function handleSubmit() {
    if (!estadoSeleccionado) {
      setError("Debe seleccionar un estado")
      return
    }

    setError("")
    setEnviando(true)

    try {
      await cambiarEstadoSolicitud({
        solicitud_id: solicitudId,
        estado_nuevo: estadoSeleccionado as EstadoSolicitud,
        justificacion,
      })
      resetForm()
      onOpenChange(false)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cambiar estado")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Estado</DialogTitle>
          <DialogDescription>
            Solicitud{" "}
            <span className="font-mono font-medium text-foreground">
              {radicado}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Estado Actual</Label>
            <div
              className={`inline-block rounded-md px-2.5 py-1 text-sm font-medium ${ESTADOS_COLOR[estadoActual]} border-0`}
            >
              {ESTADOS_SOLICITUD.find((e) => e.value === estadoActual)?.label}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado-nuevo">Nuevo Estado</Label>
            <Select
              value={estadoSeleccionado}
              onValueChange={(v) => {
                setEstadoSeleccionado(v as EstadoSolicitud)
                setError("")
              }}
            >
              <SelectTrigger id="estado-nuevo">
                <SelectValue placeholder="Seleccione un estado" />
              </SelectTrigger>
              <SelectContent>
                {transiciones.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {ESTADOS_SOLICITUD.find((e) => e.value === estado)?.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="justificacion">
              Justificación{" "}
              {estadoSeleccionado &&
                ["rechazada", "observada"].includes(estadoSeleccionado) && (
                  <span className="text-destructive">*</span>
                )}
            </Label>
            <Textarea
              id="justificacion"
              placeholder={
                estadoSeleccionado &&
                ["rechazada", "observada"].includes(estadoSeleccionado)
                  ? "La justificación es obligatoria para este estado"
                  : "Justificación (opcional)"
              }
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={enviando}>
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={enviando}>
            {enviando ? "Guardando..." : "Guardar Cambio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
