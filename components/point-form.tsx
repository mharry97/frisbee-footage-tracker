"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Box, Grid, GridItem, Text } from "@chakra-ui/react"
import { SupabaseSelect } from "@/components/ui/standard-dropdown"
import { TextInput } from "@/components/ui/text-input"
import { fetchEvent } from "@/app/events/supabase"
import type { Event } from "@/lib/supabase"
import { getHomeTeam } from "@/app/teams/supabase"

type BaseInfoProps = {
  mode: "Add" | "Edit"
  eventId: string
  onOffenceTeamChange?: (team: string) => void
}

const PointForm: React.FC<BaseInfoProps> = ({ mode, eventId, onOffenceTeamChange }) => {
  const [sourceId, setSourceId] = useState("")
  const [timestamp, setTimestamp] = useState("")
  const [offenceTeam, setOffenceTeam] = useState("")
  const [eventData, setEventData] = useState<Event | null>(null)
  const [homeTeam, setHomeTeam] = useState("")
  const [selectedPlayer, setSelectedPlayer] = useState("")

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

  // Handle offense team change and notify parent component
  const handleOffenceTeamChange = (team: string) => {
    setOffenceTeam(team)
    if (onOffenceTeamChange) {
      onOffenceTeamChange(team)
    }
  }

  return (
    <Box p={6} rounded="md" bg="#1a1a1a" color="white" w="100%" position="relative">
      <Grid gap={4} templateColumns="repeat(2, 1fr)">
        {mode === "Add" ? (
          <GridItem colSpan={2}>
            <Text textStyle="2xl">New Point</Text>
          </GridItem>
        ) : (
          <GridItem colSpan={2}>
            <Text textStyle="2xl">Point Info</Text>
          </GridItem>
        )}
        <GridItem colSpan={2}>
          <SupabaseSelect
            label="Source Name"
            tableName="sources"
            displayColumn="title"
            valueColumn="id"
            value={sourceId}
            onChange={setSourceId}
            isRequired
          />
        </GridItem>
        <GridItem>
          <TextInput label="Timestamp" value={timestamp} onChange={setTimestamp} placeholder="e.g. 10:34" isRequired />
        </GridItem>
        <GridItem>
          <SupabaseSelect
            label="Offence Team"
            tableName="event_teams"
            displayColumn="team_name"
            valueColumn="team_name"
            value={offenceTeam}
            onChange={handleOffenceTeamChange}
            isRequired
            filterColumn="event_id"
            filterValue={eventId}
          />
        </GridItem>
        {eventData && homeTeam && eventData.team_1 === homeTeam && (
          <>
            <GridItem>
              <SupabaseSelect
                label="Player 1"
                tableName="players"
                displayColumn="player_name"
                valueColumn="player_id"
                value={selectedPlayer}
                onChange={setSelectedPlayer}
                filterColumn="team_name"
                filterValue={homeTeam}
              />
            </GridItem>
            <GridItem>
              <SupabaseSelect
                label="Player 2"
                tableName="players"
                displayColumn="player_name"
                valueColumn="player_id"
                value={selectedPlayer}
                onChange={setSelectedPlayer}
                filterColumn="team_name"
                filterValue={homeTeam}
              />
            </GridItem>
            <GridItem>
              <SupabaseSelect
                label="Player 3"
                tableName="players"
                displayColumn="player_name"
                valueColumn="player_id"
                value={selectedPlayer}
                onChange={setSelectedPlayer}
                filterColumn="team_name"
                filterValue={homeTeam}
              />
            </GridItem>
            <GridItem>
              <SupabaseSelect
                label="Player 4"
                tableName="players"
                displayColumn="player_name"
                valueColumn="player_id"
                value={selectedPlayer}
                onChange={setSelectedPlayer}
                filterColumn="team_name"
                filterValue={homeTeam}
              />
            </GridItem>
            <GridItem>
              <SupabaseSelect
                label="Player 5"
                tableName="players"
                displayColumn="player_name"
                valueColumn="player_id"
                value={selectedPlayer}
                onChange={setSelectedPlayer}
                filterColumn="team_name"
                filterValue={homeTeam}
              />
            </GridItem>
            <GridItem>
              <SupabaseSelect
                label="Player 6"
                tableName="players"
                displayColumn="player_name"
                valueColumn="player_id"
                value={selectedPlayer}
                onChange={setSelectedPlayer}
                filterColumn="team_name"
                filterValue={homeTeam}
              />
            </GridItem>
            <GridItem>
              <SupabaseSelect
                label="Player 7"
                tableName="players"
                displayColumn="player_name"
                valueColumn="player_id"
                value={selectedPlayer}
                onChange={setSelectedPlayer}
                filterColumn="team_name"
                filterValue={homeTeam}
              />
            </GridItem>
          </>
        )}
      </Grid>
    </Box>
  )
}

export default PointForm
