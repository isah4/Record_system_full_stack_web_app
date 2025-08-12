"use client"

import { useState } from "react"
import { Home, DollarSign, FileText, Users, Package, BarChart3, Settings, LogOut, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

const navigationItems = [
  { icon: Home, label: "Dashboard", href: "/", active: true },
  { icon: DollarSign, label: "Sales", href: "/sales" },
  { icon: FileText, label: "Expenses", href: "/expenses" },
  { icon: Users, label: "Debts", href: "/debts" },
  { icon: Package, label: "Inventory", href: "/inventory" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export default function Navigation() {
  const [activeItem, setActiveItem] = useState("/")
  const { logout } = useAuth()

  return (
    <nav className="p-4 space-y-2">
      {navigationItems.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-12 transition-all duration-200",
            activeItem === item.href
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
              : "hover:bg-slate-100 text-slate-700"
          )}
          onClick={() => setActiveItem(item.href)}
        >
          <item.icon className="w-5 h-5" />
          <span className="flex-1 text-left">{item.label}</span>
          {activeItem === item.href && (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      ))}
      
      <div className="pt-4 mt-4 border-t border-slate-200">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-12 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      </div>
    </nav>
  )
}
