import { redirect } from "next/navigation"

export default function Home() {
  // In a real app, you would check for authentication here
  // If not authenticated, show login page
  // For now, we'll redirect to the dashboard
  redirect("/dashboard")
}
