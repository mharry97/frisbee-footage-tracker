"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stat,
} from "@chakra-ui/react";
import Header from "@/components/header";
import { fetchDetailPoint } from "@/app/points/supabase";
import type { PointDetailed } from "@/lib/supabase";
import {WatchButton} from "@/components/watch-button";
import {getFootageProvider} from "@/lib/utils";

export default function PointView({
                                    params,
                                  }: {
  params: Promise<{ id: string, point_id: string }>;
}) {
  const { id, point_id } = React.use(params);
  const [point, setPoint] = useState<PointDetailed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!point_id) return;

    const load = async () => {
      setLoading(true);
      const data = await fetchDetailPoint(point_id);
      setPoint(data);
      setLoading(false);
    };

    void load();
  }, [point_id]);

  const highlight = { color: "gray.400", fontWeight: "bold" };

  if (loading || point.length === 0) {
    return (
      <Container maxW="4xl" py={8}>
        <Header title={`Point Info}`} buttonText="event" redirectUrl="/playlists" />
        <Text mt={8} color="white">
          {loading ? "Loading..." : "No data found for this point."}
        </Text>
      </Container>
    );
  }

  const last = point[point.length - 1];
  const possessionCount = point.length;
  const totalThrows = point.reduce((sum, p) => sum + (p.throws ?? 0), 0);
  const avgThrows = (totalThrows / possessionCount).toFixed(1);

  const outcome =
    last.is_score && last.offence_team === last.point_offence_team ? "Hold" : "Break";

  const offenceInit = point[0].offence_init || "N/A";
  const offenceMain = point[0].offence_main || "N/A";
  const defenceInit = point[0].defence_init || "N/A";
  const defenceMain = point[0].defence_main || "N/A";

  const scorePlayer = last.score_player_name || "Unknown";
  const assistPlayer = last.assist_player_name || null;

  const sourceHost = getFootageProvider(point[0].timestamp_url!)
  console.log(point[0].timestamp_url)
  console.log(sourceHost)

  return (
    <Container maxW="4xl" py={8}>
      <Header title="Point info" buttonText="event" redirectUrl={`/events/${id}`} />
      {sourceHost != "youtube" && sourceHost != "google_drive" ? (
        <WatchButton url={point[0].timestamp_url!} />
      ) :  (
        <iframe
          src={point[0].timestamp_url!}
          width="100%"
          height="315"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ marginTop: "16px" }}
        ></iframe>
      )}
      <Box mt={8} divideY="2px" divideColor="gray.600">
        {/* Outcome */}
        <Box py={4}>
          <Heading size="md" color="white" mb={2}>
            Outcome:
          </Heading>
          <Text fontSize="lg">
            <Text as="span" {...highlight}>
              {outcome}
            </Text>{" "}
            — by {last.point_offence_team_name || "Unknown Team"}
          </Text>
        </Box>

        {/* Stats */}
        <Box py={4}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Stat.Root>
              <Stat.Label color="white">Possessions</Stat.Label>
              <Stat.ValueText color="yellow.400" fontWeight="bold">
                {possessionCount}
              </Stat.ValueText>
            </Stat.Root>

            <Stat.Root>
              <Stat.Label color="white">Turns</Stat.Label>
              <Stat.ValueText color="yellow.400" fontWeight="bold">
                {Math.max(possessionCount - 1, 0)}
              </Stat.ValueText>
            </Stat.Root>

            <Stat.Root>
              <Stat.Label color="white">Avg Throws per Possession</Stat.Label>
              <Stat.ValueText color="yellow.400" fontWeight="bold">
                {avgThrows}
              </Stat.ValueText>
            </Stat.Root>
          </SimpleGrid>
        </Box>

        {/* Tactics */}
        <Box py={4}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box>
              <Heading size="sm" color="white" mb={1}>
                Offensive Tactics
              </Heading>
              <Text {...highlight}>Init: {offenceInit}</Text>
              <Text {...highlight}>Main: {offenceMain}</Text>
            </Box>
            <Box>
              <Heading size="sm" color="white" mb={1}>
                Defensive Tactics
              </Heading>
              <Text {...highlight}>Init: {defenceInit}</Text>
              <Text {...highlight}>Main: {defenceMain}</Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Scoring Play */}
        <Box py={4}>
          <Heading size="sm" color="white" mb={1}>
            Scoring Play
          </Heading>
          <Text fontSize="lg">
            Scored by{" "}
            <Text as="span" {...highlight}>
              {scorePlayer}
            </Text>
            {assistPlayer && (
              <>
                {" "}from{" "}
                <Text as="span" {...highlight}>
                  {assistPlayer}
                </Text>
              </>
            )}
          </Text>
        </Box>
      </Box>
    </Container>
  );
}
