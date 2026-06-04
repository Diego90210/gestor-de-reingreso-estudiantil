# Especificación de Diseño Frontend — Dashboard Administrador
## Sistema de Gestión de Reingreso Estudiantil — Universidad de Cartagena

---

## Dirección estética

**Estilo**: Institucional refinado. Limpio, preciso, con autoridad visual. No corporativo genérico, sino con carácter propio: bordes con peso, tipografía con jerarquía clara, y un sistema de color que comunica seriedad académica sin ser frío.

**Tono**: Utilitarian/refined. Cada elemento existe por razón. Nada decorativo sin propósito. Las tablas respiran, los estados tienen color, las acciones son inequívocas.

**Lo que lo hace memorable**: El sistema de color semántico aplicado de forma consistente en toda la interfaz. Cada estado de solicitud tiene un color fijo que aparece en la tabla, en el badge, en el expediente y en el historial — el usuario nunca tiene que leer para entender el estado de una solicitud.

---

## Sistema de diseño

### Tipografía

```
Display / Headings:  DM Sans (Google Fonts) — peso 500 y 600
Body / Labels:       DM Sans — peso 400
Monospace (IDs, códigos de radicado): DM Mono
```

Instalar en `app/layout.tsx`:
```tsx
import { DM_Sans, DM_Mono } from 'next/font/google'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
})
```

### Paleta de color

Configurar en `tailwind.config.ts` y `globals.css` con soporte dark/light:

```css
/* globals.css */
:root {
  /* Base */
  --background: 0 0% 98%;
  --foreground: 220 15% 12%;
  --card: 0 0% 100%;
  --card-foreground: 220 15% 12%;
  --border: 220 13% 90%;
  --muted: 220 14% 95%;
  --muted-foreground: 220 10% 50%;

  /* Primario — azul institucional */
  --primary: 221 70% 38%;
  --primary-foreground: 0 0% 100%;

  /* Sidebar */
  --sidebar-bg: 220 20% 14%;
  --sidebar-fg: 220 15% 85%;
  --sidebar-active: 221 70% 38%;
  --sidebar-active-fg: 0 0% 100%;
  --sidebar-hover: 220 18% 20%;

  /* Semánticos — estados de solicitud */
  --state-radicada: 217 80% 55%;           /* azul */
  --state-en-revision: 38 90% 50%;         /* ámbar */
  --state-documentacion: 25 85% 52%;       /* naranja */
  --state-en-validacion: 262 70% 58%;      /* violeta */
  --state-observada: 38 90% 50%;           /* ámbar */
  --state-evaluacion: 196 75% 45%;         /* cyan */
  --state-aprobada: 142 65% 38%;           /* verde */
  --state-rechazada: 0 70% 50%;            /* rojo */
}

.dark {
  --background: 220 20% 10%;
  --foreground: 220 10% 92%;
  --card: 220 18% 13%;
  --card-foreground: 220 10% 92%;
  --border: 220 15% 22%;
  --muted: 220 18% 17%;
  --muted-foreground: 220 10% 55%;

  --primary: 221 70% 55%;
  --primary-foreground: 0 0% 100%;

  --sidebar-bg: 220 22% 8%;
  --sidebar-fg: 220 10% 70%;
  --sidebar-active: 221 70% 55%;
  --sidebar-active-fg: 0 0% 100%;
  --sidebar-hover: 220 20% 14%;
}
```

### Componente shadcn/ui: estilo Nova

En `components.json` usar:
```json
{
  "style": "nova",
  "tailwind": {
    "baseColor": "slate"
  }
}
```

### Mapa de colores por estado (usar en toda la app)

Crear `lib/constants.ts`:

