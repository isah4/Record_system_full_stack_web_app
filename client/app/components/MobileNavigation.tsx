"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  DollarSign,
  FileText,
  Users,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useState } from "react";
import LoadingScreen from "./LoadingScreen";

// Note: Inventory removed from mobile nav to prevent overflow on small screens
// Users can access inventory via the quick action card on the home page
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
      <nav className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-slate-200 px-2 py-2 z-[9999] shadow-lg xs-mobile-nav">
        <div className="flex items-center justify-around">
          {navigationItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "flex-1 flex flex-col items-center gap-1 h-16 rounded-xl transition-all duration-200 xs-nav-button xs-touch-target",
                pathname === item.href
                  ? "bg-gradient-to-t from-emerald-100 to-emerald-50 text-emerald-600"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
              onClick={() => handleNavigation(item.href)}
            >
              <item.icon
                className={cn(
                  "w-6 h-6 xs-nav-icon",
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
