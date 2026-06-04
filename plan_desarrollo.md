# Plan de Desarrollo — Dashboard Administrador (Registro y Control Académico)
## Sistema de Gestión de Reingreso Estudiantil — Universidad de Cartagena

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend + Backend | Next.js 14 (App Router) |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Clerk |
| Estilos | Tailwind CSS + shadcn/ui |
| ORM / cliente DB | Supabase JS Client v2 |
| Despliegue | Vercel |

---

## Alcance de esta entrega

El dashboard de **Registro y Control Académico** es el único rol con interfaz en esta versión. Sin embargo, todas las operaciones de base de datos del sistema completo deben estar implementadas: las tablas, relaciones, RLS policies y funciones de auditoría deben existir aunque los otros roles no tengan vistas todavía.

### Funcionalidades del dashboard (Registro y Control Académico)

- Ver todas las solicitudes de reingreso con filtros por estado, programa y período académico
- Cambiar el estado de una solicitud (aprobar, rechazar, observar) con justificación obligatoria
- Ver el expediente completo de cada solicitud (documentos adjuntos, historial de estados)
- CRUD completo de usuarios del sistema y asignación de roles
- Generar reportes por período académico (aprobadas, rechazadas, en trámite, tiempos promedio)
- Ver el log de auditoría: quién hizo qué y cuándo

---

## Esquema de base de datos

Ejecutar en el SQL Editor de Supabase en este orden exacto.

### 1. Enumeraciones

```sql
CREATE TYPE rol_sistema AS ENUM (
  'registro_control',
  'auxiliar_administrativo',
  'centro_admisiones',
  'coordinador_programa',
  'estudiante'
);

CREATE TYPE estado_solicitud AS ENUM (
  'radicada',
  'en_revision',
  'documentacion_incompleta',
  'en_validacion',
  'observada',
  'en_evaluacion_academica',
  'aprobada',
  'rechazada'
);
```

### 2. Tabla `profiles`
Extiende los usuarios de Clerk. Un registro por cada usuario del sistema.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  rol rol_sistema NOT NULL,
  programa TEXT,                        -- solo aplica para coordinador_programa y estudiante
  codigo_estudiante TEXT,               -- solo aplica para estudiante
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3. Tabla `periodos_academicos`

```sql
CREATE TABLE periodos_academicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,                 -- ej: "2024-2", "2025-1"
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4. Tabla `solicitudes`

```sql
CREATE TABLE solicitudes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_radicado TEXT UNIQUE NOT NULL, -- generado automáticamente, ej: REI-2025-0001
  estudiante_id UUID NOT NULL REFERENCES profiles(id),
  periodo_id UUID NOT NULL REFERENCES periodos_academicos(id),
  programa TEXT NOT NULL,
  estado estado_solicitud NOT NULL DEFAULT 'radicada',
  motivo_solicitud TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 5. Tabla `documentos_solicitud`

```sql
CREATE TABLE documentos_solicitud (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,                   -- 'paz_salvo_financiero' | 'paz_salvo_biblioteca' | 'formato_casos_academicos'
  url TEXT NOT NULL,                    -- ruta en Supabase Storage
  nombre_archivo TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 6. Tabla `historial_estados`
Cada vez que una solicitud cambia de estado se inserta un registro aquí. No se actualiza, solo se inserta.

```sql
CREATE TABLE historial_estados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  estado_anterior estado_solicitud,
  estado_nuevo estado_solicitud NOT NULL,
  actor_id UUID NOT NULL REFERENCES profiles(id),  -- quién hizo el cambio
  justificacion TEXT,                               -- obligatorio para rechazada/observada
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 7. Tabla `audit_log`
Registro general de acciones del sistema, separado del historial de solicitudes.

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  accion TEXT NOT NULL,                 -- ej: 'USER_CREATED', 'SOLICITUD_APROBADA'
  entidad TEXT NOT NULL,                -- ej: 'solicitudes', 'profiles'
  entidad_id UUID,
  detalle JSONB,                        -- payload opcional con contexto adicional
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 8. Función para generar número de radicado

