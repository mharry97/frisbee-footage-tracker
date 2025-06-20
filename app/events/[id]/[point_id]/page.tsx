"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Text,
  Button,
  HStack,
  Image,
  Field,
  NativeSelect, Box,
} from "@chakra-ui/react";
import {
  fetchPointById,
  fetchOMainPlays,
  fetchDMainPlays,
  fetchOInitPlays,
  fetchDInitPlays,
  type Play, fetchPossessionsForPoint,
} from "@/app/events/[id]/[point_id]/supabase";
import type { Point, Player} from "@/lib/supabase";
import type { Event } from "@/app/events/supabase";
import { useToast } from "@chakra-ui/toast";
import { getTeamName } from "@/lib/utils";
import FloatingClipButton from "@/components/ui/add-clip-button";
import { fetchEvent } from "@/app/events/supabase";
import { BaseTeamInfo, fetchTeamMapping } from "@/app/teams/supabase";
import CustomDropdownInput from "@/app/events/[id]/[point_id]/components/custom-dropdown-with-add";
import {fetchPlayersForTeam} from "@/app/teams/[team_id]/[player_id]/supabase";
import { writePossession} from "@/app/events/[id]/[point_id]/supabase";
import {getOrCreatePlayerId} from "@/app/events/[id]/[point_id]/components/get-or-create-player-id";
import { AddClipModal } from "@/app/clips/components/add-clip-modal";
import OnPageVideoLink from "@/components/on-page-video-link";
import ThrowCounter from "@/components/throws-input";
import StandardHeader from "@/components/standard-header.tsx";
import {useAuth} from "@/lib/auth-context.tsx";
import {AuthWrapper} from "@/components/auth-wrapper.tsx";
import {useParams} from "next/navigation";