```ts
export const ESTADO_CONFIG = {
  radicada: {
    label: 'Radicada',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  en_revision: {
    label: 'En revisión',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  documentacion_incompleta: {
    label: 'Documentación incompleta',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    dot: 'bg-orange-500',
  },
  en_validacion: {
    label: 'En validación',
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    dot: 'bg-violet-500',
  },
  observada: {
    label: 'Observada',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    dot: 'bg-amber-400',
  },
  en_evaluacion_academica: {
    label: 'En evaluación académica',
    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    dot: 'bg-cyan-500',
  },
  aprobada: {
    label: 'Aprobada',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    dot: 'bg-green-500',
  },
  rechazada: {
    label: 'Rechazada',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    dot: 'bg-red-500',
  },
} as const
```

---

## Layout general

### Estructura base

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (240px fijo, colapsable a 64px)            │
│  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │                  │  │ HEADER (48px)            │ │
│  │  Logo + nombre   │  │ título de página + accs. │ │
│  │  del sistema     │  ├──────────────────────────┤ │
│  │                  │  │                          │ │
│  │  nav items       │  │  CONTENIDO PRINCIPAL     │ │
│  │                  │  │                          │ │
│  │  ─────────────── │  │                          │ │
│  │  perfil + logout │  │                          │ │
│  └──────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Sidebar — `components/layout/Sidebar.tsx`

**Comportamiento:**
- Ancho expandido: 240px
- Ancho colapsado: 64px (solo íconos con tooltip)
- El estado colapsado persiste en `localStorage`
- En mobile: overlay con `Sheet` de shadcn/ui

**Contenido:**
```
[Logo UniCartagena 32px] [nombre del sistema — visible solo expandido]

─── NAVEGACIÓN ───────────────────────────
[📋] Solicitudes         /dashboard
[👥] Usuarios            /dashboard/usuarios
[📊] Reportes            /dashboard/reportes
[📜] Auditoría           /dashboard/auditoria

─── INFERIOR ─────────────────────────────
[🌙/☀️] Toggle dark mode
[avatar] Nombre del admin   /dashboard/perfil
[↩] Cerrar sesión
```

**Componentes usados:** `Tooltip` (shadcn), `Avatar` (shadcn), botón de toggle con `next-themes`.

**Implementación del toggle dark/light:**
```tsx
// Usar next-themes
// npm install next-themes

// app/layout.tsx — envolver con ThemeProvider
import { ThemeProvider } from 'next-themes'

// El botón en el sidebar
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
```

### Header — `components/layout/Header.tsx`

```
┌────────────────────────────────────────────────────────────┐
│  [título de la sección actual]          [breadcrumb]       │
└────────────────────────────────────────────────────────────┘
```

Altura: 48px. Border-bottom. Sin sombra. Solo separador `border-border`.

---

## Pantalla 1 — Overview `/dashboard`

### Composición

```
┌──────────────────────────────────────────────────────────────┐
│  Bienvenido, [Nombre].  Período activo: 2025-1               │
│  Hoy es [fecha].                                             │
├──────────────┬───────────────┬──────────────┬───────────────┤
│  CARD        │  CARD         │  CARD        │  CARD         │
│  Total       │  Pendientes   │  Aprobadas   │  Rechazadas   │
│  solicitudes │  hoy          │  este período│  este período │
│  [número]    │  [número]     │  [número]    │  [número]     │
├──────────────┴───────────────┴──────────────┴───────────────┤
│  SOLICITUDES RECIENTES (últimas 5)                           │
│  [tabla resumida con columnas: radicado, estudiante,         │
│   programa, estado, fecha]                                   │
│  [Botón: Ver todas →]                                        │
└──────────────────────────────────────────────────────────────┘
```

### Componentes

