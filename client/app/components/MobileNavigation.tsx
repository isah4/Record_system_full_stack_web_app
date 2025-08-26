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
import { useState, useEffect } from "react";
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
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isStandalone, setIsStandalone] = useState(false);

  // Hide navigation on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Detect installed (standalone) mode to apply safe-area padding
  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(!!standalone);

    const handler = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    const mql = window.matchMedia('(display-mode: standalone)');
    try {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    } catch {
      // older browsers
      return () => {};
    }
  }, []);

  const handleNavigation = (href: string) => {
    if (pathname === href) return;
    setIsNavigating(true);
    router.push(href);
  };

  return (
    <React.Fragment>
      {isNavigating && <LoadingScreen />}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 w-full bg-white border-t border-slate-200 px-2 py-2 z-[9999] shadow-lg xs-mobile-nav transition-transform duration-300 ease-out",
          isVisible ? "translate-y-0" : "translate-y-full",
          isStandalone ? "pb-safe" : undefined
        )}
        style={isStandalone ? { paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)" } : undefined}
      >
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
