"use client"

import type React from "react"
import { useState } from "react"
import { Box, Grid, GridItem, Text } from "@chakra-ui/react"
import { AddableSupabaseSelect } from "@/components/ui/drop-down-with-add"
import { BooleanSelect } from "@/components/ui/boolean-dropdown"
import { ThrowsCounter } from "@/components/ui/throw-counter"

type PossessionInfoProps = {
  possessionNumber?: number
  offenceTeam?: string
}

const PossessionForm: React.FC<PossessionInfoProps> = ({ possessionNumber, offenceTeam }) => {
  const [defenceInit, setDefenceInit] = useState("")
  const [offenceInit, setOffenceInit] = useState("")
  const [defenceInitSuccessful, setDefenceInitSuccessful] = useState("")
  const [offenceInitSuccessful, setOffenceInitSuccessful] = useState("")
  const [offenceMain, setOffenceMain] = useState("")
  const [defenceMain, setDefenceMain] = useState("")
  const [throws, setThrows] = useState(0)

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
            value={defenceInitSuccessful}
            onChange={setDefenceInitSuccessful}
          />
        </GridItem>
        <GridItem>
          <AddableSupabaseSelect
            label="Offence Initiation"
            tableName="possessions"
            displayColumn="offence_init"
            value={offenceInit}
            onChange={setOffenceInit}
          />
        </GridItem>
        <GridItem>
          <BooleanSelect
            label="Offence Init. Success"
            value={offenceInitSuccessful}
            onChange={setOffenceInitSuccessful}
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
