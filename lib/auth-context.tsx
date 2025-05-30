"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import { useRouter } from "next/navigation"

// Define types
export interface Player {
  player_id: string
  username: string
  player_name: string
  team_id: string
  is_admin: boolean
  is_active: boolean
  auth_user_id: string
}

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
    .select("player_id, username, player_name, team_id, is_admin, is_active, auth_user_id")
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

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadPlayerData()
      } else {
        setPlayer(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadPlayerData = async () => {
    try {
      const playerData = await getCurrentPlayerData()
      setPlayer(playerData)
    } catch (error) {
      console.error("Error loading player data:", error)
      setPlayer(null)
    } finally {
      setLoading(false)
    }
  }

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
      router.push("/")
    }
  }, [auth.loading, auth.user, router])

  return auth
}
