"use client"

import { useState } from "react"
import { Box, Button, VStack, Text, Stack } from "@chakra-ui/react"
import { Radio, RadioGroup } from "@/components/ui/radio"
import PossessionForm from "@/components/possession-form"
import ScoreForm from "@/components/score-form"
import TurnoverForm from "@/components/turnover-form"
import type { FormEvent } from "react"

type Outcome = "score" | "turnover" | null

type Possession = {
  index: number
  outcome: Outcome
  offenceTeam: string
  defenceTeam: string
  number: number
}

type PossessionManagerProps = {
  eventId: string
  initialOffenceTeam: string
  team1: string
  team2: string
}

export default function PossessionManager({ eventId, initialOffenceTeam, team1, team2 }: PossessionManagerProps) {
  // Determine the initial defense team based on the initial offense team
  const initialDefenceTeam = initialOffenceTeam === team1 ? team2 : team1

  const [possessions, setPossessions] = useState<Possession[]>([
    {
      index: 0,
      outcome: null,
      offenceTeam: initialOffenceTeam,
      defenceTeam: initialDefenceTeam,
      number: 1,
    },
  ])
  const [isComplete, setIsComplete] = useState(false)
  const [nextIndex, setNextIndex] = useState(1) // Track the next index to use

  // Calculate the current offense team based on the number of possessions
  const getOffenceTeam = (possessionNumber: number, initialTeam: string) => {
    // If possession number is odd, it's the initial team
    // If possession number is even, it's the other team
    if (possessionNumber % 2 === 1) {
      return initialTeam
    } else {
      return initialTeam === team1 ? team2 : team1
    }
  }

  // Calculate the current defense team based on the offense team
  const getDefenceTeam = (offenceTeam: string) => {
    return offenceTeam === team1 ? team2 : team1
  }

  // Handle outcome selection for a specific possession
  const handleOutcomeChange = (possessionIndex: number, outcomeValue: string) => {
    // Convert the string value to our Outcome type
    const outcome: Outcome = outcomeValue === "score" ? "score" : outcomeValue === "turnover" ? "turnover" : null

    setPossessions((prev) => {
      const updatedPossessions = prev.map((p) => {
        if (p.index === possessionIndex) {
          return { ...p, outcome }
        }
        return p
      })

      // If turnover, add a new possession with the opposite team on offense
      if (outcome === "turnover") {
        const currentPossessionIdx = updatedPossessions.findIndex((p) => p.index === possessionIndex)
        const currentPossession = updatedPossessions[currentPossessionIdx]
        const nextPossessionNumber = currentPossession.number + 1

        // Switch offense and defense teams for the next possession
        const nextOffenceTeam = currentPossession.defenceTeam
        const nextDefenceTeam = currentPossession.offenceTeam

        // Only add a new possession if there isn't already one after this
        if (currentPossessionIdx === updatedPossessions.length - 1) {
          const newIndex = nextIndex
          setNextIndex(newIndex + 1)

          return [
            ...updatedPossessions,
            {
              index: newIndex,
              outcome: null,
              offenceTeam: nextOffenceTeam,
              defenceTeam: nextDefenceTeam,
              number: nextPossessionNumber,
            },
          ]
        }
      }

      // If score, mark the point as complete
      if (outcome === "score") {
        setIsComplete(true)
      }

      return updatedPossessions
    })
  }

  // Event handler for RadioGroup
  const handleRadioChange = (possessionIndex: number) => (event: FormEvent<HTMLDivElement>) => {
    // Extract the value from the event target
    // We need to cast the event target to HTMLInputElement to access the value property
    const target = event.target as HTMLInputElement
    if (target && target.value) {
      handleOutcomeChange(possessionIndex, target.value)
    }
  }

  // Prepare data for submission to Supabase
  const prepareDataForSubmission = () => {
    // Transform the possessions data for Supabase
    // We don't include the client-side index as Supabase will generate IDs
    const dataForSubmission = possessions.map((possession) => ({
      offence_team: possession.offenceTeam,
      defence_team: possession.defenceTeam,
      possession_number: possession.number,
      outcome: possession.outcome,
      // Add other fields as needed
    }))

    console.log("Data ready for Supabase:", dataForSubmission)
    // Here you would call your Supabase insertion function
  }

  return (
    <VStack gap={8} width="100%" align="stretch">
      {possessions.map((possession) => (
        <Box key={`possession-${possession.index}`}>
          <PossessionForm
            mode="Add"
            eventId={eventId}
            possessionNumber={possession.number}
            offenceTeam={possession.offenceTeam}
          />

          <Box mt={4}>
            <Text mb={2}>Select Outcome:</Text>
            <RadioGroup defaultValue={possession.outcome || undefined} onChange={handleRadioChange(possession.index)}>
              <Stack direction="row" gap={5}>
                <Radio value="score">Score</Radio>
                <Radio value="turnover">Turnover</Radio>
              </Stack>
            </RadioGroup>
          </Box>

          {possession.outcome === "score" && (
            <Box mt={4}>
              <ScoreForm
                possession={possession}
                possessionNumber={possession.number}
                offenceTeam={possession.offenceTeam}
              />
            </Box>
          )}

          {possession.outcome === "turnover" && (
            <Box mt={4}>
              <TurnoverForm
                possession={possession}
                possessionNumber={possession.number}
                offenceTeam={possession.offenceTeam}
                defenceTeam={possession.defenceTeam}
              />
            </Box>
          )}
        </Box>
      ))}

      <Button mt={4} colorScheme="green" disabled={!isComplete} onClick={prepareDataForSubmission}>
        Save Point
      </Button>
    </VStack>
  )
}
