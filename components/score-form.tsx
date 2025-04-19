"use client"

import { useState } from "react"
import { Box, Grid, GridItem, Text } from "@chakra-ui/react"
import { AddableSupabaseSelect } from "@/components/ui/drop-down-with-add"
import { BooleanSelect } from "@/components/ui/boolean-dropdown"

type ScoreFormProps = {
  possession?: any
  possessionNumber?: number
  offenceTeam?: string
  onDataChange?: (data: ScoreData) => void
}

// Define a type for the score data
export type ScoreData = {
  scoringPlay: string
  assistType: string
  contested: string
  huck: string
}

export default function ScoreForm({
                                    possession,
                                    possessionNumber = 1,
                                    offenceTeam = "Unknown",
                                    onDataChange,
                                  }: ScoreFormProps) {
  // State for form fields
  const [scoringPlay, setScoringPlay] = useState("")
  const [assistType, setAssistType] = useState("")
  const [contested, setContested] = useState("")
  const [huck, setHuck] = useState("")

  // Function to notify parent component of data changes
  const notifyDataChange = () => {
    if (onDataChange) {
      onDataChange({
        scoringPlay,
        assistType,
        contested,
        huck,
      })
    }
  }

  // Update state and notify parent when a field changes
  const handleScoringPlayChange = (value: string) => {
    setScoringPlay(value)
    notifyDataChange()
  }

  const handleAssistTypeChange = (value: string) => {
    setAssistType(value)
    notifyDataChange()
  }

  const handleContestedChange = (value: string) => {
    setContested(value)
    notifyDataChange()
  }

  const handleHuckChange = (value: string) => {
    setHuck(value)
    notifyDataChange()
  }

  return (
    <Box p={6} rounded="md" bg="#1a1a1a" color="white" w="100%" position="relative">
      <Grid gap={4} templateColumns="repeat(2, 1fr)">
        <GridItem colSpan={2}>
          <Text textStyle="md" color="gray.400">
            Score Info
          </Text>
        </GridItem>
        <GridItem>
          <AddableSupabaseSelect
            label="Scoring Play"
            tableName="possessions"
            displayColumn="scoring_play"
            value={scoringPlay}
            onChange={handleScoringPlayChange}
          />
        </GridItem>
        <GridItem>
          <AddableSupabaseSelect
            label="Assist Type"
            tableName="possessions"
            displayColumn="assist_type"
            value={assistType}
            onChange={handleAssistTypeChange}
          />
        </GridItem>
        <GridItem>
          <BooleanSelect label="Contested" value={contested} onChange={handleContestedChange} />
        </GridItem>
        <GridItem>
          <BooleanSelect label="Huck" value={huck} onChange={handleHuckChange} />
        </GridItem>
      </Grid>
    </Box>
  )
}