```tsx
// Cards de métricas
<Card>
  <CardHeader className="pb-1">
    <CardDescription>Total solicitudes</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-semibold tabular-nums">142</p>
    <p className="text-xs text-muted-foreground mt-1">Período 2025-1</p>
  </CardContent>
</Card>

// Tabla de solicitudes recientes — usar shadcn Table
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Radicado</TableHead>
      <TableHead>Estudiante</TableHead>
      <TableHead>Programa</TableHead>
      <TableHead>Estado</TableHead>
      <TableHead>Fecha</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {solicitudes.map(s => (
      <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50">
        <TableCell className="font-mono text-xs">{s.numero_radicado}</TableCell>
        <TableCell>{s.estudiante.nombre} {s.estudiante.apellido}</TableCell>
        <TableCell>{s.programa}</TableCell>
        <TableCell><EstadoBadge estado={s.estado} /></TableCell>
        <TableCell className="text-muted-foreground text-xs">
          {format(new Date(s.created_at), 'dd/MM/yyyy')}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Componente reutilizable `EstadoBadge`

```tsx
// components/shared/EstadoBadge.tsx
import { ESTADO_CONFIG } from '@/lib/constants'

export function EstadoBadge({ estado }: { estado: string }) {
  const config = ESTADO_CONFIG[estado as keyof typeof ESTADO_CONFIG]
  if (!config) return null

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
```

---

## Pantalla 2 — Solicitudes `/dashboard/solicitudes`

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Solicitudes de reingreso                                    │
│                                                              │
│  [Buscador por nombre/radicado] [Estado ▼] [Programa ▼]     │
│  [Período ▼]                               [142 resultados]  │
├──────────────────────────────────────────────────────────────┤
│  TABLA                                                       │
│  ┌────────────┬──────────────────┬────────────┬───────────┐  │
│  │ Radicado   │ Estudiante       │ Programa   │ Estado    │  │
│  ├────────────┼──────────────────┼────────────┼───────────┤  │
│  │ REI-2025.. │ Juan García      │ Ing. Sist. │ ●Radicada │  │
│  │ REI-2025.. │ María López      │ Derecho    │ ●Aprobada │  │
│  └────────────┴──────────────────┴────────────┴───────────┘  │
│  [← Anterior]   Página 1 de 8   [Siguiente →]               │
└──────────────────────────────────────────────────────────────┘
```

### Componentes

```tsx
// Filtros — usar shadcn Select + Input
<div className="flex items-center gap-3 flex-wrap">
  <Input
    placeholder="Buscar por nombre o radicado..."
    className="max-w-xs"
    value={busqueda}
    onChange={e => setBusqueda(e.target.value)}
  />
  <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
    <SelectTrigger className="w-48">
      <SelectValue placeholder="Todos los estados" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="">Todos los estados</SelectItem>
      {Object.entries(ESTADO_CONFIG).map(([key, val]) => (
        <SelectItem key={key} value={key}>{val.label}</SelectItem>
      ))}
    </SelectContent>
  </Select>
  <Select value={programaFiltro} onValueChange={setProgramaFiltro}>
    <SelectTrigger className="w-48">
      <SelectValue placeholder="Todos los programas" />
    </SelectTrigger>
    <SelectContent>
      {PROGRAMAS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
    </SelectContent>
  </Select>
</div>

// Fila de tabla — clic navega al expediente
<TableRow
  key={s.id}
  className="cursor-pointer hover:bg-muted/50 transition-colors"
  onClick={() => router.push(`/dashboard/solicitudes/${s.id}`)}
>
```

### Paginación

```tsx
// Usar shadcn Pagination
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href={`?page=${page - 1}`} />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink>Página {page} de {totalPages}</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href={`?page=${page + 1}`} />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

---

## Pantalla 3 — Expediente de solicitud `/dashboard/solicitudes/[id]`

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  ← Volver a solicitudes                                      │
│                                                              │
│  REI-2025-0032 · Juan Diego García                           │
│  Ingeniería de Sistemas · Período 2025-1                     │
│  [● Radicada]          [Cambiar estado ▼]                    │
├─────────────────────────┬────────────────────────────────────┤
│  INFORMACIÓN GENERAL    │  HISTORIAL DE ESTADOS              │
│                         │                                    │
│  Motivo de solicitud:   │  ● 14/03/2025 10:22               │
│  [texto libre]          │    Radicada → En revisión          │
│                         │    por: Ana Martínez               │
│  Documentos adjuntos:   │                                    │
│  📄 paz_salvo_fin.pdf   │  ● 13/03/2025 09:15               │
│  📄 formato_casos.pdf   │    Radicada                        │
│  📄 paz_salvo_bib.pdf   │    por: Sistema                    │
│                         │                                    │
└─────────────────────────┴────────────────────────────────────┘
```

### Componentes clave

```tsx
// Layout de dos columnas
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Columna izquierda: info + docs (2/3) */}
  <div className="lg:col-span-2 space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Información de la solicitud</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Motivo</p>
          <p className="mt-1">{solicitud.motivo_solicitud}</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Documentos adjuntos</CardTitle>
      </CardHeader>
      <CardContent>
        {documentos.map(doc => (
          <a
            key={doc.id}
            href={doc.url}
            target="_blank"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
          >
            <FileText size={16} className="text-muted-foreground" />
            <span className="text-sm">{doc.nombre_archivo}</span>
            <ExternalLink size={14} className="ml-auto text-muted-foreground" />
          </a>
        ))}
      </CardContent>
    </Card>
  </div>

  {/* Columna derecha: historial (1/3) */}
  <div>
    <Card>
      <CardHeader>
        <CardTitle>Historial</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative border-l border-border space-y-4 ml-2">
          {historial.map(h => (
            <li key={h.id} className="pl-4">
              <span className={`absolute -left-1.5 w-3 h-3 rounded-full border-2 border-background ${ESTADO_CONFIG[h.estado_nuevo].dot}`} />
              <p className="text-xs text-muted-foreground">
                {format(new Date(h.created_at), "dd/MM/yyyy HH:mm")}
              </p>
              <p className="text-sm font-medium mt-0.5">
                {h.estado_anterior
                  ? `${ESTADO_CONFIG[h.estado_anterior].label} → ${ESTADO_CONFIG[h.estado_nuevo].label}`
                  : ESTADO_CONFIG[h.estado_nuevo].label
                }
              </p>
              {h.justificacion && (
                <p className="text-xs text-muted-foreground mt-0.5 italic">
                  "{h.justificacion}"
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                por {h.actor.nombre} {h.actor.apellido}
              </p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  </div>
</div>
```

### Modal cambio de estado — `CambiarEstadoModal.tsx`

```tsx
// Usar shadcn Dialog
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button variant="default">Cambiar estado</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Cambiar estado de solicitud</DialogTitle>
      <DialogDescription>
        {solicitud.numero_radicado} · {solicitud.estudiante.nombre}
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-2">
      <div>
        <label className="text-sm font-medium">Nuevo estado</label>
        <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            {TRANSICIONES_VALIDAS[solicitud.estado].map(estado => (
              <SelectItem key={estado} value={estado}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${ESTADO_CONFIG[estado].dot}`} />
                  {ESTADO_CONFIG[estado].label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Justificación — visible solo para rechazada/observada */}
      {['rechazada', 'observada'].includes(nuevoEstado) && (
        <div>
          <label className="text-sm font-medium">
            Justificación <span className="text-destructive">*</span>
          </label>
          <Textarea
            className="mt-1.5"
            placeholder="Describe el motivo de esta decisión..."
            value={justificacion}
            onChange={e => setJustificacion(e.target.value)}
            rows={3}
          />
        </div>
      )}
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
      <Button
        onClick={handleSubmit}
        disabled={
          !nuevoEstado ||
          (['rechazada', 'observada'].includes(nuevoEstado) && !justificacion.trim())
        }
      >
        Confirmar cambio
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Transiciones válidas de estado

