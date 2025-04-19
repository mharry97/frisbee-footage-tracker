"use client"

import { useState } from "react"
import { Box, Text, Image, GridItem, Grid } from "@chakra-ui/react"
import { AddableSupabaseSelect } from "@/components/ui/drop-down-with-add"
import { SupabaseSelect } from "@/components/ui/standard-dropdown"

type TurnoverFormProps = {
  possession?: any
  possessionNumber?: number
  offenceTeam?: string
  defenceTeam?: string
  onDataChange?: (data: TurnoverData) => void
}

// Define a type for the turnover data
export type TurnoverData = {
  throwZone: string
  receiveZone: string
  thrower: string
  intendedReceiver: string
  turnoverReason: string
  dPlayer: string
}

export default function TurnoverForm({
                                       possession,
                                       possessionNumber = 1,
                                       offenceTeam = "Unknown",
                                       defenceTeam = "Unknown",
                                       onDataChange,
                                     }: TurnoverFormProps) {
  // State for form fields
  const [throwZone, setThrowZone] = useState("")
  const [receiveZone, setReceiveZone] = useState("")
  const [thrower, setThrower] = useState("")
  const [intendedReceiver, setIntendedReceiver] = useState("")
  const [turnoverReason, setTurnoverReason] = useState("")
  const [dPlayer, setDPlayer] = useState("")

  // Function to notify parent component of data changes
  const notifyDataChange = () => {
    if (onDataChange) {
      onDataChange({
        throwZone,
        receiveZone,
        thrower,
        intendedReceiver,
        turnoverReason,
        dPlayer,
      })
    }
  }

  // Update state and notify parent when a field changes
  const handleThrowZoneChange = (value: string) => {
    setThrowZone(value)
    notifyDataChange()
  }

  const handleReceiveZoneChange = (value: string) => {
    setReceiveZone(value)
    notifyDataChange()
  }

  const handleThrowerChange = (value: string) => {
    setThrower(value)
    notifyDataChange()
  }

  const handleIntendedReceiverChange = (value: string) => {
    setIntendedReceiver(value)
    notifyDataChange()
  }

  const handleTurnoverReasonChange = (value: string) => {
    setTurnoverReason(value)
    notifyDataChange()
  }

  const handleDPlayerChange = (value: string) => {
    setDPlayer(value)
    notifyDataChange()
  }

  return (
    <Box p={6} rounded="md" bg="#1a1a1a" color="white" w="100%" position="relative">
      <Grid gap={4} templateColumns="repeat(2, 1fr)">
        <GridItem colSpan={2}>
          <Text textStyle="md" color="gray.400">
            Turnover Info
          </Text>
        </GridItem>
        <GridItem colSpan={2}>
          <Image height="200px" src="/pitch-zoned.png" alt="Field position" />
        </GridItem>
        <GridItem>
          <SupabaseSelect
            label="Thrown From"
            tableName="possessions"
            displayColumn="turn_throw_zone"
            value={throwZone}
            onChange={handleThrowZoneChange}
          />
        </GridItem>
        <GridItem>
          <SupabaseSelect
            label="Intended Receiver Catch Zone"
            tableName="possessions"
            displayColumn="turn_receive_zone"
            value={receiveZone}
            onChange={handleReceiveZoneChange}
          />
        </GridItem>
        <GridItem>
          <AddableSupabaseSelect
            label="Turn Thrower"
            tableName="players"
            displayColumn="player_name"
            // Removed valueColumn to use displayColumn as the value
            filterColumn="team_name"
            filterValue={offenceTeam}
            value={thrower}
            onChange={handleThrowerChange}
          />
        </GridItem>
        <GridItem>
          <AddableSupabaseSelect
            label="Turn Intended Receiver"
            tableName="players"
            displayColumn="player_name"
            filterColumn="team_name"
            filterValue={offenceTeam}
            value={intendedReceiver}
            onChange={handleIntendedReceiverChange}
          />
        </GridItem>
        <GridItem>
          <SupabaseSelect
            label="Turnover Reason"
            tableName="possessions"
            displayColumn="turnover_reason"
            value={turnoverReason}
            onChange={handleTurnoverReasonChange}
          />
        </GridItem>
        <GridItem>
          <AddableSupabaseSelect
            label="D Player (if applicable)"
            tableName="players"
            displayColumn="player_name"

            filterColumn="team_name"
            filterValue={defenceTeam}
            value={dPlayer}
            onChange={handleDPlayerChange}
          />
        </GridItem>
      </Grid>
    </Box>
  )
}
