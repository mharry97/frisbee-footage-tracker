"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, type Player } from "./supabase"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  player: Player | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  changePassword: (newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper functions
const usernameToEmail = (username: string) => `${username}@app.local`

const getCurrentPlayerData = async (): Promise<Player | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from("players")
    .select("player_id, player_name, team_id, is_admin, is_active, auth_user_id")
    .eq("auth_user_id", user.id)
    .single()

  if (error) {
    console.error("Error fetching player data:", error)
    return null
  }

  return data as Player
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)

  // Add debugging to your auth context
  const loadPlayerData = async () => {
    console.log("Starting to load player data...")
    try {
      const playerData = await getCurrentPlayerData()
      // console.log("Player data loaded:", playerData)
      setPlayer(playerData)
    } catch (error) {
      console.error("Error loading player data:", error)
      setPlayer(null)
    } finally {
      console.log("Setting loading to false")
      setLoading(false)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadPlayerData()
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, !!session)

      // Set user immediately (synchronous)
      setUser(session?.user ?? null)

      // Dispatch async work AFTER callback finishes
      setTimeout(() => {
        if (session?.user) {
          loadPlayerData()
        } else {
          setPlayer(null)
          setLoading(false)
        }
      }, 0)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (username: string, password: string) => {
    const email = usernameToEmail(username)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const changePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        player,
        loading,
        login,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useRequireAuth() {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.push("/login")
    }
  }, [auth.loading, auth.user, router])

  return auth
}
