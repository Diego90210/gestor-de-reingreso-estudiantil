# Arquitectura del Sistema — Gestión de Reingreso Estudiantil

Universidad de Cartagena — Dashboard Administrativo (Registro y Control Académico)

---

## 1. Vista General

Sistema web para la gestión del proceso de reingreso estudiantil. Permite a estudiantes radicar solicitudes y al personal administrativo (Registro y Control) gestionarlas a través de un flujo de aprobación con cambio de estados, trazabilidad y auditoría.

```
┌──────────────┐       ┌──────────────────┐       ┌─────────────┐
│   Clerk      │◄──────│   Next.js 16     │──────►│  Supabase   │
│  (Auth)      │       │  (App Router)    │       │ (PostgreSQL)│
└──────────────┘       │                  │       └─────────────┘
        │              │  ┌────────────┐  │              │
        │              │  │Server      │  │              │
        └──────────────►  │Actions     │  │              │
                        │  └────────────┘  │              │
                        │                  │              │
                        │  ┌────────────┐  │              │
                        │  │Middleware  │  │──────────────►│
                        │  │(Clerk)     │  │              │
                        │  └────────────┘  │              │
                        │                  │              │
                        │  ┌────────────┐  │              │
                        │  │Componentes │  │              │
                        │  │RSC / Cliente│  │              │
                        │  └────────────┘  │              │
                        └──────────────────┘              │
                                                            │
                        ┌──────────────────┐               │
                        │   Supabase       │◄──────────────┘
                        │   Storage        │
                        │(documentos-pdf)  │
                        └──────────────────┘
```

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|---|----|---|
| Framework | Next.js (App Router) | 16.2.6 |
| UI Components | shadcn/ui (radix-nova) | — |
| Estilos | Tailwind CSS | v4 |
| Lenguaje | TypeScript | ^5 |
| Autenticación | Clerk (@clerk/nextjs) | ^7.4.2 |
| Base de datos | Supabase (PostgreSQL) | — |
| Cliente DB | Supabase JS Client | v2 |
| Monorepo | Turborepo | ^2.9.15 |
| Gráficos | Recharts | ^3.8.1 |
| Paquetería | npm workspaces | 11.4.1 |

---

## 3. Estructura del Monorepo

```
gestor-de-reingreso-estudiantil/
├── apps/
│   └── web/                          # Aplicación Next.js principal
│       ├── app/                      # App Router (RSC por defecto)
│       │   ├── layout.tsx            # ClerkProvider + ThemeProvider
│       │   ├── page.tsx              # Redirección según auth
│       │   ├── sign-in/              # Página de inicio de sesión (Clerk)
│       │   ├── sign-up/              # Página de registro (Clerk)
│       │   └── dashboard/            # Sección protegida
│       │       ├── layout.tsx        # Sidebar + header por rol
│       │       ├── page.tsx          # Métricas del dashboard
│       │       ├── solicitudes/      # CRUD de solicitudes
│       │       ├── usuarios/         # CRUD de usuarios
│       │       ├── reportes/         # Reportes por período
│       │       └── auditoria/        # Log de auditoría
│       ├── actions/                  # Server Actions
│       │   ├── solicitudes.ts
│       │   ├── usuarios.ts
│       │   ├── reportes.ts
│       │   ├── auditoria.ts
│       │   ├── dashboard.ts
│       │   └── documentos.ts
│       ├── components/               # Componentes cliente de la app
│       ├── lib/                      # Utilidades
│       │   ├── auth.ts               # Helper getUserProfile
│       │   ├── constants.ts          # Estados, roles, programas
│       │   ├── email.ts              # Notificaciones vía Resend
│       │   └── supabase/
│       │       ├── client.ts         # Cliente browser
│       │       ├── server.ts         # Cliente server (service role key)
│       │       ├── keys.ts           # Lectura de env vars
│       │       └── types.ts          # Tipos Database generados manualmente
│       └── middleware.ts             # Clerk middleware + verificación rol
│
├── packages/
│   ├── ui/                           # Shared UI components (shadcn/ui)
│   │   └── src/
│   │       ├── components/           # button, dialog, table, etc.
│   │       ├── styles/globals.css    # Tailwind v4 + theme tokens
│   │       └── lib/utils.ts         # cn() helper
│   ├── eslint-config/                # ESLint compartido
│   └── typescript-config/            # tsconfig bases
│
├── plan_desarrollo.md                # Plan de desarrollo completo
├── turbo.json                        # Pipeline de tareas
└── package.json                      # Raíz del monorepo
```

---

## 4. Modelo de Datos

### 4.1 Enumeraciones

- **`rol_sistema`**: `registro_control`, `auxiliar_administrativo`, `centro_admisiones`, `coordinador_programa`, `estudiante`
- **`estado_solicitud`**: `radicada`, `en_revision`, `documentacion_incompleta`, `en_validacion`, `observada`, `en_evaluacion_academica`, `aprobada`, `rechazada`

### 4.2 Tablas

| Tabla | Propósito | FK |
|---|---|---|
| `profiles` | Extensión de usuarios Clerk | — |
| `periodos_academicos` | Períodos académicos | — |
| `solicitudes` | Solicitudes de reingreso | `estudiante_id → profiles`, `periodo_id → periodos_academicos` |
| `documentos_solicitud` | Documentos adjuntos | `solicitud_id → solicitudes` (CASCADE) |
| `historial_estados` | Trazabilidad de cambios de estado (append-only) | `solicitud_id → solicitudes`, `actor_id → profiles` |
| `audit_log` | Auditoría general del sistema | `actor_id → profiles` |