```ts
// lib/constants.ts — agregar
export const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  radicada:                 ['en_revision', 'documentacion_incompleta', 'rechazada'],
  en_revision:              ['en_validacion', 'documentacion_incompleta', 'observada'],
  documentacion_incompleta: ['en_revision', 'rechazada'],
  en_validacion:            ['en_evaluacion_academica', 'observada', 'rechazada'],
  observada:                ['en_revision', 'rechazada'],
  en_evaluacion_academica:  ['aprobada', 'rechazada'],
  aprobada:                 [],
  rechazada:                [],
}
```

---

## Pantalla 4 — Usuarios `/dashboard/usuarios`

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Usuarios del sistema                   [+ Nuevo usuario]    │
│                                                              │
│  [Buscar por nombre o email...]  [Rol ▼]  [Estado ▼]        │
├──────────────────────────────────────────────────────────────┤
│  TABLA                                                       │
│  ┌──────────────────┬──────────────┬───────────────┬──────┐  │
│  │ Usuario          │ Email        │ Rol           │      │  │
│  ├──────────────────┼──────────────┼───────────────┼──────┤  │
│  │ [avatar] Ana M.  │ ana@uni...   │ Reg. Control  │ ···  │  │
│  │ [avatar] Luis P. │ luis@uni...  │ Coordinador   │ ···  │  │
│  └──────────────────┴──────────────┴───────────────┴──────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Componentes

