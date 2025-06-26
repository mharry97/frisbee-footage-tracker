import React, {useEffect, useMemo} from "react";
import {
  Dialog,
  Button,
  CloseButton,
  Portal,
  VStack,
  Image,
  Text, Stack, Center, createListCollection, useDisclosure,
} from "@chakra-ui/react";
import ThrowCounter from "@/components/throws-input";
import {usePointFormCollections, usePointFormData} from "@/app/hooks/usePointFormData.ts";
import {AsyncDropdown} from "@/components/async-dropdown.tsx";
import {Controller, useForm} from "react-hook-form";
import { EditPossession, editSchema} from "@/app/possessions/possessions.schema.ts";
import {zodResolver} from "@hookform/resolvers/zod";
import { ScoreMethods, TurnoverReasons } from "@/app/possessions/possessions.schema.ts";
import {useEditPossessionSubmit} from "@/app/hooks/usePermissionSubmit.ts";
import {PlayerDetailed} from "@/app/players/supabase.ts";
import AddPlayerButton from "@/components/ui/add-player-button.tsx";
import {PlayerModal} from "@/app/players/components/player-modal.tsx";

type EditPossessionDialogProps = {
  possessionNumber: number;
  onClose: () => void;
  pointId: string;
};

export default function EditPossessionDialog({
                                               possessionNumber,
                                               onClose,
                                               pointId,
                                             }: EditPossessionDialogProps) {
  const { data, isLoading, error } = usePointFormData(pointId);
  const { open:playerOpen, onOpen:playerOnOpen, onClose:playerOnClose } = useDisclosure();

  if (error) throw error;

  const { point, possessions, dropdownLists } = data || {
    point: null,
    possessions: [],
    dropdownLists: {},
  };
  const collections = usePointFormCollections(data);

  // Get specific possession info
  const possessionToEdit = useMemo(() => {
    return possessions.find(p => p.possession_number === possessionNumber);
  }, [possessions, possessionNumber]);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting: isFormSubmitting, errors }
  } = useForm<EditPossession>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      // For dropdowns, wrap the single value in an array
      offence_team_players: point?.offence_team_players ?? [],
      defence_team_players: point?.defence_team_players ?? [],
      defence_init: possessionToEdit?.defence_init ? [possessionToEdit.defence_init] : [],
      defence_main: possessionToEdit?.defence_main ? [possessionToEdit.defence_main] : [],
      offence_init: possessionToEdit?.offence_init ? [possessionToEdit.offence_init] : [],
      offence_main: possessionToEdit?.offence_main ? [possessionToEdit.offence_main] : [],
      throws: possessionToEdit?.throws ?? 0,
      turn_throw_zone: possessionToEdit?.turn_throw_zone ? [String(possessionToEdit.turn_throw_zone)] : [],
      turn_receive_zone: possessionToEdit?.turn_receive_zone ? [String(possessionToEdit.turn_receive_zone)] : [],
      turn_thrower: possessionToEdit?.turn_thrower ? [possessionToEdit.turn_thrower] : [],
      turn_intended_receiver: possessionToEdit?.turn_intended_receiver ? [possessionToEdit.turn_intended_receiver] : [],
      turnover_reason: possessionToEdit?.turnover_reason ? [possessionToEdit.turnover_reason as TurnoverReasons] : [],
      d_player: possessionToEdit?.d_player ? [possessionToEdit.d_player] : [],
      assist_player: possessionToEdit?.assist_player ? [possessionToEdit.assist_player] : [],
      score_player: possessionToEdit?.score_player ? [possessionToEdit.score_player] : [],
      score_method: possessionToEdit?.score_method ? [possessionToEdit.score_method as ScoreMethods] : [],
    },
  });

  // Need this so default data will change when leaving and reopening modal
  useEffect(() => {
    if (possessionToEdit) {
      // `reset` updates the entire form's values to match the new object
      reset({
        // Use the exact same logic here as in your original defaultValues
        offence_team_players: point?.offence_team_players ?? [],
        defence_team_players: point?.defence_team_players ?? [],
        defence_init: possessionToEdit.defence_init ? [possessionToEdit.defence_init] : [],
        defence_main: possessionToEdit.defence_main ? [possessionToEdit.defence_main] : [],
        offence_init: possessionToEdit.offence_init ? [possessionToEdit.offence_init] : [],
        offence_main: possessionToEdit.offence_main ? [possessionToEdit.offence_main] : [],
        throws: possessionToEdit.throws ?? 0,
        turn_throw_zone: possessionToEdit.turn_throw_zone ? [String(possessionToEdit.turn_throw_zone)] : [],
        turn_receive_zone: possessionToEdit.turn_receive_zone ? [String(possessionToEdit.turn_receive_zone)] : [],
        turn_thrower: possessionToEdit.turn_thrower ? [possessionToEdit.turn_thrower] : [],
        turn_intended_receiver: possessionToEdit.turn_intended_receiver ? [possessionToEdit.turn_intended_receiver] : [],
        turnover_reason: possessionToEdit.turnover_reason ? [possessionToEdit.turnover_reason as TurnoverReasons] : [],
        d_player: possessionToEdit.d_player ? [possessionToEdit.d_player] : [],
        assist_player: possessionToEdit.assist_player ? [possessionToEdit.assist_player] : [],
        score_player: possessionToEdit.score_player ? [possessionToEdit.score_player] : [],
        score_method: possessionToEdit.score_method ? [possessionToEdit.score_method as ScoreMethods] : [],
      });
    }
  }, [possessionToEdit, reset, point]);

  const { submitEdit, isSubmitting: isMutationSubmitting } = useEditPossessionSubmit({
    onSuccess: onClose
  });

  const isSubmitting = isFormSubmitting || isMutationSubmitting;

  const onSubmit = (formData: EditPossession) => {
    console.log("Submitting!")
    if (!possessionToEdit) return;
    const transformedData = {
      ...formData,
    };
    submitEdit(transformedData, possessionToEdit);
  };

  const selectedDefencePlayerIds = watch("defence_team_players");
  const selectedOffencePlayerIds = watch("offence_team_players");

  const availableOnDefenceCollection = useMemo(() => {
    const allDefencePlayers = dropdownLists?.defencePlayers ?? [];
    const selectedIds = new Set(selectedDefencePlayerIds ?? []);

    if (selectedIds.size === 0) {
      return createListCollection<PlayerDetailed>({ items: [] });
    }

    const availablePlayers = allDefencePlayers.filter((player) =>
      selectedIds.has(player.player_id)
    );

    return createListCollection({
      items: availablePlayers,
      itemToString: (player) => player.player_name,
      itemToValue: (player) => player.player_id,
    });
  }, [selectedDefencePlayerIds, dropdownLists?.defencePlayers]);

  const availableOnOffenceCollection = useMemo(() => {
    const allOffencePlayers = dropdownLists?.offencePlayers ?? [];
    const selectedIds = new Set(selectedOffencePlayerIds ?? []);

    if (selectedIds.size === 0) {
      return createListCollection<PlayerDetailed>({ items: [] });
    }

    const availablePlayers = allOffencePlayers.filter((player) =>
      selectedIds.has(player.player_id)
    );

    return createListCollection({
      items: availablePlayers,
      itemToString: (player) => player.player_name,
      itemToValue: (player) => player.player_id,
    });
  }, [selectedOffencePlayerIds, dropdownLists?.offencePlayers]);


  const { activeOffenceCollection, activeDefenceCollection } = useMemo(() => {
    const isPointDefenceTeamOnOffence = possessionNumber % 2 === 0;

    if (isPointDefenceTeamOnOffence) {
      return {
        activeOffenceCollection: availableOnDefenceCollection,
        activeDefenceCollection: availableOnOffenceCollection,
      };
    } else {
      return {
        activeOffenceCollection: availableOnOffenceCollection,
        activeDefenceCollection: availableOnDefenceCollection,
      };
    }
  }, [possessionNumber, availableOnOffenceCollection, availableOnDefenceCollection]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading data.</p>;
  if (!possessionToEdit) return <p>Possession not found.</p>;

  console.log("Form Errors:", errors);

  // Testing form
  // const formValues = watch();
  // console.log('Form Debug:', {
  //   isValid,
  //   isDirty,
  //   errors,
  //   formValues,
  //   isSubmitting
  // });
  return (
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Edit Possession</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <VStack gap={4}>
              <form id="edit-possession-form" onSubmit={handleSubmit(onSubmit)}>
                <Text textStyle="xl" mb={4}>Players</Text>
                <AsyncDropdown
                  name="offence_team_players"
                  control={control}
                  label="Offence Players"
                  placeholder="Select players on offence"
                  collection={collections.offenceCollection}
                  isLoading={isLoading}
                  multiple={true}
                  itemToKey={(item) => item.player_id}
                  renderItem={(item) => (
                    <Stack gap={0}>
                      <Text>{item.player_name}</Text>
                      <Text textStyle="xs" color="fg.muted">{item.number ? "#"+item.number+" - " : ""}{item.is_active ? "Active" : "Inactive"}</Text>
                    </Stack>
                  )}
                />
                <AsyncDropdown
                  name="defence_team_players"
                  control={control}
                  label="Defence Players"
                  placeholder="Select players on defence"
                  collection={collections.defenceCollection}
                  isLoading={isLoading}
                  multiple={true}
                  itemToKey={(item) => item.player_id}
                  renderItem={(item) => (
                    <Stack gap={0}>
                      <Text>{item.player_name}</Text>
                      <Text textStyle="xs" color="fg.muted">{item.number ? "#"+item.number+" - " : ""}{item.is_active ? "Active" : "Inactive"}</Text>
                    </Stack>
                  )}
                />
                <AddPlayerButton onClick={playerOnOpen} />
                <PlayerModal
                  isOpen={playerOpen}
                  onClose={playerOnClose}
                  mode="add"
                />
                <Text textStyle="xl" mb={4}>Plays</Text>
                <AsyncDropdown
                  name="defence_init"
                  control={control}
                  label="Defence Initiation"
                  placeholder="Select defence initiation"
                  collection={collections.stratCollections.dInitCollection}
                  isLoading={isLoading}
                  itemToKey={(item) => item.strategy_id}
                  renderItem={(item) => (
                    <Stack gap={0}>
                      <Text>{item.strategy}</Text>
                      <Text color="fg.muted" fontSize="xs">
                        {item.strategy_type}
                      </Text>
                    </Stack>
                  )}
                />
                <AsyncDropdown
                  name="defence_main"
                  control={control}
                  label="Defence Main"
                  placeholder="Select defence main play"
                  collection={collections.stratCollections.dMainCollection}
                  isLoading={isLoading}
                  itemToKey={(item) => item.strategy_id}
                  renderItem={(item) => (
                    <Stack gap={0}>
                      <Text>{item.strategy}</Text>
                      <Text color="fg.muted" fontSize="xs">
                        {item.strategy_type}
                      </Text>
                    </Stack>
                  )}
                />
                <AsyncDropdown
                  name="offence_init"
                  control={control}
                  label="Offence Initiation"
                  placeholder="Select offence initiation"
                  collection={collections.stratCollections.oInitCollection}
                  isLoading={isLoading}
                  itemToKey={(item) => item.strategy_id}
                  renderItem={(item) => (
                    <Stack gap={0}>
                      <Text>{item.strategy}</Text>
                      <Text color="fg.muted" fontSize="xs">
                        {item.strategy_type}
                      </Text>
                    </Stack>
                  )}
                />
                <AsyncDropdown
                  name="offence_main"
                  control={control}
                  label="Offence Main"
                  placeholder="Select offence main play"
                  collection={collections.stratCollections.oMainCollection}
                  isLoading={isLoading}
                  itemToKey={(item) => item.strategy_id}
                  renderItem={(item) => (
                    <Stack gap={0}>
                      <Text>{item.strategy}</Text>
                      <Text color="fg.muted" fontSize="xs">
                        {item.strategy_type}
                      </Text>
                    </Stack>
                  )}
                />
                <Controller
                  name="throws"
                  control={control}
                  defaultValue={0}
                  render={({ field }) => (
                    <ThrowCounter
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {possessionToEdit.is_score === false && (
                  <>
                    <Text textStyle="xl" mb={4}>Turnover Details</Text>
                    <Center>
                      <Image src="/pitch-zoned.png" mb={4} alt="Pitch Zoned" />
                    </Center>
                    <AsyncDropdown
                      name="turn_throw_zone"
                      control={control}
                      label="Thrown From"
                      placeholder="Select throw zone"
                      collection={collections.zoneCollection}
                      isLoading={isLoading}
                      itemToKey={(zoneNumber) => zoneNumber}
                      renderItem={(zoneNumber) => `Zone ${zoneNumber}`}
                    />
                    <AsyncDropdown
                      name="turn_receive_zone"
                      control={control}
                      label="Intended Receive Zone"
                      placeholder="Select receive zone"
                      collection={collections.zoneCollection}
                      isLoading={isLoading}
                      itemToKey={(zoneNumber) => zoneNumber}
                      renderItem={(zoneNumber) => `Zone ${zoneNumber}`}
                    />
                    <AsyncDropdown
                      name="turn_thrower"
                      control={control}
                      label="Thrower"
                      placeholder="Select thrower"
                      collection={activeOffenceCollection}
                      isLoading={isLoading}
                      itemToKey={(item) => item.player_id}
                      renderItem={(item) => (
                        <Stack gap={0}>
                          <Text>{item.player_name}</Text>
                          <Text textStyle="xs" color="fg.muted">{item.number ? "#"+item.number+" - " : ""}{item.is_active ? "Active" : "Inactive"}</Text>
                        </Stack>
                      )}
                    />
                    <AsyncDropdown
                      name="turn_intended_receiver"
                      control={control}
                      label="Intended Receiver"
                      placeholder="Select intended receiver"
                      collection={activeOffenceCollection}
                      isLoading={isLoading}
                      itemToKey={(item) => item.player_id}
                      renderItem={(item) => (
                        <Stack gap={0}>
                          <Text>{item.player_name}</Text>
                          <Text textStyle="xs"
                                color="fg.muted">{item.number ? "#" + item.number + " - " : ""}{item.is_active ? "Active" : "Inactive"}</Text>
                        </Stack>
                      )}
                    />
                    <AsyncDropdown
                      name="turnover_reason"
                      control={control}
                      label="Turnover Reason"
                      placeholder="Select reason"
                      collection={collections.reasonCollection}
                      isLoading={isLoading}
                      itemToKey={(item) => item}
                      renderItem={(item) => item}
                    />
                    <AsyncDropdown
                      name="d_player"
                      control={control}
                      label="D player"
                      placeholder="Select D player"
                      collection={activeDefenceCollection}
                      isLoading={isLoading}
                      itemToKey={(item) => item.player_id}
                      renderItem={(item) => (
                        <Stack gap={0}>
                          <Text>{item.player_name}</Text>
                          <Text textStyle="xs"
                                color="fg.muted">{item.number ? "#" + item.number + " - " : ""}{item.is_active ? "Active" : "Inactive"}</Text>
                        </Stack>
                      )}
                    />
                  </>
                )}
                {possessionToEdit.is_score === true && (
                  <>
                    <Text textStyle="xl" mb={4}>Score Details</Text>
                    <AsyncDropdown
                      name="assist_player"
                      control={control}
                      label="Assist Thrower"
                      placeholder="Select assist thrower"
                      collection={activeOffenceCollection}
                      isLoading={isLoading}
                      itemToKey={(item) => item.player_id}
                      renderItem={(item) => (
                        <Stack gap={0}>
                          <Text>{item.player_name}</Text>
                          <Text textStyle="xs" color="fg.muted">{item.number ? "#"+item.number+" - " : ""}{item.is_active ? "Active" : "Inactive"}</Text>
                        </Stack>
                      )}
                    />
                    <AsyncDropdown
                      name="score_player"
                      control={control}
                      label="Scorer"
                      placeholder="Select scorer"
                      collection={activeOffenceCollection}
                      isLoading={isLoading}
                      itemToKey={(item) => item.player_id}
                      renderItem={(item) => (
                        <Stack gap={0}>
                          <Text>{item.player_name}</Text>
                          <Text textStyle="xs" color="fg.muted">{item.number ? "#"+item.number+" - " : ""}{item.is_active ? "Active" : "Inactive"}</Text>
                        </Stack>
                      )}
                    />
                    <AsyncDropdown
                      name="score_method"
                      control={control}
                      label="Score Method"
                      placeholder="Select score method"
                      collection={collections.methodCollection}
                      isLoading={isLoading}
                      itemToKey={(item) => item}
                      renderItem={(item) => item}
                    />
                  </>
                )}
              </form>
            </VStack>
          </Dialog.Body>
          <Dialog.Footer display="flex" justifyContent="space-between">
            <Button
              colorScheme="green"
              type="submit"
              form="edit-possession-form"
              loading={isSubmitting}
              // disabled={isValid || isSubmitting}
            >
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
