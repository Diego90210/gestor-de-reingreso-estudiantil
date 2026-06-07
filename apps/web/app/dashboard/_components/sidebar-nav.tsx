"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  ClipboardList,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type NavItem = { href: string; label: string; icon: string }

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  ClipboardList,
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 space-y-1 p-4">
      {items.map((item) => {
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
  )
}
