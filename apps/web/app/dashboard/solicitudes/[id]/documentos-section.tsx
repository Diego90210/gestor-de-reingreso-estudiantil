"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, ExternalLink, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  getSignedUploadUrl,
  confirmarDocumento,
  getDocumentoDownloadUrl,
} from "@/actions/documentos"

type Documento = {
  id: string
  solicitud_id: string
  tipo: string
  url: string
  nombre_archivo: string
  uploaded_at: string
}

const TIPOS_DOCUMENTO = [
  { value: "paz_salvo_financiero", label: "Paz y Salvo Financiero" },
  { value: "paz_salvo_biblioteca", label: "Paz y Salvo Biblioteca" },
  { value: "formato_casos_academicos", label: "Formato Casos Académicos" },
]

export function DocumentosSection({
  solicitudId,
  documentos,
  rol,
}: {
  solicitudId: string
  documentos: Documento[]
  rol: string
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [tipoDoc, setTipoDoc] = useState("")
  const [descargando, setDescargando] = useState<Record<string, boolean>>({})

  const esEstudiante = rol === "estudiante"

  async function handleUpload(file: File) {
    if (!tipoDoc || !file) return

    setSubiendo(true)
    try {
      const { signedUrl, path } = await getSignedUploadUrl(
        solicitudId,
        file.name
      )

      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })

      if (!uploadRes.ok) throw new Error("Error al subir archivo")

      await confirmarDocumento(solicitudId, tipoDoc, path, file.name)

      setTipoDoc("")
      if (fileInputRef.current) fileInputRef.current.value = ""
      toast.success("Documento subido correctamente")
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al subir documento")
    } finally {
      setSubiendo(false)
    }
  }

  async function handleDownload(doc: Documento) {
    setDescargando((prev) => ({ ...prev, [doc.id]: true }))
    try {
      const url = await getDocumentoDownloadUrl(doc.url)
      window.open(url, "_blank")
    } catch {
      // silent
    } finally {
      setDescargando((prev) => ({ ...prev, [doc.id]: false }))
    }
  }

  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-lg font-medium">Documentos</h2>

      {documentos.length === 0 ? (
        <p className="mb-4 text-sm text-muted-foreground">
          No hay documentos adjuntos
        </p>
      ) : (
        <ul className="mb-4 space-y-2 text-sm">
          {documentos.map((d) => {
            const tipoLabel =
              TIPOS_DOCUMENTO.find((t) => t.value === d.tipo)?.label ?? d.tipo
            return (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{d.nombre_archivo}</p>
                  <p className="text-xs text-muted-foreground">{tipoLabel}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={descargando[d.id]}
                    onClick={() => handleDownload(d)}
                  >
                    {descargando[d.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {esEstudiante && (
        <div className="space-y-3 border-t pt-4">
          <h3 className="text-sm font-medium">Subir Documento</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={tipoDoc} onValueChange={setTipoDoc}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_DOCUMENTO.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file)
              }}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={!tipoDoc || subiendo}
              onClick={() => fileInputRef.current?.click()}
            >
              {subiendo ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-1 h-4 w-4" />
              )}
              {subiendo ? "Subiendo..." : "Seleccionar archivo"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
