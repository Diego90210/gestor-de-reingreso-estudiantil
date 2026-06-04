import type { EstadoSolicitud, RolSistema } from "@/lib/supabase/types"

export const ESTADOS_SOLICITUD: { value: EstadoSolicitud; label: string }[] = [
  { value: "radicada", label: "Radicada" },
  { value: "en_revision", label: "En Revisión" },
  { value: "documentacion_incompleta", label: "Documentación Incompleta" },
  { value: "en_validacion", label: "En Validación" },
  { value: "observada", label: "Observada" },
  { value: "en_evaluacion_academica", label: "En Evaluación Académica" },
  { value: "aprobada", label: "Aprobada" },
  { value: "rechazada", label: "Rechazada" },
]

export const ROLES_USUARIO: { value: RolSistema; label: string }[] = [
  { value: "registro_control", label: "Registro y Control Académico" },
  { value: "auxiliar_administrativo", label: "Auxiliar Administrativo" },
  { value: "centro_admisiones", label: "Centro de Admisiones" },
  { value: "coordinador_programa", label: "Coordinador de Programa" },
  { value: "estudiante", label: "Estudiante" },
]

export const ESTADOS_COLOR: Record<EstadoSolicitud, string> = {
  radicada: "bg-blue-100 text-blue-800",
  en_revision: "bg-yellow-100 text-yellow-800",
  documentacion_incompleta: "bg-orange-100 text-orange-800",
  en_validacion: "bg-purple-100 text-purple-800",
  observada: "bg-red-100 text-red-800",
  en_evaluacion_academica: "bg-indigo-100 text-indigo-800",
  aprobada: "bg-green-100 text-green-800",
  rechazada: "bg-gray-100 text-gray-800",
}

export const PROGRAMAS = [
  "Ingeniería de Sistemas",
  "Derecho",
  "Medicina",
  "Administración de Empresas",
  "Contaduría Pública",
  "Arquitectura",
  "Ingeniería Civil",
  "Psicología",
  "Enfermería",
  "Odontología",
]

export const ITEMS_POR_PAGINA = 20
