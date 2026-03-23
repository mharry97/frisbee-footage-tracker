"use client"

import { useState, useMemo } from "react"
import { AuthWrapper } from "@/components/auth-wrapper"
import { useAuth } from "@/lib/auth-context"
import StandardHeader from "@/components/standard-header"
import CustomTabs from "@/components/tabbed-page"
import { useQuery } from "@tanstack/react-query"
import { fetchStrategies } from "@/app/strategies/supabase"
import { StratGrid } from "@/app/strategies/components/strat-grid"
import LoadingSpinner from "@/components/ui/loading-spinner"
import FloatingActionButton from "@/components/ui/floating-plus"
import { AddStratModal } from "@/app/strategies/components/strategy-modal"

function StrategyPageContent() {
  const { player } = useAuth()
  const [open, setOpen] = useState(false)

  const { data: strats, isLoading } = useQuery({
    queryFn: fetchStrategies,
    queryKey: ["strats"],
  })

  const { offenceInitiationStrats, offenceMainStrats, defenceInitiationStrats, defenceMainStrats } = useMemo(() => {
    const all = strats ?? []
    return {
      offenceInitiationStrats: all.filter((s) => s.play_type === "offence_initiation"),
      offenceMainStrats: all.filter((s) => s.play_type === "offence_main"),
      defenceInitiationStrats: all.filter((s) => s.play_type === "defence_initiation"),
      defenceMainStrats: all.filter((s) => s.play_type === "defence_main"),
    }
  }, [strats])

  if (!player || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  const offenceContent = (
    <div className="flex flex-col gap-2">
      <p className="text-xl my-4">Initiation Plays</p>
      <StratGrid strats={offenceInitiationStrats} />
      <p className="text-xl my-4">Main Plays</p>
      <StratGrid strats={offenceMainStrats} />
    </div>
  )

  const defenceContent = (
    <div className="flex flex-col gap-2">
      <p className="text-xl my-4">Initiation Plays</p>
      {isLoading ? <LoadingSpinner text="Loading strats..." /> : <StratGrid strats={defenceInitiationStrats} />}
      <p className="text-xl my-4">Main Plays</p>
      {isLoading ? <LoadingSpinner text="Loading strats..." /> : <StratGrid strats={defenceMainStrats} />}
    </div>
  )

  const tabs = [
    { value: "defence", label: "Defence", content: defenceContent },
    { value: "offence", label: "Offence", content: offenceContent },
  ]

  return (
    <div>
      <StandardHeader text="Strategies" />
      <CustomTabs defaultValue="defence" tabs={tabs} />
      <FloatingActionButton onClick={() => setOpen(true)} iconType="add" />
      <AddStratModal isOpen={open} onClose={() => setOpen(false)} mode="add" />
    </div>
  )
}

export default function StrategyPage() {
  return (
    <AuthWrapper>
      <StrategyPageContent />
    </AuthWrapper>
  )
}
