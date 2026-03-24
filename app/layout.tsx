"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Provider } from "@/components/ui/provider"
import { AuthProvider } from "@/lib/auth-context"
import { QueryClientProvider } from '@tanstack/react-query'
import { QueryClient } from "@tanstack/react-query"
import { Sidebar } from "@/components/sidebar"

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Provider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <div className="flex min-h-screen bg-neutral-950 text-neutral-100 overflow-x-hidden">
                <Sidebar />
                <main className="flex-1 min-w-0 md:ml-60 p-6">
                  {children}
                </main>
              </div>
            </QueryClientProvider>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  )
}
