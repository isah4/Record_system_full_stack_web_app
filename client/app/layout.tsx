import type { Metadata } from "next";
import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import PWARegistration from "../components/PWARegistration";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BizTracker - Business Record Management System",
  description:
    "Mobile-first business management system for tracking sales, expenses, debts, and inventory",
  keywords:
    "business management, sales tracking, inventory, expenses, small business",
  authors: [{ name: "BizTracker Team" }],
  viewport: "width=device-width, initial-scale=1, user-scalable=no, viewport-fit=cover",
  generator: "v0.dev",
  manifest: "/manifest.json",
  themeColor: "#10b981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BizTracker",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://biztracker.app",
    title: "BizTracker - Business Management",
    description: "Mobile-first business management system",
    siteName: "BizTracker",
  },
  twitter: {
    card: "summary_large_image",
    title: "BizTracker - Business Management",
    description: "Mobile-first business management system",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "BizTracker",
    "msapplication-TileColor": "#10b981",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} flex min-h-screen flex-col`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <main className="page-transition flex-1">{children}</main>
          </div>
          <Toaster />
          <PWARegistration />
        </AuthProvider>
      </body>
    </html>
  );
}