```tsx
// Avatar en tabla
<TableCell>
  <div className="flex items-center gap-2.5">
    <Avatar className="h-7 w-7">
      <AvatarFallback className="text-xs bg-primary/10 text-primary">
        {usuario.nombre[0]}{usuario.apellido[0]}
      </AvatarFallback>
    </Avatar>
    <div>
      <p className="text-sm font-medium">{usuario.nombre} {usuario.apellido}</p>
      {!usuario.activo && (
        <span className="text-xs text-muted-foreground">Inactivo</span>
      )}
    </div>
  </div>
</TableCell>

// Rol badge
<TableCell>
  <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
    {ROL_LABELS[usuario.rol]}
  </span>
</TableCell>

// Menú de acciones (···)
<TableCell>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-7 w-7">
        <MoreHorizontal size={15} />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => router.push(`/dashboard/usuarios/${usuario.id}`)}>
        Ver perfil
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => abrirEditarRol(usuario)}>
        Cambiar rol
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-destructive focus:text-destructive"
        onClick={() => confirmarDesactivar(usuario)}
      >
        {usuario.activo ? 'Desactivar usuario' : 'Reactivar usuario'}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</TableCell>
```

### Formulario Nuevo Usuario — `Sheet` lateral

```tsx
// Usar Sheet de shadcn (panel lateral) en lugar de modal para formularios largos
<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
  <SheetContent className="sm:max-w-md">
    <SheetHeader>
      <SheetTitle>Nuevo usuario</SheetTitle>
      <SheetDescription>
        Se enviará un correo de activación al email ingresado.
      </SheetDescription>
    </SheetHeader>

    <div className="space-y-4 mt-6">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Nombre</label>
          <Input className="mt-1.5" placeholder="Juan" />
        </div>
        <div>
          <label className="text-sm font-medium">Apellido</label>
          <Input className="mt-1.5" placeholder="García" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Correo institucional</label>
        <Input className="mt-1.5" placeholder="usuario@unicartagena.edu.co" type="email" />
      </div>

      <div>
        <label className="text-sm font-medium">Rol</label>
        <Select>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Seleccionar rol" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROL_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Programa — visible solo si rol es coordinador_programa */}
      {rolSeleccionado === 'coordinador_programa' && (
        <div>
          <label className="text-sm font-medium">Programa académico</label>
          <Select>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Seleccionar programa" />
            </SelectTrigger>
            <SelectContent>
              {PROGRAMAS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>

    <SheetFooter className="mt-6">
      <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
      <Button type="submit">Crear usuario</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

---

## Pantalla 5 — Reportes `/dashboard/reportes`

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Reportes por período                                        │
│                                                              │
│  [Período académico ▼]   2025-1 ▾                            │
├──────────┬───────────────┬─────────────────────────────────  │
│  CARD    │  CARD         │  CARD                            │
│  Total   │  Tiempo prom. │  Sin movimiento (>5 días)        │
│  142     │  4.2 días     │  8 solicitudes                   │
├──────────┴───────────────┴─────────────────────────────────  │
│                                                              │
│  ┌─────────────────────────────┐  ┌────────────────────────┐ │
│  │  Solicitudes por estado     │  │  Solicitudes por       │ │
│  │  [gráfico de barras horiz.] │  │  programa              │ │
│  │                             │  │  [gráfico de barras]   │ │
│  └─────────────────────────────┘  └────────────────────────┘ │
│                                                              │
│  [Exportar CSV]                                              │
└──────────────────────────────────────────────────────────────┘
```

