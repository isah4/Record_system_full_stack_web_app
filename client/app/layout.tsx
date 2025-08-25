import type { Metadata } from "next";
import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BizTracker - Business Record Management System",
  description:
    "Mobile-first business management system for tracking sales, expenses, debts, and inventory",
  keywords:
    "business management, sales tracking, inventory, expenses, small business",
  authors: [{ name: "BizTracker Team" }],
  viewport: "width=device-width, initial-scale=1",
  generator: "v0.dev",
};

// Environment variable logging for debugging
if (typeof window !== 'undefined') {
  console.log('🔧 Frontend Environment Variables:');
  console.log('📍 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('🌐 NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
  console.log('🔗 NEXT_PUBLIC_CLIENT_URL:', process.env.NEXT_PUBLIC_CLIENT_URL);
  console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
  console.log('⏰ App loaded at:', new Date().toISOString());
  
  // Validate critical environment variables
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.error('❌ CRITICAL: NEXT_PUBLIC_API_URL is not defined!');
    console.error('🔧 This will cause API calls to fail');
  }
  
  if (!process.env.NEXT_PUBLIC_CLIENT_URL) {
    console.error('❌ CRITICAL: NEXT_PUBLIC_CLIENT_URL is not defined!');
    console.error('🔧 This may cause CORS issues');
  }
}

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
        </AuthProvider>
      </body>
    </html>
  );
}
