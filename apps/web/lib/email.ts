import { Resend } from "resend"

const REMITENTE = "onboarding@resend.dev"

let _resend: Resend | null = null

function getResend(): Resend | null {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) {
      console.warn("[email] RESEND_API_KEY no está configurada — los emails no se enviarán")
      return null
    }
    _resend = new Resend(key)
  }
  return _resend
}

export async function enviarNotificacionCambioEstado(params: {
  emailEstudiante: string
  nombreEstudiante: string
  numeroRadicado: string
  estadoAnterior: string
  estadoNuevo: string
  justificacion?: string
}) {
  const resend = getResend()
  if (!resend) return

  const cuerpo = [
    `Estimado/a ${params.nombreEstudiante},`,
    "",
    `Le informamos que el estado de su solicitud de reingreso ${params.numeroRadicado} ha sido actualizado.`,
    "",
    `Estado anterior: ${params.estadoAnterior}`,
    `Estado nuevo: ${params.estadoNuevo}`,
    params.justificacion ? `Observación: ${params.justificacion}` : "",
    "",
    "Este mensaje fue generado automáticamente desde la plataforma de gestión de reingreso de la Universidad de Cartagena. Por favor, no responda a este correo.",
  ]
    .filter(Boolean)
    .join("\n")

  try {
    await resend.emails.send({
      from: REMITENTE,
      to: params.emailEstudiante,
      subject: `Actualización de solicitud ${params.numeroRadicado} — Universidad de Cartagena`,
      text: cuerpo,
    })
  } catch (err) {
    console.error(
      `[email] Error al notificar cambio de estado a ${params.emailEstudiante} (radicado: ${params.numeroRadicado}):`,
      err,
    )
  }
}

export async function enviarNotificacionNuevaSolicitud(params: {
  emailsRegistroControl: string[]
  nombreEstudiante: string
  programa: string
  numeroRadicado: string
  periodoNombre: string
}) {
  const resend = getResend()
  if (!resend) return

  if (params.emailsRegistroControl.length === 0) return

  const cuerpo = [
    "Se ha radicado una nueva solicitud de reingreso en la plataforma.",
    "",
    `Número de radicado: ${params.numeroRadicado}`,
    `Estudiante: ${params.nombreEstudiante}`,
    `Programa: ${params.programa}`,
    `Período: ${params.periodoNombre}`,
    "",
    "Ingrese a la plataforma para revisar la solicitud.",
    "",
    "Este mensaje fue generado automáticamente desde la plataforma de gestión de reingreso de la Universidad de Cartagena. Por favor, no responda a este correo.",
  ].join("\n")

  try {
    await Promise.all(
      params.emailsRegistroControl.map((email) =>
        resend.emails.send({
          from: REMITENTE,
          to: email,
          subject: `Nueva solicitud radicada — ${params.numeroRadicado}`,
          text: cuerpo,
        }),
      ),
    )
  } catch (err) {
    console.error(
      `[email] Error al notificar nueva solicitud ${params.numeroRadicado}:`,
      err,
    )
  }
}