function PointPageContent() {
  // Unwrap the promised params
  const { id, point_id } = useParams<{ id: string; point_id: string }>()
  const { player } = useAuth()
  const [loading, setLoading] = useState(true);
  const [pointData, setPointData] = useState<Point[]>([]);
  const [eventData, setEventData] = useState<Event | null>(null);
  const [teamMapping, setTeamMapping] = useState<BaseTeamInfo[]>([]);
  const [dMainPlays, setDMainPlays] = useState<Play[]>([]);
  const [oMainPlays, setOMainPlays] = useState<Play[]>([]);
  const [dInitPlays, setDInitPlays] = useState<Play[]>([]);
  const [oInitPlays, setOInitPlays] = useState<Play[]>([]);
  const [dMainPlay, setDMainPlay] = useState("");
  const [oMainPlay, setOMainPlay] = useState("");
  const [dInitPlay, setDInitPlay] = useState("");
  const [oInitPlay, setOInitPlay] = useState("");
  const [numThrows, setNumThrows] = useState("");
  const [defencePlayers, setDefencePlayers] = useState<Player[]>([]);
  const [offencePlayers, setOffencePlayers] = useState<Player[]>([]);
  const [turnoverThrower, setTurnoverThrower] = useState("");
  const [turnoverReceiver, setTurnoverReceiver] = useState("");
  const [turnoverReason, setTurnoverReason] = useState("");
  const [scoreMethod, setScoreMethod] = useState("");
  const [dPlayer, setDPlayer] = useState("");
  const [thrownTo, setThrownTo] = useState("");
  const [thrownFrom, setThrownFrom] = useState("");
  const [assistPlayer, setAssistPlayer] = useState("");
  const [scorePlayer, setScorePlayer] = useState("");

  const [possessionType, setPossessionType] = useState("");
  const [possessionCount, setPossessionCount] = useState(1);

  const [isClipModalOpen, setIsClipModalOpen] = useState(false);


  const toast = useToast();

  useEffect(() => {
    async function fetchData() {
        setLoading(true);

        // Get point details
        const pointData = await fetchPointById(point_id);
        setPointData(pointData);
        setLoading(false);

        // Find number of possessions for counter
        const possessionCount = await fetchPossessionsForPoint(point_id);
        if (possessionCount) {
          setPossessionCount(possessionCount.length + 1);
          console.log("Possessions",point_id);
        }

        // Get event details
        const eventData = await fetchEvent(id);
        setEventData(eventData);

        // Get team id-name mapping
        const teamMapping = await fetchTeamMapping();
        setTeamMapping(teamMapping);

        // Get all the plays from supabase
        const dInitPlays = await fetchDInitPlays();
        setDInitPlays(dInitPlays);
        const oInitPlays = await fetchOInitPlays();
        setOInitPlays(oInitPlays);
        const dMainPlays = await fetchDMainPlays();
        setDMainPlays(dMainPlays);
        const oMainPlays = await fetchOMainPlays();
        setOMainPlays(oMainPlays);

        // Get listed players for each team involved
        const currentPoint = pointData[0];
        const offencePlayers = await fetchPlayersForTeam(currentPoint.offence_team)
        setOffencePlayers(offencePlayers)
        const defencePlayers = await fetchPlayersForTeam(currentPoint.defence_team)
        setDefencePlayers(defencePlayers)
    }
    void fetchData();
  }, [id, point_id, toast]);

  if (!player || loading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading player data...</Text>
      </Box>
    )
  }

  // WRITE TO SUPABASE
  const handleAdd = async () => {
    try {
      // If new player name is added generate new id, then they should be added to the relevant state for future possessions
      function maybeAddPlayer(
        playerId: string | null,
        name: string,
        playerList: Player[],
        setPlayerList: React.Dispatch<React.SetStateAction<Player[]>>
      ) {
        if (playerId && !playerList.some((p) => p.player_id === playerId)) {
          const newPlayer = { player_id: playerId, player_name: name } as Player;
          setPlayerList((prev) => [...prev, newPlayer]);
        }
      }

      const scorePlayerId = await getOrCreatePlayerId(scorePlayer, currentOffenceTeamId, possessionOPlayers);
      maybeAddPlayer(scorePlayerId, scorePlayer, possessionOPlayers, possessionCount % 2 !== 0 ? setOffencePlayers : setDefencePlayers);

      const assistPlayerId = await getOrCreatePlayerId(assistPlayer, currentOffenceTeamId, possessionOPlayers);
      maybeAddPlayer(assistPlayerId, assistPlayer, possessionOPlayers, possessionCount % 2 !== 0 ? setOffencePlayers : setDefencePlayers);

      const turnoverThrowerId = await getOrCreatePlayerId(turnoverThrower, currentOffenceTeamId, possessionOPlayers);
      maybeAddPlayer(turnoverThrowerId, turnoverThrower, possessionOPlayers, possessionCount % 2 !== 0 ? setOffencePlayers : setDefencePlayers);

      const turnoverReceiverId = await getOrCreatePlayerId(turnoverReceiver, currentOffenceTeamId, possessionOPlayers);
      maybeAddPlayer(turnoverReceiverId, turnoverReceiver, possessionOPlayers, possessionCount % 2 !== 0 ? setOffencePlayers : setDefencePlayers);

      const dPlayerId = await getOrCreatePlayerId(dPlayer, currentDefenceTeamId, possessionDPlayers);
      maybeAddPlayer(dPlayerId, dPlayer, possessionDPlayers, possessionCount % 2 !== 0 ? setDefencePlayers : setOffencePlayers);


      const possessionData = {
        point_id: point_id,
        offence_init: oInitPlay,
        defence_init: dInitPlay,
        offence_main: oMainPlay,
        defence_main: dMainPlay,
        throws: parseInt(numThrows),
        turn_throw_zone: parseInt(thrownFrom),
        turn_receive_zone: parseInt(thrownTo),
        turnover_reason: turnoverReason,
        score_method: scoreMethod,
        score_player: scorePlayerId,
        assist_player: assistPlayerId,
        offence_team: currentOffenceTeamId,
        defence_team: currentDefenceTeamId,
        turn_thrower: turnoverThrowerId,
        turn_intended_receiver: turnoverReceiverId,
        d_player: dPlayerId,
        possession_number: possessionCount,
        is_score: possessionType === "score"
      };

      await writePossession(possessionData);


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

  //Test function (still writes players)

  // const handleAdd = async () => {
  //   try {
  //     function maybeLogPlayer(
  //       playerId: string | null,
  //       name: string,
  //       playerList: Player[],
  //       teamId: string
  //     ) {
  //       const isNew = playerId && !playerList.some((p) => p.player_id === playerId);
  //       if (isNew) {
  //         console.log("New player to add:", {
  //           player_id: playerId,
  //           player_name: name,
  //           team_id: teamId,
  //         });
  //       } else {
  //         console.log("Existing player:", { player_id: playerId, player_name: name });
  //       }
  //     }
  //
  //     const scorePlayerId = await getOrCreatePlayerId(scorePlayer, currentOffenceTeamId, possessionOPlayers);
  //     maybeLogPlayer(scorePlayerId, scorePlayer, possessionOPlayers, currentOffenceTeamId);
  //
  //     const assistPlayerId = await getOrCreatePlayerId(assistPlayer, currentOffenceTeamId, possessionOPlayers);
  //     maybeLogPlayer(assistPlayerId, assistPlayer, possessionOPlayers, currentOffenceTeamId);
  //
  //     const turnoverThrowerId = await getOrCreatePlayerId(turnoverThrower, currentOffenceTeamId, possessionOPlayers);
  //     maybeLogPlayer(turnoverThrowerId, turnoverThrower, possessionOPlayers, currentOffenceTeamId);
  //
  //     const turnoverReceiverId = await getOrCreatePlayerId(turnoverReceiver, currentOffenceTeamId, possessionOPlayers);
  //     maybeLogPlayer(turnoverReceiverId, turnoverReceiver, possessionOPlayers, currentOffenceTeamId);
  //
  //     const dPlayerId = await getOrCreatePlayerId(dPlayer, currentDefenceTeamId, possessionDPlayers);
  //     maybeLogPlayer(dPlayerId, dPlayer, possessionDPlayers, currentDefenceTeamId);
  //
  //     const possessionData = {
  //       point_id: point_id,
  //       offence_init: oInitPlay,
  //       defence_init: dInitPlay,
  //       offence_main: oMainPlay,
  //       defence_main: dMainPlay,
  //       throws: parseInt(numThrows),
  //       turn_throw_zone: parseInt(thrownFrom),
  //       turn_receive_zone: parseInt(thrownTo),
  //       turnover_reason: turnoverReason,
  //       score_method: scoreMethod,
  //       score_player: scorePlayerId,
  //       assist_player: assistPlayerId,
  //       offence_team: currentOffenceTeamId,
  //       defence_team: currentDefenceTeamId,
  //       turn_thrower: turnoverThrowerId,
  //       turn_intended_receiver: turnoverReceiverId,
  //       d_player: dPlayerId,
  //       possession_number: possessionCount,
  //       is_score: possessionType === "score"
  //     };
  //
  //     console.log("Possession payload:", possessionData);
  //   } catch (error) {
  //     console.error("Error preparing data:", error);
  //   }
  // };


  // Determine footage provider based on pointData.timestamp_url.
  const currentPoint = pointData[0];
  const eventName = eventData ? eventData.event_name : "Event";


  // Determine which team is on offence based on the possession count:
  const offence_team_name = getTeamName(teamMapping, currentPoint.offence_team);
  const defence_team_name = getTeamName(teamMapping, currentPoint.defence_team);
  const currentOffenceTeamId = possessionCount % 2 !== 0 ? currentPoint.offence_team : currentPoint.defence_team;
  const currentDefenceTeamId = possessionCount % 2 !== 0 ? currentPoint.defence_team : currentPoint.offence_team;
  const currentOffenceTeam = possessionCount % 2 !== 0 ? offence_team_name : defence_team_name;
  // const currentDefenceTeam = possessionCount % 2 !== 0 ? defence_team_name : offence_team_name;
  // Dynamic d/o player list
  const possessionOPlayers = possessionCount % 2 !== 0 ? offencePlayers : defencePlayers;
  const possessionDPlayers = possessionCount % 2 !== 0 ? defencePlayers : offencePlayers;

  const resetForm = () => {
    setDMainPlay("");
    setOMainPlay("");
    setDInitPlay("");
    setOInitPlay("");
    setNumThrows("0");
    setTurnoverThrower("");
    setTurnoverReceiver("");
    setTurnoverReason("");
    setScoreMethod("");
    setDPlayer("");
    setThrownFrom("");
    setThrownTo("");
    setAssistPlayer("");
    setScorePlayer("");
    setPossessionType("");
  };


  // Function to handle form submission
  const handleSubmit = () => {
    if (!possessionType) return; // safeguard

    if (possessionType === "turnover") {
      void handleAdd()
      setPossessionCount((prev) => prev + 1);
      resetForm();
    } else if (possessionType === "score") {
      void handleAdd()
      window.location.href = `/events/${id}`;
    }
  };

  return (
      <Container maxW="4xl">
        <StandardHeader text={eventName} is_admin={player.is_admin} />
        <Text mt={4} fontSize="lg" color="gray.400">{`${offence_team_name} on O starting ${currentPoint.timestamp}`}</Text>
        <OnPageVideoLink url={currentPoint.timestamp_url}/>
        <>
          {/* Display dynamic Possession count and current offence team */}
          <Text textStyle="3xl" mb={4} mt={4}>{`Possession #${possessionCount}`}</Text>
          <Text textStyle="xl" mb={4} color="gray.400">{`Offence: ${currentOffenceTeam}`}</Text>
          <HStack gap={4}>
            <CustomDropdownInput
              label="Defence Initiation"
              placeholder="e.g. Flex"
              value={dInitPlay}
              onChange={(val) => setDInitPlay(val)}
              options={dInitPlays.map((p) => ({ value: p.play, label: p.play }))}
              customOptionValue="+ Add Strategy"
            />
            <CustomDropdownInput
              label="Offence Initiation"
              placeholder="e.g. Slash"
              value={oInitPlay}
              onChange={(val) => setOInitPlay(val)}
              options={oInitPlays.map((p) => ({ value: p.play, label: p.play }))}
            />
          </HStack>
          <HStack gap={4}>
            <CustomDropdownInput
              label="Defence Main Play"
              placeholder="e.g. Flick"
              value={dMainPlay}
              onChange={(val) => setDMainPlay(val)}
              options={dMainPlays.map((p) => ({ value: p.play, label: p.play }))}
            />
            <CustomDropdownInput
              label="Offence Main Play"
              placeholder="e.g. Vertical Stack"
              value={oMainPlay}
              onChange={(val) => setOMainPlay(val)}
              options={oMainPlays.map((p) => ({ value: p.play, label: p.play }))}
            />
          </HStack>
          <ThrowCounter value={numThrows} onChange={setNumThrows} />
        </>

        <Field.Root mb={4}>
          <Field.Label>Possession Outcome</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              placeholder="Select option"
              value={possessionType}
              onChange={(e) => setPossessionType(e.currentTarget.value)}
            >
              <option value="turnover">Turnover</option>
              <option value="score">Score</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>

        {/* Render additional fields based on the selected possession outcome */}
        {possessionType === "turnover" && (
          <>
            <Text fontSize="md" fontWeight="semibold" mb={4}>Turnover Info</Text>
            <Image src="/pitch-zoned.png" mb={4} alt="Pitch Zoned"/>
            <HStack gap={4}>
              <Field.Root mb={4}>
                <Field.Label>Thrown From</Field.Label>
                <NativeSelect.Root>
                  <NativeSelect.Field
                    placeholder="Select Zone"
                    value={thrownFrom}
                    onChange={(e) => setThrownFrom(e.currentTarget.value)}
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const val = (i + 1).toString();
                      return (
                        <option key={val} value={val}>
                          {`Zone ${val}`}
                        </option>
                      );
                    })}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
              <Field.Root mb={4}>
                <Field.Label>Intended Catch Zone</Field.Label>
                <NativeSelect.Root>
                  <NativeSelect.Field
                    placeholder="Select Zone"
                    value={thrownTo}
                    onChange={(e) => setThrownTo(e.currentTarget.value)}
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const val = (i + 1).toString();
                      return (
                        <option key={val} value={val}>
                          {`Zone ${val}`}
                        </option>
                      );
                    })}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
            </HStack>
            <CustomDropdownInput
              label="Turnover Thower"
              placeholder="Player Name"
              value={turnoverThrower}
              onChange={(val) => setTurnoverThrower(val)}
              options={possessionOPlayers.map((p) => ({ value: p.player_id, label: p.player_name }))}
            />
            <CustomDropdownInput
              label="Turnover Intended Receiver"
              placeholder="Player Name"
              value={turnoverReceiver}
              onChange={(val) => setTurnoverReceiver(val)}
              options={possessionOPlayers.map((p) => ({ value: p.player_id, label: p.player_name }))}
            />
            <Field.Root mb={4}>
              <Field.Label>Turnover Reason</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  placeholder="Select option"
                  value={turnoverReason}
                  onChange={(e) => setTurnoverReason(e.currentTarget.value)}
                >
                  <option value="Drop">Drop</option>
                  <option value="Stallout">Stallout</option>
                  <option value="Hand/Foot Block">Hand/Foot Block</option>
                  <option value="Block">Block</option>
                  <option value="Forced Error">Forced Error</option>
                  <option value="Throw Away">Throw Away</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
            <CustomDropdownInput
              label="D Player (if applicable)"
              placeholder="Player Name"
              value={dPlayer}
              onChange={(val) => setDPlayer(val)}
              options={possessionDPlayers.map((p) => ({ value: p.player_id, label: p.player_name }))}
            />

          </>
        )}
        {possessionType === "score" && (
          <>
            <Text fontSize="md" fontWeight="semibold" mb={4}>Score Info</Text>
            <CustomDropdownInput
              label="Assist Thrower"
              placeholder="Player Name"
              value={assistPlayer}
              onChange={(val) => setAssistPlayer(val)}
              options={possessionOPlayers.map((p) => ({ value: p.player_id, label: p.player_name }))}
            />
            <CustomDropdownInput
              label="Scorer"
              placeholder="Player Name"
              value={scorePlayer}
              onChange={(val) => setScorePlayer(val)}
              options={possessionOPlayers.map((p) => ({ value: p.player_id, label: p.player_name }))}
            />
            <Field.Root mb={4}>
              <Field.Label>Score Method</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  placeholder="Select option"
                  value={scoreMethod}
                  onChange={(e) => setScoreMethod(e.currentTarget.value)}
                >
                  <option value="Flow">Flow</option>
                  <option value="Endzone Set">Endzone Set</option>
                  <option value="Deep Shot">Deep Shot</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
          </>
        )}

        {/* Submit Button */}
        <Button
          mb={4}
          colorPalette="green"
          disabled={!possessionType}
          onClick={handleSubmit}
        >
          {possessionType === "turnover" ? "Add Possession" : "Add Point"}
        </Button>
        <FloatingClipButton onClick={() => setIsClipModalOpen(true)} />
        <AddClipModal
          isOpen={isClipModalOpen}
          onClose={() => setIsClipModalOpen(false)}
          eventId={id}
          baseUrl = {currentPoint.base_url}
        />
      </Container>
    );
}

export default function PointPage() {
  return (
    <AuthWrapper>
      <PointPageContent />
    </AuthWrapper>
  )
}