```sql
CREATE OR REPLACE FUNCTION generar_radicado()
RETURNS TRIGGER AS $$
DECLARE
  anio TEXT;
  correlativo TEXT;
BEGIN
  anio := TO_CHAR(NOW(), 'YYYY');
  SELECT LPAD(
    (COUNT(*) + 1)::TEXT, 4, '0'
  ) INTO correlativo
  FROM solicitudes
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

  NEW.numero_radicado := 'REI-' || anio || '-' || correlativo;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_radicado
BEFORE INSERT ON solicitudes
FOR EACH ROW
WHEN (NEW.numero_radicado IS NULL OR NEW.numero_radicado = '')
EXECUTE FUNCTION generar_radicado();
```

### 9. Función para registrar historial automáticamente

```sql
CREATE OR REPLACE FUNCTION registrar_cambio_estado()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO historial_estados (
      solicitud_id, estado_anterior, estado_nuevo, actor_id
    ) VALUES (
      NEW.id, OLD.estado, NEW.estado,
      (SELECT id FROM profiles WHERE clerk_id = auth.uid()::TEXT LIMIT 1)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_historial_estado
AFTER UPDATE ON solicitudes
FOR EACH ROW
EXECUTE FUNCTION registrar_cambio_estado();
```

### 10. Row Level Security (RLS)

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_solicitud ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE periodos_academicos ENABLE ROW LEVEL SECURITY;

-- registro_control puede leer y escribir todo
CREATE POLICY "registro_control_full_access" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.clerk_id = auth.uid()::TEXT
      AND p.rol = 'registro_control'
    )
  );

-- Aplicar la misma lógica a las demás tablas (repetir para cada una)
CREATE POLICY "registro_control_full_access" ON solicitudes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.clerk_id = auth.uid()::TEXT
      AND p.rol = 'registro_control'
    )
  );

-- Los demás roles solo leen lo que les corresponde (implementar por sprint)
```

### 11. Storage bucket

Crear en el dashboard de Supabase → Storage:
- Bucket name: `documentos-solicitudes`
- Public: **No**
- Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`
- Max file size: 5MB

---

## Estructura de archivos Next.js

```
src/
├── app/
│   ├── layout.tsx                         # ClerkProvider aquí
│   ├── page.tsx                           # redirect a /dashboard si auth, sino /sign-in
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   └── dashboard/
│       ├── layout.tsx                     # sidebar + header, protegido por rol
│       ├── page.tsx                       # overview con métricas
│       ├── solicitudes/
│       │   ├── page.tsx                   # tabla con filtros
│       │   └── [id]/
│       │       └── page.tsx               # expediente + cambio de estado
│       ├── usuarios/
│       │   ├── page.tsx                   # tabla de usuarios
│       │   └── nuevo/
│       │       └── page.tsx               # formulario crear usuario
│       ├── reportes/
│       │   └── page.tsx                   # reportes por período
│       └── auditoria/
│           └── page.tsx                   # log de auditoría
├── components/
│   ├── ui/                                # shadcn/ui components
│   ├── solicitudes/
│   │   ├── SolicitudesTable.tsx
│   │   ├── SolicitudFiltros.tsx
│   │   ├── SolicitudDetalle.tsx
│   │   └── CambiarEstadoModal.tsx
│   ├── usuarios/
│   │   ├── UsuariosTable.tsx
│   │   └── UsuarioForm.tsx
│   └── reportes/
│       └── ReportePeriodo.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                      # cliente browser
│   │   └── server.ts                      # cliente server (Server Components)
│   └── constants.ts                       # estados, roles, etiquetas
├── actions/                               # Server Actions de Next.js
│   ├── solicitudes.ts
│   ├── usuarios.ts
│   └── reportes.ts
└── middleware.ts                          # Clerk auth middleware
```

