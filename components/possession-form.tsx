"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Box, Grid, GridItem, Text } from "@chakra-ui/react"
import { AddableSupabaseSelect } from "@/components/ui/drop-down-with-add"
import { fetchEvent } from "@/app/events/supabase"
import type { Event } from "@/lib/supabase"
import { getHomeTeam } from "@/app/teams/supabase"
import { BooleanSelect } from "@/components/ui/boolean-dropdown"
import { ThrowsCounter } from "@/components/ui/throw-counter"

type PossessionInfoProps = {
  mode: "Add" | "Edit"
  eventId: string
  possessionNumber?: number
  offenceTeam?: string
}

const PossessionForm: React.FC<PossessionInfoProps> = ({ mode, eventId, possessionNumber, offenceTeam }) => {
  const [defenceInit, setDefenceInit] = useState("")
  const [offenceInit, setOffenceInit] = useState("") // Added separate state for offence initiation
  const [timestamp, setTimestamp] = useState("")
  const [eventData, setEventData] = useState<Event | null>(null)
  const [homeTeam, setHomeTeam] = useState("")
  const [defenceInitSuccesful, setDefenceInitSuccesful] = useState("")
  const [offenceInitSuccesful, setOffenceInitSuccesful] = useState("")
  const [offenceMain, setOffenceMain] = useState("")
  const [defenceMain, setDefenceMain] = useState("")
  const [throws, setThrows] = useState(0)

  // Fetch event details once eventId is available.
  useEffect(() => {
    if (!eventId) return
    async function loadEvent() {
      const events = await fetchEvent(eventId)
      if (events.length > 0) {
        setEventData(events[0])
      }
    }
    loadEvent()
  }, [eventId])

  // Fetch home team once on mount.
  useEffect(() => {
    async function loadHomeTeam() {
      const teamName = await getHomeTeam()
      if (teamName) {
        setHomeTeam(teamName)
      }
    }
    loadHomeTeam()
  }, [])

  return (
    <Box p={6} rounded="md" bg="#1a1a1a" color="white" w="100%" position="relative">
      <Grid gap={4} templateColumns="repeat(2, 1fr)">
        <GridItem colSpan={2}>
          <Text textStyle="2xl">Possession Info</Text>
          {possessionNumber && offenceTeam && (
            <Text textStyle="md" color="gray.400" mt={1}>
              Possession #{possessionNumber} - Offense: {offenceTeam}
            </Text>
          )}
        </GridItem>
        <GridItem colSpan={2}>
          <Text textStyle="xl">Initiation Plays</Text>
        </GridItem>
        <GridItem>
          <AddableSupabaseSelect
            label="Defence Initiation"
            tableName="possessions"
            displayColumn="defence_init"
            value={defenceInit}
            onChange={setDefenceInit}
          />
        </GridItem>
        <GridItem>
          <BooleanSelect
            label="Defence Init. Success"
            value={defenceInitSuccesful}
            onChange={setDefenceInitSuccesful}
          />
        </GridItem>
        <GridItem>
          <AddableSupabaseSelect
            label="Offence Initiation"
            tableName="possessions"
            displayColumn="offence_init"
            value={offenceInit} // Changed from defenceInit to offenceInit
            onChange={setOffenceInit} // Changed from setDefenceInit to setOffenceInit
          />
        </GridItem>
        <GridItem>
          <BooleanSelect
            label="Offence Init. Success"
            value={offenceInitSuccesful}
            onChange={setOffenceInitSuccesful}
          />
        </GridItem>
        <GridItem colSpan={2}>
          <Text textStyle="xl">Main Plays</Text>
        </GridItem>
        <GridItem>
          <AddableSupabaseSelect
            label="Offence"
            tableName="possessions"
            displayColumn="offence_main"
            value={offenceMain}
            onChange={setOffenceMain}
          />
        </GridItem>
        <GridItem>
          <AddableSupabaseSelect
            label="Defence"
            tableName="possessions"
            displayColumn="defence_main"
            value={defenceMain}
            onChange={setDefenceMain}
          />
        </GridItem>
        <GridItem colSpan={2}>
          <ThrowsCounter initialValue={throws} onChange={setThrows} />
        </GridItem>
      </Grid>
    </Box>
  )
}

export default PossessionForm
