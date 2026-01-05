"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { Provider } from "@/components/ui/provider"
import { AuthProvider } from "@/lib/auth-context"
import { QueryClientProvider } from '@tanstack/react-query'
import { QueryClient } from "@tanstack/react-query";


const queryClient = new QueryClient();

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
            {children}
          </QueryClientProvider>
        </AuthProvider>
      </Provider>
      </body>
    </html>
  )
}
