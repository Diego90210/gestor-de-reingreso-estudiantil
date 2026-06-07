"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  Shield,
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  ClipboardList,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { Button } from "@workspace/ui/components/button"
import type { NavItem } from "./sidebar-nav"
import type { RolSistema } from "@/lib/supabase/types"
import { ROLES_USUARIO } from "@/lib/constants"

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  ClipboardList,
}

export function MobileSidebar({
  navItems,
  profile,
}: {
  navItems: NavItem[]
  profile: { nombre: string; apellido: string; rol: RolSistema }
}) {
  const pathname = usePathname()
  const rolLabel =
    ROLES_USUARIO.find((r) => r.value === profile.rol)?.label ?? profile.rol

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-64 flex-col p-0">
        <div className="flex h-14 items-center gap-2 border-b px-6">
          <Shield className="h-5 w-5 text-sidebar-primary" />
          <span className="font-semibold text-sidebar-foreground">
            Control Académico
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-4">
          <p className="text-sm font-medium text-sidebar-foreground">
            {profile.nombre} {profile.apellido}
          </p>
          <p className="mt-0.5 text-xs text-sidebar-foreground/60">
            {rolLabel}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
