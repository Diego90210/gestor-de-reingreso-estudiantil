"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import type { EstadoSolicitud } from "@/lib/supabase/types"
import { ESTADOS_SOLICITUD } from "@/lib/constants"
import { CambiarEstadoModal } from "../_components/cambiar-estado-modal"

interface SolicitudDetalleClientProps {
  solicitudId: string
  radicado: string
  estado: EstadoSolicitud
}

const ESTADOS_TERMINALES: EstadoSolicitud[] = ["aprobada", "rechazada"]

export function SolicitudDetalleClient({
  solicitudId,
  radicado,
  estado,
}: SolicitudDetalleClientProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const esTerminal = ESTADOS_TERMINALES.includes(estado)

  return (
    <>
      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-medium">Acciones</h2>
        <Button
          className="w-full"
          disabled={esTerminal}
          onClick={() => setModalOpen(true)}
        >
          {esTerminal ? "Solicitud Finalizada" : "Cambiar Estado"}
        </Button>
        {esTerminal && (
          <p className="mt-2 text-xs text-muted-foreground">
            Esta solicitud ya ha sido{" "}
            {ESTADOS_SOLICITUD.find(
              (e) => e.value === estado
            )?.label.toLowerCase()}
            .
          </p>
        )}
      </div>

      <CambiarEstadoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        solicitudId={solicitudId}
        radicado={radicado}
        estadoActual={estado}
      />
    </>
  )
}
