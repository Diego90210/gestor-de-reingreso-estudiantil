import Link from "next/link"
import {
  FileText,
  Users,
  BarChart3,
  ClipboardList,
  Shield,
  ShieldAlert,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { getUserProfile } from "@/lib/auth"
import type { RolSistema } from "@/lib/supabase/types"
import { ROLES_USUARIO } from "@/lib/constants"

type NavItem = { href: string; label: string; icon: LucideIcon }

const navItemsPorRol: Record<RolSistema, NavItem[]> = {
  registro_control: [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    { href: "/dashboard/solicitudes", label: "Solicitudes", icon: FileText },
    { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
    { href: "/dashboard/reportes", label: "Reportes", icon: BarChart3 },
    { href: "/dashboard/auditoria", label: "Auditoría", icon: ClipboardList },
  ],
  auxiliar_administrativo: [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    { href: "/dashboard/solicitudes", label: "Solicitudes", icon: FileText },
  ],
  centro_admisiones: [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    { href: "/dashboard/solicitudes", label: "Solicitudes", icon: FileText },
  ],
  coordinador_programa: [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    { href: "/dashboard/solicitudes", label: "Solicitudes", icon: FileText },
  ],
  estudiante: [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    {
      href: "/dashboard/solicitudes",
      label: "Mis Solicitudes",
      icon: FileText,
    },
  ],
}

function Sidebar({
  navItems,
  profile,
}: {
  navItems: NavItem[]
  profile: { nombre: string; apellido: string; rol: RolSistema }
}) {
  const rolLabel =
    ROLES_USUARIO.find((r) => r.value === profile.rol)?.label ?? profile.rol

  return (
    <aside className="hidden w-64 flex-col border-r bg-sidebar md:flex">
      <div className="flex h-14 items-center gap-2 border-b px-6">
        <Shield className="h-5 w-5 text-sidebar-primary" />
        <span className="font-semibold text-sidebar-foreground">
          Control Académico
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t p-4">
        <p className="text-sm font-medium text-sidebar-foreground">
          {profile.nombre} {profile.apellido}
        </p>
        <p className="mt-0.5 text-xs text-sidebar-foreground/60">{rolLabel}</p>
      </div>
    </aside>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-md text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Cuenta no configurada
          </h1>
          <p className="mt-2 text-muted-foreground">
            Tu cuenta de usuario aún no ha sido configurada en el sistema.
            Contacta al administrador de Registro y Control Académico para que
            te asigne los permisos correspondientes.
          </p>
          <div className="mt-6">
            <UserButton />
          </div>
        </div>
      </div>
    )
  }

  const items = navItemsPorRol[profile.rol] ?? navItemsPorRol.estudiante

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar navItems={items} profile={profile} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-end gap-4 border-b bg-background px-6">
          <UserButton />
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
