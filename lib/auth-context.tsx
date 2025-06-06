"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"
import { supabase, type Player } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
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

const usernameToEmail = (username: string) => `${username}@app.local`

async function fetchPlayer(userId: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from("players")
    .select("player_id, player_name, team_id, is_admin, is_active, auth_user_id")
    .eq("auth_user_id", userId)
    .single()

  if (error) {
    console.error("Error fetching player data:", error)
    return null
  }

  return data as Player
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)

  const loadSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const currentUser = session?.user ?? null
    setUser(currentUser)

    if (currentUser) {
      const player = await fetchPlayer(currentUser.id)
      setPlayer(player)
    } else {
      setPlayer(null)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadSession()

    const { subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          const player = await fetchPlayer(currentUser.id)
          setPlayer(player)
        } else {
          setPlayer(null)
        }

        setLoading(false)
      }
    ).data

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
    const { error } = await supabase.auth.updateUser({ password: newPassword })
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
  if (!context) {
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
