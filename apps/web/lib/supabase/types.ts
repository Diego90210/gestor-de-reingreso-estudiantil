export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type RolSistema =
  | "registro_control"
  | "auxiliar_administrativo"
  | "centro_admisiones"
  | "coordinador_programa"
  | "estudiante"

export type EstadoSolicitud =
  | "radicada"
  | "en_revision"
  | "documentacion_incompleta"
  | "en_validacion"
  | "observada"
  | "en_evaluacion_academica"
  | "aprobada"
  | "rechazada"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          clerk_id: string
          email: string
          nombre: string
          apellido: string
          rol: RolSistema
          programa: string | null
          codigo_estudiante: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          email: string
          nombre: string
          apellido: string
          rol: RolSistema
          programa?: string | null
          codigo_estudiante?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string
          nombre?: string
          apellido?: string
          rol?: RolSistema
          programa?: string | null
          codigo_estudiante?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      periodos_academicos: {
        Row: {
          id: string
          nombre: string
          fecha_inicio: string
          fecha_fin: string
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          fecha_inicio: string
          fecha_fin: string
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          fecha_inicio?: string
          fecha_fin?: string
          activo?: boolean
          created_at?: string
        }
      }
      solicitudes: {
        Row: {
          id: string
          numero_radicado: string
          estudiante_id: string
          periodo_id: string
          programa: string
          estado: EstadoSolicitud
          motivo_solicitud: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          numero_radicado?: string
          estudiante_id: string
          periodo_id: string
          programa: string
          estado?: EstadoSolicitud
          motivo_solicitud: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          numero_radicado?: string
          estudiante_id?: string
          periodo_id?: string
          programa?: string
          estado?: EstadoSolicitud
          motivo_solicitud?: string
          created_at?: string
          updated_at?: string
        }
      }
      documentos_solicitud: {
        Row: {
          id: string
          solicitud_id: string
          tipo: string
          url: string
          nombre_archivo: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          solicitud_id: string
          tipo: string
          url: string
          nombre_archivo: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          solicitud_id?: string
          tipo?: string
          url?: string
          nombre_archivo?: string
          uploaded_at?: string
        }
      }
      historial_estados: {
        Row: {
          id: string
          solicitud_id: string
          estado_anterior: EstadoSolicitud | null
          estado_nuevo: EstadoSolicitud
          actor_id: string
          justificacion: string | null
          created_at: string
        }
        Insert: {
          id?: string
          solicitud_id: string
          estado_anterior?: EstadoSolicitud | null
          estado_nuevo: EstadoSolicitud
          actor_id: string
          justificacion?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          solicitud_id?: string
          estado_anterior?: EstadoSolicitud | null
          estado_nuevo?: EstadoSolicitud
          actor_id?: string
          justificacion?: string | null
          created_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          actor_id: string | null
          accion: string
          entidad: string
          entidad_id: string | null
          detalle: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          accion: string
          entidad: string
          entidad_id?: string | null
          detalle?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          accion?: string
          entidad?: string
          entidad_id?: string | null
          detalle?: Json | null
          created_at?: string
        }
      }
    }
    Enums: {
      rol_sistema: RolSistema
      estado_solicitud: EstadoSolicitud
    }
  }
}
