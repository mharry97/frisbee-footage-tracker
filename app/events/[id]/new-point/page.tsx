"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Input,
  NativeSelect,
  Button,
  Flex,
  SimpleGrid,
} from "@chakra-ui/react";
import { Field } from "@chakra-ui/react"; // adjust import if needed
import { fetchSources } from "@/app/sources/supabase";
import type { Source, Event, Player } from "@/lib/supabase";
import { useToast } from "@chakra-ui/toast";
import Header from "@/components/header";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { fetchEvent } from "@/app/events/supabase";
import { fetchBaseTeamInfo } from "@/app/teams/supabase";
import type { BaseTeamInfo } from "@/app/teams/supabase";
import { fetchHomePlayers } from "@/app/players/supabase";
import { writePoint, writePointPlayers } from "./supabase";
import { useRouter } from "next/navigation";
import { getFootageProvider, convertTimestampToSeconds, convertYoutubeUrlToEmbed } from "@/lib/utils";

// Main helper: computes the timestamp_url based on the footage provider.
function getTimestampUrl(sourceUrl: string, timestamp: string): string {
  const provider = getFootageProvider(sourceUrl);
  if (provider === "veo") {
    return `${sourceUrl}#t=${timestamp}`;
  } else if (provider === "youtube") {
    const seconds = convertTimestampToSeconds(timestamp);
    return convertYoutubeUrlToEmbed(sourceUrl, seconds);
  } else if (provider === "google_drive") {
    const seconds = convertTimestampToSeconds(timestamp);
    const separator = sourceUrl.includes('?') ? '&' : '?';
    return `${sourceUrl}${separator}start=${seconds}`;
  } else {
    return sourceUrl;
  }
}

export default function EventPage({
                                    params,
                                  }: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap the promised params (assumed supported in your environment)
  const { id } = React.use(params);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [timestamp, setTimestamp] = useState("");
  const [homePlayers, setHomePlayers] = useState<Player[]>([]);
  const [offenceTeam, setOffenceTeam] = useState("");
  const [eventData, setEventData] = useState<Event | null>(null);
  const [teamData, setTeamData] = useState<BaseTeamInfo[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(Array(7).fill(""));

  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Get all the required data
        const sourcesData = await fetchSources();
        setSources(sourcesData);

        const eventData = await fetchEvent(id);
        setEventData(eventData);
        if (eventData) {
          // Fetch team info for both teams and combine them
          const team1Data = await fetchBaseTeamInfo(eventData.team_1_id);
          const team2Data = await fetchBaseTeamInfo(eventData.team_2_id);
          const teams: BaseTeamInfo[] = [];
          if (team1Data) teams.push(team1Data);
          if (team2Data) teams.push(team2Data);
          setTeamData(teams);
        }

        // Fetch home team players from Supabase
        const homePlayers = await fetchHomePlayers();
        setHomePlayers(homePlayers);

        setLoading(false);
      } catch (error: any) {
        console.error("Error loading data:", error);
        toast({
          title: "Error loading data",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
      }
    }
    fetchData();
  }, [id, toast]);

  // Check if any of the teams is the home team (required for showing the player fields)
  const hasHomeTeam = teamData.some((team) => team.is_home_team);

  // Compute the defence team based on teamData and the selected offenceTeam.
  const computedDefenceTeam = (() => {
    // Match o and d team for scrimmages
    if (teamData.length < 2 || teamData[0].team_id === teamData[1].team_id) {
      return offenceTeam;
    }
    // Else find d team
    const foundTeam = teamData.find((team) => team.team_id !== offenceTeam);
    return foundTeam ? foundTeam.team_id : offenceTeam;
  })();

  // Cancel action just redirects without saving anything
  const handleCancel = () => {
    router.push(`/events/${id}`);
  };

  // WRITE TO SUPABASE
  const handleAdd = async () => {
    try {
      // Find the source URL from the sources list based on the selected source id
      const sourceUrl = sources.find((s) => s.id === source)?.url || "";
      // Calculate the timestamp_url using the helper function
      const timestamp_url = getTimestampUrl(sourceUrl, timestamp);


      // Assemble all the form data in respective objects.
      const pointData = {
        event_id: id,
        source_id: source,
        timestamp,
        offence_team: offenceTeam,
        defence_team: computedDefenceTeam,
        timestamp_url
      };

      const insertedPoints = await writePoint(pointData);
      const point_id = insertedPoints[0].point_id;

      // Deconstruct array into different row for each player
      const pointPlayersData = selectedPlayers
        .filter((playerId) => playerId)
        .map((playerId) => ({
          point_id,
          player_id: playerId,
        }));

      await writePointPlayers(pointPlayersData);

      // On success, redirect to the point page:
      router.push(`/events/${id}/${point_id}`);
    } catch (error) {
      console.error("Error writing data:", error);
      toast({
        title: "Error saving data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Container maxW="4xl" mt={20}>
        <LoadingSpinner text="Loading point form..." />
      </Container>
    );
  }

  return (
    <Container maxW="4xl">
      <Header
        title="Point Form"
        buttonText="event"
        redirectUrl={`/events/${id}`}
      />

      {/* Source Dropdown */}
      <Field.Root mb={4}>
        <Field.Label>Source</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field
            placeholder="Select Source"
            value={source}
            onChange={(e) => setSource(e.currentTarget.value)}
          >
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>

      {/* Timestamp Input */}
      <Field.Root mb={4}>
        <Field.Label>Timestamp</Field.Label>
        <Input
          placeholder="e.g. 6:32"
          value={timestamp}
          onChange={(e) => setTimestamp(e.currentTarget.value)}
        />
      </Field.Root>

      {/* Offence Team Dropdown */}
      <Field.Root mb={4}>
        <Field.Label>Offence Team</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field
            placeholder="Select Offence Team"
            value={offenceTeam}
            onChange={(e) => setOffenceTeam(e.currentTarget.value)}
          >
            {teamData.map((t) => (
              <option key={t.team_id} value={t.team_id}>
                {t.team_name}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>

      {/* Player Dropdowns (only if a home team exists) */}
      {hasHomeTeam && (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          {Array.from({ length: 7 }).map((_, index) => (
            <Field.Root mb={4} key={index}>
              <Field.Label>{`Player ${index + 1}`}</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  placeholder={`Select Player ${index + 1}`}
                  value={selectedPlayers[index]}
                  onChange={(e) => {
                    const newSelections = [...selectedPlayers];
                    newSelections[index] = e.currentTarget.value;
                    setSelectedPlayers(newSelections);
                  }}
                >
                  {homePlayers.map((p) => (
                    <option key={p.player_id} value={p.player_id}>
                      {p.player_name}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
          ))}
        </SimpleGrid>
      )}

      {/* Add and Cancel buttons */}
      <Flex flexDirection="row" justifyContent="space-between" mb={4}>
        <Field.Root>
          <Button onClick={handleCancel}>Cancel</Button>
        </Field.Root>
        <Field.Root>
          <Button onClick={handleAdd} colorPalette="green">
            Add
          </Button>
        </Field.Root>
      </Flex>
    </Container>
  );
}
