"use client";

import React, {useEffect, useState} from "react";
import {
  Container,
  Text,
  Button,
  HStack,
  IconButton,
  useDisclosure,
  Portal,
  Dialog,
  CloseButton, Box
} from "@chakra-ui/react";
import { fetchPointPossessions } from "@/app/possessions/supabase";
import OnPageVideoLink from "@/components/on-page-video-link";
import PointOverview from "@/app/events/[id]/[point_id]/view/components/point-overview";
import PossessionSection from "@/app/events/[id]/[point_id]/view/components/possession-section";
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
import { deletePossession } from "@/app/possessions/supabase";
import EditPossessionDialog from "@/app/events/[id]/[point_id]/view/components/edit-possession";
import {useParams, useRouter} from "next/navigation";
import {useAuth} from "@/lib/auth-context.tsx";
import StandardHeader from "@/components/standard-header.tsx";
import {AuthWrapper} from "@/components/auth-wrapper.tsx";
import {baseUrlToTimestampUrl} from "@/lib/utils.ts";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {fetchPoint} from "@/app/points/supabase.ts";

function PointViewContent() {
  const { id, point_id } = useParams<{ id: string; point_id: string }>()
  const queryClient = useQueryClient()
  const router = useRouter();
  const { player } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(0);

  const editDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();

  const { data: possessionPageData, isLoading } = useQuery({
    queryKey: ["possessions"],
    queryFn: async () => {
      const pointData = await fetchPoint(point_id)
      if (!pointData) {
        throw new Error("Point not found.");
      }
      const possessionsData = await fetchPointPossessions(point_id)
      return {
        point: pointData,
        possessions: possessionsData
      }
    }
  })

  const { point, possessions } = possessionPageData || {
    point: null,
    possessions: [],
  };

  interface DeletePossessionVars {
    possessionNumber: number;
    pointId: string;
  }

  const { mutate: deletePossessionMutation, isPending: isDeleting } = useMutation({
    mutationFn: (variables: DeletePossessionVars) =>
      deletePossession(variables.pointId, variables.possessionNumber),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["possessions"] });
      deleteDisclosure.onClose();
    },
    onError: (error) => {
      console.error("Failed to delete possession:", error);
    }
  });

  const handleDeleteConfirm = () => {
    if (!point) return;

    deletePossessionMutation({
      possessionNumber: currentIndex + 1,
      pointId: point.point_id,
    });
  };

  useEffect(() => {
    if (possessions && currentIndex >= possessions.length) {
      setCurrentIndex(Math.max(0, possessions.length - 1));
    }
  }, [possessions, currentIndex]);


  if (!player || isLoading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading player data...</Text>
      </Box>
    )
  }
  if (!point ) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">No point data found</Text>
      </Box>
    )
  }

  if (possessions.length === 0) {
    return (
          <Container maxW="4xl" py={8}>
            <StandardHeader text="Point Info" is_admin={player.is_admin} />
            <Text mt={8} color="white">
              {isLoading ? "Loading point data" : "No data found for this point yet."}
            </Text>
            {!isLoading && (
              <Button
                colorPalette="green"
                mt={6}
                onClick={() => window.location.href = `/events/${id}/${point_id}`}
              >
                Add Possession
              </Button>
            )}
          </Container>
    );
  }

  const last = possessions[possessions.length - 1];
  const possession = possessions[currentIndex];
  const currentPossession = currentIndex+1;
  const possessionCount = possessions.length;
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
    o_init: possession.offence_init_name || "None",
    o_main: possession.offence_main_name || "None",
    d_init: possession.defence_init_name || "None",
    d_main: possession.defence_main_name || "None",
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
    setCurrentIndex((prev) => Math.min(prev + 1, possessions.length - 1));
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
            <Button colorPalette="red"
                    onClick={handleDeleteConfirm}
                    loading={isDeleting}>
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
    <Container maxW="4xl" py={8}>
      <StandardHeader text={point.event_name} is_admin={player.is_admin} />
      <Text mt={4} fontSize="lg" color="gray.400">
        {`Offence: ${point.offence_team_name}`}
      </Text>

      <PointOverview
        last_possession_type={lastOutcome}
        possessions={possessionCount}
        outcome={outcome}
        scorer={scorer}
      />

      <OnPageVideoLink url={baseUrlToTimestampUrl(point.base_url, point.timestamp)} />

      {/* Navigation controls */}
      <HStack justify="space-between" mt={5}>
        <IconButton variant = "ghost" colorPalette="yellow" size="lg" onClick={handlePrev} disabled={currentIndex === 0}>
          <FaLongArrowAltLeft />
        </IconButton>
        <Text textAlign="center">
          Possession {currentIndex + 1} of {possessions.length}
        </Text>
        <IconButton variant = "ghost" colorPalette="yellow" size="lg" onClick={handleNext} disabled={currentIndex === possessions.length - 1}>
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
              onClose={editDisclosure.onClose}
              possessionNumber = {currentIndex + 1}
              pointId = {point.point_id}
            />
          </Dialog.Root>
          <Button colorPalette = "green" onClick={() => router.push(`/events/${id}/${point_id}`)}>Add Next Possession</Button>
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
              onClose={editDisclosure.onClose}
              possessionNumber = {currentIndex + 1}
              pointId = {point.point_id}
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
              onClose={editDisclosure.onClose}
              possessionNumber = {currentIndex + 1}
              pointId = {point.point_id}
            />
          </Dialog.Root>
        </HStack>
      )}
    </Container>
  );
}

export default function PointView() {
  return (
    <AuthWrapper>
      <PointViewContent />
    </AuthWrapper>
  )
}