### Gráficos con Recharts

```tsx
// npm install recharts
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'

// Gráfico por estado
<ResponsiveContainer width="100%" height={280}>
  <BarChart data={dataPorEstado} layout="vertical" margin={{ left: 16 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
    <XAxis
      type="number"
      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
    />
    <YAxis
      type="category"
      dataKey="estado"
      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
      width={130}
    />
    <Tooltip
      contentStyle={{
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '6px',
        fontSize: '12px',
      }}
    />
    <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
      {dataPorEstado.map((entry) => (
        <Cell
          key={entry.estado}
          fill={`hsl(var(--state-${entry.estado.replace('_', '-')}))`}
        />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

### Exportar CSV

```tsx
function exportarCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(r => Object.values(r).join(',')).join('\n')
  const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
}

<Button variant="outline" onClick={() => exportarCSV(reporteData, `reporte-${periodo}`)}>
  <Download size={15} className="mr-2" />
  Exportar CSV
</Button>
```

---

## Pantalla 6 — Auditoría `/dashboard/auditoria`

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Log de auditoría                                            │
│                                                              │
│  [Buscar acción...]  [Actor ▼]  [Desde: ──]  [Hasta: ──]    │
├──────────────────────────────────────────────────────────────┤
│  TABLA                                                       │
│  ┌──────────────────┬─────────────────┬────────────┬──────┐  │
│  │ Fecha / Hora     │ Actor           │ Acción     │ Det. │  │
│  ├──────────────────┼─────────────────┼────────────┼──────┤  │
│  │ 14/03 10:22      │ Ana Martínez    │ APROBADA   │  [↓] │  │
│  │ 14/03 09:15      │ Sistema         │ USER_CREAT │  [↓] │  │
│  └──────────────────┴─────────────────┴────────────┴──────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Fila expansible para detalle JSON

```tsx
// Estado para controlar qué fila está expandida
const [expandedRow, setExpandedRow] = useState<string | null>(null)

<TableRow
  key={log.id}
  className="cursor-pointer hover:bg-muted/30"
  onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
>
  ...
</TableRow>

{/* Fila de detalle expandido */}
{expandedRow === log.id && (
  <TableRow>
    <TableCell colSpan={4} className="bg-muted/30 py-3">
      <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
        {JSON.stringify(log.detalle, null, 2)}
      </pre>
    </TableCell>
  </TableRow>
)}
```

---

## Estados de UI transversales

### Loading states

```tsx
// Skeleton para tablas durante carga
import { Skeleton } from '@/components/ui/skeleton'

function TablaSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}
```

### Empty states

```tsx
// Cuando no hay resultados
function EmptyState({ mensaje }: { mensaje: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Inbox size={32} className="mb-3 opacity-40" />
      <p className="text-sm">{mensaje}</p>
    </div>
  )
}

// Uso
{solicitudes.length === 0 && (
  <EmptyState mensaje="No hay solicitudes con los filtros aplicados." />
)}
```

### Toast notifications

```tsx
// Usar sonner (recomendado con shadcn/ui)
// npm install sonner

import { toast } from 'sonner'

// En Server Action tras éxito:
toast.success('Estado actualizado correctamente.')

