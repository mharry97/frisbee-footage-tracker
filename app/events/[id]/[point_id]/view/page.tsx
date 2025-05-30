"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Text,
  Button,
  HStack,
  IconButton,
  useDisclosure,
  Portal,
  Dialog,
  CloseButton
} from "@chakra-ui/react";
import Header from "@/components/header";
import { fetchDetailPoint } from "@/app/points/supabase";
import type {Player, PointDetailed} from "@/lib/supabase";
import OnPageVideoLink from "@/components/on-page-video-link";
import PointOverview from "@/app/events/[id]/[point_id]/view/components/point-overview";
import PossessionSection from "@/app/events/[id]/[point_id]/view/components/possession-section";
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
import {deletePossession, updatePossession} from "@/app/possessions/supabase";
import EditPossessionDialog from "@/app/events/[id]/[point_id]/view/components/edit-possession";
import {fetchPlayersForTeam} from "@/app/players/supabase";
import {AuthWrapper} from "@/components/auth-wrapper";

export default function PointView({
                                    params,
                                  }: {
  params: Promise<{ id: string; point_id: string }>;
}) {
  const { id, point_id } = React.use(params);

  const [point, setPoint] = useState<PointDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offencePlayers, setOffencePlayers] = useState<Player[]>([]);
  const [defencePlayers, setDefencePlayers] = useState<Player[]>([]);

  const editDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();

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

  useEffect(() => {
    async function loadPlayers() {
      if (!point || point.length === 0 || currentIndex >= point.length) return;

      const possession = point[currentIndex];
      if (!possession) return;

      const offence = await fetchPlayersForTeam(possession.offence_team || "");
      const defence = await fetchPlayersForTeam(possession.defence_team || "");
      setOffencePlayers(offence);
      setDefencePlayers(defence);
    }

    void loadPlayers();
  }, [point, currentIndex]);

  if (loading || point.length === 0) {
    return (
      <AuthWrapper>
        <Container maxW="4xl" py={8}>
          <Header title="Point Info" buttonText="Back" redirectUrl={`/events/${id}`} />
          <Text mt={8} color="white">
            {loading ? "Loading point data" : "No data found for this point yet."}
          </Text>
          {!loading && (
            <Button
              colorPalette="green"
              mt={6}
              onClick={() => window.location.href = `/events/${id}/${point_id}`}
            >
              Add Possession
            </Button>
          )}
        </Container>
      </AuthWrapper>
    );
  }

  const last = point[point.length - 1];
  const possession = point[currentIndex];
  const currentPossession = currentIndex+1;
  const possessionCount = point.length;
  const scorer = last.score_player_name || "Unknown";
  const possessionOutcome = possession.is_score ? "Score" : "Turnover";
  const lastOutcome = last.is_score ? "Score" : "Turnover";
  const outcome =
    last.is_score && last.offence_team === last.point_offence_team
      ? "Hold"
      : "Break";

  const refreshData = async () => {
    setLoading(true);
    const data = await fetchDetailPoint(point_id);
    setPoint(data);
    setLoading(false);
  };

  const handleUpdate = async (updated: Partial<PointDetailed>) => {
    try {
      const { point_id, possession_number } = possession;
      if (!point_id || possession_number == null) return;

      await updatePossession(point_id, possession_number, updated);
      await refreshData();
      editDisclosure.onClose();
    } catch (err) {
      console.error("Failed to update possession", err);
    }
  };

  // Test function for checking output

  // const handleUpdate = (updated: Partial<PointDetailed>) => {
  //   const possessionNumber = point[currentIndex]?.possession_number;
  //   const pointId = point[currentIndex]?.point_id;
  //
  //   if (!possessionNumber || !pointId) {
  //     console.warn("Missing possession number or point ID");
  //     return;
  //   }
  //
  //   const payload = {
  //     point_id: pointId,
  //     possession_number: possessionNumber,
  //     ...updated,
  //   };
  //
  //   console.log("Supabase update payload:", payload);
  //
  //   editDisclosure.onClose();
  // };

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
    throw_zone: Number(possession.turn_throw_zone) || 1,
    receive_zone: Number(possession.turn_receive_zone) || 1,
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

  const handleDelete = async () => {
    try {
      if (possession.possession_number == null) {
        console.warn("Possession number is missing");
        return;
      }
      await deletePossession(possession.point_id, possession.possession_number);
      setPoint((prev) =>
        prev.filter((p) => !(p.point_id === possession.point_id && p.possession_number === possession.possession_number))
      );
      setCurrentIndex((prev) => Math.max(prev - 1, 0)); // go back if on last possession
      deleteDisclosure.onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const DeleteConfirm = (
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Confirm Deletion</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            Are you sure you want to delete this possession? This cannot be undone.
          </Dialog.Body>

          <Dialog.Footer display="flex" justifyContent="space-between">
            <Button onClick={deleteDisclosure.onClose}>Cancel</Button>
            <Button colorPalette="red" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </Dialog.Footer>

          <Dialog.CloseTrigger asChild>
            <CloseButton position="absolute" top="2" right="2" onClick={deleteDisclosure.onClose} />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  )

  return (
    <AuthWrapper>
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
          <IconButton variant = "ghost" colorPalette="yellow" size="lg" onClick={handlePrev} disabled={currentIndex === 0}>
            <FaLongArrowAltLeft />
          </IconButton>
          <Text textAlign="center">
            Possession {currentIndex + 1} of {point.length}
          </Text>
          <IconButton variant = "ghost" colorPalette="yellow" size="lg" onClick={handleNext} disabled={currentIndex === point.length - 1}>
            <FaLongArrowAltRight />
          </IconButton>
        </HStack>
        <PossessionSection
          overview={overview}
          plays={plays}
          turnover={turnover}
        />
        {possessionOutcome == "Turnover" && currentPossession == possessionCount ? (
          <HStack justify="space-between">
            <Dialog.Root open={editDisclosure.open} onOpenChange={(open) => !open && editDisclosure.onClose()}>
              <Dialog.Trigger asChild>
                <Button onClick={editDisclosure.onOpen}>Edit</Button>
              </Dialog.Trigger>
              <EditPossessionDialog
                possession={possession}
                onClose={editDisclosure.onClose}
                onUpdate={handleUpdate}
                outcome={possessionOutcome}
                offence_player_list={offencePlayers}
                defence_player_list={defencePlayers}
              />
            </Dialog.Root>
            <Button colorPalette = "green" onClick={() => window.location.href = `/events/${id}/${point_id}`}>Add Next Possession</Button>
            <Dialog.Root open={deleteDisclosure.open} onOpenChange={(open) => !open && deleteDisclosure.onClose()}>
              <Dialog.Trigger asChild>
                <Button colorPalette="red" onClick={deleteDisclosure.onOpen}>
                  Delete
                </Button>
              </Dialog.Trigger>
              {DeleteConfirm}
            </Dialog.Root>
          </HStack>
        ) : possessionOutcome != "Turnover" && currentPossession == possessionCount ? (
          <HStack justify="space-between">
            <Dialog.Root open={editDisclosure.open} onOpenChange={(open) => !open && editDisclosure.onClose()}>
              <Dialog.Trigger asChild>
                <Button onClick={editDisclosure.onOpen}>Edit</Button>
              </Dialog.Trigger>
              <EditPossessionDialog
                possession={possession}
                onClose={editDisclosure.onClose}
                onUpdate={handleUpdate}
                outcome={possessionOutcome}
                offence_player_list={offencePlayers}
                defence_player_list={defencePlayers}
              />
            </Dialog.Root>
            <Dialog.Root open={deleteDisclosure.open} onOpenChange={(open) => !open && deleteDisclosure.onClose()}>
              <Dialog.Trigger asChild>
                <Button colorPalette="red" onClick={deleteDisclosure.onOpen}>
                  Delete
                </Button>
              </Dialog.Trigger>
              {DeleteConfirm}
            </Dialog.Root>
          </HStack>
        ) : (
          <HStack justify="space-between">
            <Dialog.Root open={editDisclosure.open} onOpenChange={(open) => !open && editDisclosure.onClose()}>
              <Dialog.Trigger asChild>
                <Button onClick={editDisclosure.onOpen}>Edit</Button>
              </Dialog.Trigger>
              <EditPossessionDialog
                possession={possession}
                onClose={editDisclosure.onClose}
                onUpdate={handleUpdate}
                outcome={possessionOutcome}
                offence_player_list={offencePlayers}
                defence_player_list={defencePlayers}
              />
            </Dialog.Root>
          </HStack>
        )}
      </Container>
    </AuthWrapper>
  );
}