### 4.3 Trigger

- **`generar_radicado()`**: Genera `numero_radicado` con formato `REI-YYYY-NNNN` usando una secuencia de PostgreSQL (`radicado_seq`).

### 4.4 RLS

- `registro_control` tiene acceso total (SELECT, INSERT, UPDATE, DELETE) a todas las tablas.
- Los demás roles solo ven sus propios datos.
- `historial_estados` es append-only desde Server Action (no trigger).

---

## 5. Flujo de Datos

### 5.1 Autenticación y Autorización

```
1. Clerk maneja el sign-in/sign-up en rutas públicas
2. middleware.ts protege /dashboard/* y bloquea estudiantes de rutas admin
3. getUserProfile() obtiene el perfil desde Supabase usando clerk_id
4. dashboard/layout.tsx renderiza navegación según el rol
```

### 5.2 Server Actions (Operaciones de escritura)

Todas las mutaciones se ejecutan como **Server Actions de Next.js**:

```
Cliente (form) ──► Server Action ──► Validación (Zod o manual)
                                    ──► Auth check (getUserProfile)
                                    ──► Supabase write
                                    ──► Clerk API (si aplica)
                                    ──► audit_log INSERT
                                    ──► Notificación email (opcional, no crítica)
                                    ──► Respuesta { success: true }
```

### 5.3 Flujo de Solicitudes

```
Estudiante radica solicitud
        │
        ▼
┌─ Radicada ─┐
│             │
▼             ▼
En Revisión   (trigger automático)
│
▼
Documentación Incompleta ◄──► En Validación
│
▼
En Evaluación Académica
│
┌──────────┴──────────┐
▼                     ▼
Aprobada              Rechazada / Observada
```

Cada cambio de estado ejecuta:
1. `UPDATE solicitudes SET estado = ...`
2. `INSERT INTO historial_estados` (con actor_id, justificación)
3. `INSERT INTO audit_log`

---

## 6. Patrón de Componentes

### 6.1 Server Components (RSC) — Por defecto

- Páginas (`app/dashboard/**/page.tsx`)
- Layouts (`layout.tsx`)
- Fetching de datos directo en el componente

```typescript
// app/dashboard/solicitudes/page.tsx
export default async function SolicitudesPage({ searchParams }) {
  const data = await fetchData()  // server-side
  return <SolicitudesTable solicitudes={data} />
}
```

### 6.2 Client Components

- Componentes con interactividad (`"use client"`)
- Formularios, modales, filtros, tablas con acciones
- Ubicados en carpetas `_components/` junto a su página

### 6.3 UI Components (Compartidos)

- En `packages/ui/src/components/` (shadcn/ui)
- Importados como `@workspace/ui/components/<name>`

---

## 7. Seguridad

| Aspecto | Implementación |
|---|---|
| Autenticación | Clerk (JWT, sesión) |
| Protección de rutas | `middleware.ts` con `clerkMiddleware` |
| Autorización por rol | Verificación en Server Actions + layout |
| RLS en base de datos | Políticas por rol en Supabase |
| Service role key | Solo en server (`SUPABASE_SERVICE_ROLE_KEY`) |
| Supabase Storage | Bucket privado `documentos-solicitudes` (PDF, JPG, PNG, ≤5MB) |
| Validación de formularios | Server-side en Server Actions |
| XSS/CSRF | Next.js Server Actions con Action ID |

---

## 8. Variables de Entorno

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEYS={"publica":"..."}
SUPABASE_SECRET_KEYS={"secreta":"..."}
```

---

## 9. Pipeline de Build (Turborepo)

```
turbo.json:
  build → dependsOn: ^build  (build ui primero, luego web)
  lint  → dependsOn: ^lint
  typecheck → dependsOn: ^typecheck
  format → dependsOn: ^format
  dev    → persistent, sin caché
```

Orden recomendado: `format → lint → typecheck → build`

---

## 10. Convenciones de Código

- **Sin punto y coma** (`semi: false`)
- **Comillas dobles** (`singleQuote: false`)
- Trailing commas estilo ES5
- Print width: 80
- Tailwind class sorting con `prettier-plugin-tailwindcss`
- Todo en **español** (código, SQL, UI, comentarios, nombres)
- ESLint en modo warning (`eslint-plugin-only-warn`)

---

## 11. Decisiones Arquitectónicas Clave

| Decisión | Opción elegida | Justificación |
|---|---|---|
| Sincronización Clerk → Supabase | Server Action directa | Simplicidad; webhook opcional para futura iteración |
| Paginación | Server-side con `.range()` | Escalable para miles de registros |
| Notificaciones | Email vía Resend (no crítico) | Fallo no revierte la operación |
| Manejo de errores | throw desde Server Action + toast en cliente | Responde con `{ success: true }` o lanza error |
| `historial_estados` | Desde Server Action (no trigger) | Garantiza `actor_id` correcto desde sesión Clerk |
| Tailwind v4 | `@theme inline` en CSS | Sin archivo `tailwind.config.*` |
