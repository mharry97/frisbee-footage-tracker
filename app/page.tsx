"use client"

import React, { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Input, Button, VStack, Text, Container } from "@chakra-ui/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const { login, user } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(username, password)
      router.push("/dashboard")
    } catch (error: any) {
      console.log(error.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="4xl" centerContent py={20}>
      <VStack gap={6} align="center" maxW="sm" w="full">
        <Text fontSize="4xl" fontWeight="light" color="white">
          Footage Tracker
        </Text>

        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          <VStack gap={4} w="full">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <Button type="submit" colorScheme="green" loading={loading} disabled={loading} w="full">
              Login
            </Button>
          </VStack>
        </form>
      </VStack>
    </Container>
  )
}