// En error:
toast.error('No se pudo actualizar el estado. Intenta de nuevo.')
```

---

## Dependencias a instalar

Antes de instalar cualquier paquete, verificar si ya existe en `package.json`. Solo instalar lo que no esté presente.

```bash
# 1. Verificar qué paquetes ya están instalados
node -e "const p = require('./package.json'); console.log(JSON.stringify({...p.dependencies, ...p.devDependencies}, null, 2))"
```

Luego instalar únicamente los que no aparezcan en esa lista:

```bash
# Core — solo si el proyecto no existe todavía
# Si ya existe un directorio con package.json, omitir este paso
npx create-next-app@latest reingreso --typescript --tailwind --app

# shadcn/ui — solo si no existe components.json en la raíz
# Verificar: [ -f components.json ] && echo "ya inicializado" || npx shadcn@latest init
npx shadcn@latest init

# Componentes shadcn — shadcn detecta automáticamente los que ya existen y omite reinstalarlos
npx shadcn@latest add button card input select textarea table \
  dialog sheet dropdown-menu avatar badge pagination \
  separator tooltip skeleton

# Verificar antes de instalar cada grupo:
# node -e "const p=require('./package.json'); const deps={...p.dependencies,...p.devDependencies}; ['next-themes','sonner'].forEach(d => console.log(d, deps[d] ? '✓ instalado' : '✗ falta'))"
npm install next-themes sonner

# node -e "const p=require('./package.json'); const deps={...p.dependencies,...p.devDependencies}; ['lucide-react'].forEach(d => console.log(d, deps[d] ? '✓ instalado' : '✗ falta'))"
npm install lucide-react

# node -e "const p=require('./package.json'); const deps={...p.dependencies,...p.devDependencies}; ['date-fns'].forEach(d => console.log(d, deps[d] ? '✓ instalado' : '✗ falta'))"
npm install date-fns

# node -e "const p=require('./package.json'); const deps={...p.dependencies,...p.devDependencies}; ['recharts'].forEach(d => console.log(d, deps[d] ? '✓ instalado' : '✗ falta'))"
npm install recharts

# node -e "const p=require('./package.json'); const deps={...p.dependencies,...p.devDependencies}; ['@clerk/nextjs','@supabase/supabase-js'].forEach(d => console.log(d, deps[d] ? '✓ instalado' : '✗ falta'))"
npm install @clerk/nextjs @supabase/supabase-js
```

**Regla para el agente**: antes de ejecutar cualquier `npm install`, leer `package.json` y confirmar que el paquete no figura en `dependencies` ni en `devDependencies`. Si ya está, omitir el comando por completo. `npx shadcn@latest add` es seguro de correr siempre — detecta componentes existentes y no los sobreescribe a menos que se pase el flag `--overwrite`.

---

## Instrucciones para el agente

1. **Leer primero el plan de desarrollo** (`plan_desarrollo_dashboard.md`) para entender el esquema de BD, Server Actions y estructura de carpetas antes de escribir cualquier componente.

2. **Instalar dependencias** siguiendo el proceso de verificación de la sección anterior. Leer `package.json` antes de cada `npm install` y omitir los paquetes que ya figuren en `dependencies` o `devDependencies`.

3. **Ejecutar el SQL completo** del plan de desarrollo en Supabase antes de tocar el frontend.

4. **Usar siempre `ESTADO_CONFIG` y `TRANSICIONES_VALIDAS`** de `lib/constants.ts` para renderizar estados y controlar transiciones. Nunca hardcodear colores o labels de estado en los componentes.

5. **El toggle dark/light** se implementa con `next-themes`. El `ThemeProvider` envuelve toda la app en `layout.tsx`. El botón vive en el sidebar.

6. **Formularios**: no usar `<form>` HTML directamente. Usar `useActionState` con Server Actions o manejadores `onClick`/`onChange` estándar.

7. **Nunca exponer `SUPABASE_SERVICE_ROLE_KEY`** al cliente. Solo se usa en Server Actions y Route Handlers.

8. **Consultar `TRANSICIONES_VALIDAS`** antes de renderizar las opciones del modal de cambio de estado. El select solo debe mostrar los estados a los que se puede transicionar desde el estado actual.
