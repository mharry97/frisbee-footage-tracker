"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Text,
  Button,
  HStack, IconButton,
} from "@chakra-ui/react";
import Header from "@/components/header";
import { fetchDetailPoint } from "@/app/points/supabase";
import type { PointDetailed } from "@/lib/supabase";
import OnPageVideoLink from "@/components/on-page-video-link";
import PointOverview from "@/app/events/[id]/[point_id]/view/components/point-overview";
import PossessionSection from "@/app/events/[id]/[point_id]/view/components/possession-section";
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";

export default function PointView({
                                    params,
                                  }: {
  params: Promise<{ id: string; point_id: string }>;
}) {
  const { id, point_id } = React.use(params);
  const [point, setPoint] = useState<PointDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  if (loading || point.length === 0) {
    return (
      <Container maxW="4xl" py={8}>
        <Header title="Point Info" buttonText="Back" redirectUrl={`/events/${id}`} />
        <Text mt={8} color="white">
          {loading ? "Loading..." : "No data found for this point."}
        </Text>
      </Container>
    );
  }

  const last = point[point.length - 1];
  const possession = point[currentIndex];
  const possessionCount = point.length;
  const scorer = last.score_player_name || "Unknown";
  const possessionOutcome = possession.is_score ? "Score" : "Turnover";
  const lastOutcome = last.is_score ? "Score" : "Turnover";
  const outcome =
    last.is_score && last.offence_team === last.point_offence_team
      ? "Hold"
      : "Break";

  const overview = {
    offence_team: possession.offence_team_name || "Unknown",
    throws: possession.throws || 0,
    outcome: lastOutcome,
  };

  const plays = {
    o_init: possession.offence_init || "None",
    o_main: possession.offence_main || "None",
    d_init: possession.defence_init || "None",
    d_main: possession.defence_main || "None",
  };

  const turnover = {
    throw_zone: possession.turn_throw_zone || "Unknown",
    receive_zone: possession.turn_receive_zone || "Unknown",
    thrower: possession.turn_thrower_name || "Unknown",
    receiver: possession.turn_intended_receiver_name || "Unknown",
    turnover_reason: possession.turnover_reason || "Unknown",
    d_player: possession.d_player_name || "None",
    scorer: possession.score_player_name || "Unknown",
    assister: possession.assist_player_name || "Unknown",
    method: possession.score_method || "Unknown",
    outcome: possession.is_score ? "Score" : "Turnover",
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, point.length - 1));
  };

  return (
    <Container maxW="4xl" py={8}>
      <Header title={point[0].event_name} buttonText="Back" redirectUrl={`/events/${id}`} />
      <Text mt={4} fontSize="lg" color="gray.400">
        {`Offence: ${point[0].point_offence_team_name}`}
      </Text>

      <PointOverview
        last_possession_type={lastOutcome}
        possessions={possessionCount}
        outcome={outcome}
        scorer={scorer}
      />

      <OnPageVideoLink url={point[0].timestamp_url!} />

      {/* Navigation controls */}
      <HStack justify="space-between" mt={5}>
        <IconButton variant = "ghost" colorPalette="yellow" size="lg" onClick={handlePrev} isDisabled={currentIndex === 0}>
          <FaLongArrowAltLeft />
        </IconButton>
        <Text textAlign="center">
          Possession {currentIndex + 1} of {point.length}
        </Text>
        <IconButton variant = "ghost" colorPalette="yellow" size="lg" onClick={handleNext} isDisabled={currentIndex === 0}>
          <FaLongArrowAltRight />
        </IconButton>
      </HStack>
      <PossessionSection
        overview={overview}
        plays={plays}
        turnover={turnover}
      />
      {possessionOutcome == "Turnover" && lastOutcome == "Turnover" ? (
        <HStack justify="space-between">
          <Button>Edit Possession</Button>
          <Button>Add Next Possession</Button>
        </HStack>
      ) : possessionOutcome == "Turnover" && lastOutcome != "Turnover" ? (
        <HStack justify="space-between">
          <Button>Edit Possession</Button>
        </HStack>
      ) : (
        <HStack justify="space-between">
          <Button>Edit Possession</Button>
          <Button colorPalette="red">Delete Possession</Button>
        </HStack>
      )}
    </Container>
  );
}