---

## Variables de entorno

Crear `.env.local` en la raíz del proyecto:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # solo en server, nunca exponer al cliente
```

---

## Implementación por módulo

### Módulo 1 — Setup base y autenticación

**Objetivo:** Next.js corriendo con Clerk y Supabase conectados. Un usuario de prueba con rol `registro_control` puede iniciar sesión y ver el dashboard vacío.

**Pasos:**
1. `npx create-next-app@latest reingreso --typescript --tailwind --app`
2. `npm install @clerk/nextjs @supabase/supabase-js`
3. `npx shadcn@latest init`
4. Configurar `middleware.ts` de Clerk para proteger `/dashboard/*`
5. Crear `src/lib/supabase/server.ts` y `client.ts`
6. Correr el SQL completo del esquema en Supabase
7. Insertar un profile de prueba con rol `registro_control`
8. Verificar que `/dashboard` redirige al login si no hay sesión activa

**Criterio de aceptación:** Usuario con rol `registro_control` puede iniciar sesión y ver `/dashboard`. Cualquier otro path sin sesión redirige a `/sign-in`.

---

### Módulo 2 — Gestión de solicitudes (lectura)

**Objetivo:** Tabla de solicitudes funcional con filtros. El administrador puede ver todas las solicitudes existentes.

**Server Action — `actions/solicitudes.ts`:**

```typescript
// obtener solicitudes con filtros
export async function getSolicitudes(filtros: {
  estado?: string
  programa?: string
  periodo_id?: string
  page?: number
}) {
  const supabase = createServerClient()
  let query = supabase
    .from('solicitudes')
    .select(`
      *,
      estudiante:profiles!estudiante_id(nombre, apellido, codigo_estudiante),
      periodo:periodos_academicos(nombre)
    `)
    .order('created_at', { ascending: false })

  if (filtros.estado) query = query.eq('estado', filtros.estado)
  if (filtros.programa) query = query.eq('programa', filtros.programa)
  if (filtros.periodo_id) query = query.eq('periodo_id', filtros.periodo_id)

  const { data, error, count } = await query
    .range((filtros.page ?? 0) * 20, ((filtros.page ?? 0) + 1) * 20 - 1)

  if (error) throw error
  return { solicitudes: data, total: count }
}
```

**Criterio de aceptación:** La tabla muestra solicitudes paginadas. Los filtros de estado, programa y período funcionan de forma independiente y combinada.

---

### Módulo 3 — Cambio de estado de solicitudes

**Objetivo:** El administrador puede aprobar, rechazar u observar una solicitud. Cada cambio queda registrado en `historial_estados` con actor y timestamp.

**Server Action:**

```typescript
export async function cambiarEstadoSolicitud(params: {
  solicitud_id: string
  estado_nuevo: string
  justificacion?: string
}) {
  // justificacion es obligatoria para 'rechazada' y 'observada'
  if (
    ['rechazada', 'observada'].includes(params.estado_nuevo) &&
    !params.justificacion?.trim()
  ) {
    throw new Error('La justificación es obligatoria para este estado.')
  }

  const supabase = createServerClient()

  const { error } = await supabase
    .from('solicitudes')
    .update({
      estado: params.estado_nuevo,
      updated_at: new Date().toISOString()
    })
    .eq('id', params.solicitud_id)

  if (error) throw error

  // insertar en audit_log
  await supabase.from('audit_log').insert({
    accion: `SOLICITUD_${params.estado_nuevo.toUpperCase()}`,
    entidad: 'solicitudes',
    entidad_id: params.solicitud_id,
    detalle: { justificacion: params.justificacion }
  })

  // historial_estados se registra automáticamente por el trigger de Supabase
}
```

**Criterio de aceptación:** Cambiar el estado de una solicitud a cualquier valor posible actualiza `solicitudes.estado`, inserta un registro en `historial_estados` (vía trigger) y otro en `audit_log`. La justificación es obligatoria para `rechazada` y `observada`; el formulario no permite enviar sin ella.

---

### Módulo 4 — CRUD de usuarios

**Objetivo:** El administrador puede crear, ver, editar y desactivar usuarios del sistema con cualquier rol.

**Consideración Clerk + Supabase:** Al crear un usuario, Clerk gestiona las credenciales. El profile en Supabase se crea en el webhook `user.created` de Clerk, o manualmente desde el Server Action usando el Clerk Backend API.

**Flujo de creación:**
1. Admin llena el formulario (nombre, apellido, email, rol, programa si aplica)
2. Server Action llama a Clerk Backend API para crear el usuario en Clerk
3. Con el `clerk_id` retornado, inserta el profile en `profiles`
4. Registra la acción en `audit_log`

**Server Action:**

```typescript
import { clerkClient } from '@clerk/nextjs/server'

export async function crearUsuario(data: {
  email: string
  nombre: string
  apellido: string
  rol: string
  programa?: string
}) {
  const clerk = await clerkClient()

  // crear en Clerk
  const clerkUser = await clerk.users.createUser({
    emailAddress: [data.email],
    firstName: data.nombre,
    lastName: data.apellido,
    skipPasswordRequirement: false,   // Clerk envía email de onboarding
  })

  // crear profile en Supabase
  const supabase = createServerClient()
  const { error } = await supabase.from('profiles').insert({
    clerk_id: clerkUser.id,
    email: data.email,
    nombre: data.nombre,
    apellido: data.apellido,
    rol: data.rol,
    programa: data.programa ?? null,
  })

  if (error) throw error

  await supabase.from('audit_log').insert({
    accion: 'USER_CREATED',
    entidad: 'profiles',
    detalle: { email: data.email, rol: data.rol }
  })
}

export async function desactivarUsuario(profile_id: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ activo: false })
    .eq('id', profile_id)
    .select('clerk_id')
    .single()

  if (error) throw error

  // también suspender en Clerk
  const clerk = await clerkClient()
  await clerk.users.banUser(data.clerk_id)
}
```

**Criterio de aceptación:** Crear un usuario genera un profile en Supabase y una cuenta en Clerk. Desactivar un usuario pone `activo = false` en Supabase y suspende la cuenta en Clerk. El usuario desactivado no puede iniciar sesión.

---

### Módulo 5 — Reportes por período

**Objetivo:** El administrador puede seleccionar un período académico y ver métricas del proceso de reingreso.

**Métricas requeridas:**
- Total de solicitudes por estado
- Total por programa
- Tiempo promedio de resolución (fecha radicación → fecha aprobación/rechazo)
- Solicitudes sin movimiento en más de 5 días hábiles

**Query:**

```typescript
export async function getReportePeriodo(periodo_id: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('solicitudes')
    .select('estado, programa, created_at, updated_at')
    .eq('periodo_id', periodo_id)

  if (error) throw error

  // agrupar por estado
  const porEstado = data.reduce((acc, s) => {
    acc[s.estado] = (acc[s.estado] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  // agrupar por programa
  const porPrograma = data.reduce((acc, s) => {
    acc[s.programa] = (acc[s.programa] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  // tiempo promedio para solicitudes cerradas (aprobada o rechazada)
  const cerradas = data.filter(s =>
    ['aprobada', 'rechazada'].includes(s.estado)
  )
  const tiempoPromedio = cerradas.length > 0
    ? cerradas.reduce((acc, s) => {
        const diff = new Date(s.updated_at).getTime() - new Date(s.created_at).getTime()
        return acc + diff / (1000 * 60 * 60 * 24)  // en días
      }, 0) / cerradas.length
    : null

  return { porEstado, porPrograma, tiempoPromedio, total: data.length }
}
```

**Criterio de aceptación:** Al seleccionar un período, el dashboard muestra los conteos por estado y programa, y el tiempo promedio de resolución en días. Si no hay solicitudes cerradas, el tiempo promedio muestra "Sin datos".

---

### Módulo 6 — Log de auditoría

**Objetivo:** Vista de solo lectura con todas las acciones registradas en `audit_log`, filtrable por actor, tipo de acción y rango de fechas.

**Criterio de aceptación:** La tabla muestra actor, acción, entidad afectada, detalle en JSON legible y timestamp. Los filtros funcionan. No hay opción de editar ni eliminar registros desde esta vista.

---

## Orden de implementación sugerido (sprints)

### Sprint 1 (semanas 1–2)
- Setup del proyecto (Next.js + Clerk + Supabase)
- Esquema completo de BD en Supabase
- Autenticación funcional con redirección por rol
- Layout del dashboard con sidebar
- Módulo de solicitudes: lectura y filtros

### Sprint 2 (semanas 3–4)
- Módulo cambio de estado (+ modal de justificación)
- Vista de expediente completo por solicitud
- Módulo CRUD de usuarios
- Integración Clerk Backend API para crear/desactivar usuarios

### Sprint 3 (semanas 5–6)
- Módulo de reportes por período
- Log de auditoría
- Pruebas de todos los módulos con datos de prueba
- Ajustes de UI y validaciones de formularios

---

## Datos de prueba (seed)

Insertar antes de empezar el desarrollo para poder probar sin depender de otras vistas:

```sql
-- Período académico activo
INSERT INTO periodos_academicos (nombre, fecha_inicio, fecha_fin, activo)
VALUES ('2025-1', '2025-01-15', '2025-06-15', TRUE);

-- Solicitudes de prueba con distintos estados
-- (reemplazar estudiante_id y periodo_id con UUIDs reales)
INSERT INTO solicitudes (estudiante_id, periodo_id, programa, estado, motivo_solicitud)
VALUES
  ('<uuid>', '<uuid>', 'Ingeniería de Sistemas', 'radicada', 'Solicitud de prueba 1'),
  ('<uuid>', '<uuid>', 'Derecho', 'en_validacion', 'Solicitud de prueba 2'),
  ('<uuid>', '<uuid>', 'Medicina', 'aprobada', 'Solicitud de prueba 3'),
  ('<uuid>', '<uuid>', 'Ingeniería de Sistemas', 'rechazada', 'Solicitud de prueba 4');
```

---

## Decisiones técnicas a tomar antes de iniciar

| Decisión | Opciones | Recomendación |
|---|---|---|
| Sincronización Clerk → Supabase | Webhook `user.created` vs creación manual desde Server Action | **Webhook** si hay tiempo; **Server Action directo** si se necesita simplicidad |
| Paginación de tablas | Server-side (query con `.range()`) vs client-side | **Server-side** para reportes y auditoría |
| Notificaciones al estudiante | Email via Resend / SendGrid | Dejar como `WON'T` para esta entrega; solo registrar en BD |
| Manejo de errores | `try/catch` + toast en cliente | `useFormState` + Server Actions con retorno tipado |

---

## Checklist de entrega

- [ ] Esquema de BD completo corriendo en Supabase (todas las tablas, triggers, RLS)
- [ ] Autenticación con Clerk funcionando; rutas protegidas por rol
- [ ] Tabla de solicitudes con filtros por estado, programa y período
- [ ] Modal de cambio de estado con justificación obligatoria para rechazo/observación
- [ ] Vista de expediente completo por solicitud (documentos + historial de estados)
- [ ] CRUD de usuarios con integración Clerk
- [ ] Reportes por período con métricas básicas
- [ ] Log de auditoría de solo lectura
- [ ] Seed de datos de prueba ejecutado
- [ ] Variables de entorno documentadas en `.env.example`
