"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  DollarSign,
  FileText,
  Users,
  Package,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useState } from "react";
import LoadingScreen from "./LoadingScreen";

const navigationItems = [
  { icon: Home, label: "Home", href: "/", active: true },
  { icon: DollarSign, label: "Sales", href: "/sales" },
  { icon: FileText, label: "Expenses", href: "/expenses" },
  { icon: Users, label: "Debts", href: "/debts" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
];

export default function MobileNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigation = (href: string) => {
    if (pathname === href) return;
    setIsNavigating(true);
    router.push(href);
  };

  return (
    <React.Fragment>
      {isNavigating && <LoadingScreen />}
      <nav className="sticky bottom-0 w-full bg-white border-t border-slate-200 px-2 py-2 z-[9999] shadow-lg">
        <div className="flex items-center justify-around">
          {navigationItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "flex-1 flex flex-col items-center gap-1 h-16 rounded-xl transition-all duration-200",
                pathname === item.href
                  ? "bg-gradient-to-t from-emerald-100 to-emerald-50 text-emerald-600"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
              onClick={() => handleNavigation(item.href)}
            >
              <item.icon
                className={cn(
                  "w-6 h-6",
                  pathname === item.href ? "text-emerald-600" : "text-slate-500"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  pathname === item.href ? "text-emerald-600" : "text-slate-500"
                )}
              >
                {item.label}
              </span>
              {pathname === item.href && (
                <div className="w-1 h-1 bg-emerald-600 rounded-full"></div>
              )}
            </Button>
          ))}
        </div>
      </nav>
    </React.Fragment>
  );
}
