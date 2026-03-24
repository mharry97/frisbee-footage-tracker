"use client"

import { ThemeProvider } from "next-themes"
import type React from "react"

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" forcedTheme="dark" disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}
