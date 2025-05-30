import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Provider } from "@/components/ui/provider"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Frisbee Footage Tracker",
  description: "Track and analyze ultimate frisbee game footage",
}

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
    <body className={inter.className}>
    <Provider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Provider>
    </body>
    </html>
  )
}
