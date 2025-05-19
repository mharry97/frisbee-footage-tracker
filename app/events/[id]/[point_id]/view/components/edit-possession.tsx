import React, {useEffect, useState} from "react";
import {
  Dialog,
  Button,
  CloseButton,
  Portal,
  VStack,
  Field,
  NativeSelect,
  Image,
  Text,
} from "@chakra-ui/react";
import CustomDropdownInput from "@/app/events/[id]/[point_id]/components/custom-dropdown-with-add";
import type { PointDetailed } from "@/lib/supabase";
import {
  fetchDInitPlays,
  fetchDMainPlays,
  fetchOInitPlays,
  fetchOMainPlays
} from "@/app/events/[id]/[point_id]/supabase";
import type { Player } from "@/lib/supabase";
import ThrowCounter from "@/components/throws-input";

type ListItem = { play: string };

type EditPossessionDialogProps = {
  possession: PointDetailed;
  onClose: () => void;
  onUpdate: (updated: Partial<PointDetailed>) => void;
  outcome: string;
  offence_player_list: Player[];
  defence_player_list: Player[];
};

export default function EditPossessionDialog({
                                               possession,
                                               onClose,
                                               onUpdate,
                                               outcome,
                                               offence_player_list,
                                               defence_player_list,
                                             }: EditPossessionDialogProps) {
  const [dInitPlay, setDInitPlay] = useState(possession.defence_init || "");
  const [oInitPlay, setOInitPlay] = useState(possession.offence_init || "");
  const [dMainPlay, setDMainPlay] = useState(possession.defence_main || "");
  const [oMainPlay, setOMainPlay] = useState(possession.offence_main || "");
  const [numThrows, setNumThrows] = useState(String(possession.throws ?? "0"));
  const [defenceInitList, setDInitList] = useState<ListItem[]>([]);
  const [defenceMainList, setDMainList] = useState<ListItem[]>([]);
  const [offenceInitList, setOInitList] = useState<ListItem[]>([]);
  const [offenceMainList, setOMainList] = useState<ListItem[]>([]);

  const [thrownTo, setThrownTo] = useState(possession.turn_receive_zone ?? null);
  const [thrownFrom, setThrownFrom] = useState(possession.turn_throw_zone ?? null);
  const [turnoverThrower, setTurnoverThrower] = useState(possession.turn_thrower ?? "");
  const [turnoverReceiver, setTurnoverReceiver] = useState(possession.turn_intended_receiver ?? "");
  const [turnoverReason, setTurnoverReason] = useState(possession.turnover_reason ?? "");
  const [dPlayer, setDPlayer] = useState(possession.d_player ?? "");

  const [scorePlayer, setScorePlayer] = useState(possession.score_player ?? "");
  const [assistPlayer, setAssistPlayer] = useState(possession.assist_player ?? "");
  const [scoreMethod, setScoreMethod] = useState(possession.score_method ?? "");

  useEffect(() => {
    async function fetchOptions() {
      const [dInit, dMain, oInit, oMain] = await Promise.all([
        fetchDInitPlays(),
        fetchDMainPlays(),
        fetchOInitPlays(),
        fetchOMainPlays(),
      ]);

      setDInitList(dInit);
      setDMainList(dMain);
      setOInitList(oInit);
      setOMainList(oMain);
    }

    void fetchOptions();
  }, []);

  const clean = (value: string | undefined | null) => (value === "" ? null : value);

  const handleSubmit = () => {
    onUpdate({
      defence_init: dInitPlay,
      offence_init: oInitPlay,
      defence_main: dMainPlay,
      offence_main: oMainPlay,
      throws: Number(numThrows),
      is_score: possession.is_score,
      turn_thrower: clean(turnoverThrower),
      turn_throw_zone: Number(thrownFrom),
      turn_receive_zone: Number(thrownTo),
      turn_intended_receiver: clean(turnoverReceiver),
      turnover_reason: turnoverReason,
      d_player: clean(dPlayer),
      score_player: clean(scorePlayer),
      assist_player: clean(assistPlayer),
      score_method: scoreMethod,
    });
  };

  return (
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Edit Possession</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <VStack spacing={4}>
              <CustomDropdownInput
                label="Defence Initiation"
                placeholder="e.g. Flex"
                value={dInitPlay}
                onChange={setDInitPlay}
                options={defenceInitList.map((p) => ({ value: p.play, label: p.play }))}
                customOptionValue="+ Add Strategy"
              />
              <CustomDropdownInput
                label="Offence Initiation"
                placeholder="e.g. Slash"
                value={oInitPlay}
                onChange={setOInitPlay}
                options={offenceInitList.map((p) => ({ value: p.play, label: p.play }))}
              />
              <CustomDropdownInput
                label="Defence Main Play"
                placeholder="e.g. Flick"
                value={dMainPlay}
                onChange={setDMainPlay}
                options={defenceMainList.map((p) => ({ value: p.play, label: p.play }))}
              />
              <CustomDropdownInput
                label="Offence Main Play"
                placeholder="e.g. Vertical Stack"
                value={oMainPlay}
                onChange={setOMainPlay}
                options={offenceMainList.map((p) => ({ value: p.play, label: p.play }))}
              />
              <ThrowCounter value={numThrows} onChange={setNumThrows} />

              {outcome === "Turnover" ? (
                <>
                  <Text mt={2} textStyle = "lg">Turnover Info</Text>
                  <Image src="/pitch-zoned.png" mb={4} alt="Pitch Zoned"/>
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
                  <CustomDropdownInput
                    label="Turnover Thrower"
                    placeholder="Player Name"
                    value={turnoverThrower}
                    onChange={setTurnoverThrower}
                    options={offence_player_list.map((p) => ({ value: p.player_id, label: p.player_name }))}
                  />
                  <CustomDropdownInput
                    label="Turnover Intended Receiver"
                    placeholder="Player Name"
                    value={turnoverReceiver}
                    onChange={setTurnoverReceiver}
                    options={offence_player_list.map((p) => ({ value: p.player_id, label: p.player_name }))}
                  />
                  <Field.Root mb={4}>
                    <Field.Label>Turnover Reason</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        placeholder="Select reason"
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
                    onChange={setDPlayer}
                    options={defence_player_list.map((p) => ({ value: p.player_id, label: p.player_name }))}
                  />
                </>
              ) : (
                <>
                  <Text mt={2} textStyle = "lg" fontWeight="bold" >Score Info</Text>
                  <CustomDropdownInput
                    label="Assist Thrower"
                    placeholder="Player Name"
                    value={assistPlayer}
                    onChange={setAssistPlayer}
                    options={offence_player_list.map((p) => ({ value: p.player_id, label: p.player_name }))}
                  />
                  <CustomDropdownInput
                    label="Scorer"
                    placeholder="Player Name"
                    value={scorePlayer}
                    onChange={setScorePlayer}
                    options={offence_player_list.map((p) => ({ value: p.player_id, label: p.player_name }))}
                  />
                  <Field.Root mb={4}>
                    <Field.Label>Score Method</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        placeholder="Select method"
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
            </VStack>
          </Dialog.Body>
          <Dialog.Footer display="flex" justifyContent="space-between">
            <Button colorPalette="green" onClick={handleSubmit}>
              Update Possession
            </Button>
          </Dialog.Footer>
          <Dialog.CloseTrigger asChild>
            <CloseButton position="absolute" top="2" right="2" onClick={onClose} />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  );
}
