import React, {useMemo} from 'react';
import {
  Dialog,
  Button,
  Portal,
  VStack,
  Field,
  Input, Stack, Text, createListCollection, Checkbox, Textarea,
} from '@chakra-ui/react';
import {Controller, useForm} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {z} from "zod";
import {Player} from "@/app/players/supabase.ts";
import {upsertPlayer} from "@/app/players/supabase.ts";
import {AsyncDropdown} from "@/components/async-dropdown.tsx";
import {fetchTeams} from "@/app/teams/supabase.ts";

const schema = z.object({
  player_name: z.string(),
  team_id: z.string().array(),
  number: z.coerce.number().optional(),
  is_active: z.boolean(),
  notes: z.string().optional(),
})

export type PlayerFormData = z.infer<typeof schema>

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  playerToEdit?: Player;
  teamId?: string;
}

export function PlayerModal({
                              isOpen,
                              onClose,
                              mode,
                              playerToEdit,
                              teamId,
                            }: PlayerModalProps) {
  const queryClient = useQueryClient();

  // Set up the form with conditional default values
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<PlayerFormData>({
    resolver: zodResolver(schema),
    // Set defaults based on the mode
    defaultValues: {
      player_name: mode === 'edit' ? playerToEdit?.player_name : '',
      number: mode === 'edit' ? playerToEdit?.number : undefined,
      is_active: mode === 'edit' ? playerToEdit?.is_active : true,
      team_id: mode === 'edit' ? [playerToEdit?.team_id] : (teamId ? [teamId] : []),
      notes: mode === 'edit' ? (playerToEdit?.notes ?? '') : '',
    },
  });

  console.log("Form Errors:", errors);

  // Fetch team data for dropdowns
  const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
    queryFn: fetchTeams,
    queryKey: ["editPlayerTeams"]
  })

  const teamCollection = useMemo(() =>
      createListCollection({
        items: teamsData ?? [],
        itemToString: (item) => item.team_name,
        itemToValue: (item) => item.team_id,
      }),
    [teamsData]
  );

  const { mutateAsync: upsertPlayerMutation } = useMutation({
    mutationFn: upsertPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player'], queryKey: ['pointPageData'] });
      onClose();
    },
  });

  // Build payload conditionally
  const onSubmit = (formData: PlayerFormData) => {
    const payload = {
      player_name: formData.player_name,
      number: formData.number || undefined,
      is_active: formData.is_active,
      notes: formData.notes || null,
      player_id: mode === 'edit' ? playerToEdit?.player_id : undefined,
      team_id: formData.team_id[0],
    };
    upsertPlayerMutation(payload);
  };

  const isEditMode = mode === 'edit';

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) {
          onClose();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <form id="player-form" onSubmit={handleSubmit(onSubmit)}>
              <Dialog.Header>
                {isEditMode ? 'Edit Player' : 'Add New Player'}
              </Dialog.Header>

              <Dialog.Body>
                <VStack gap={4}>
                  <Field.Root>
                    <Field.Label>Player Name</Field.Label>
                    <Input {...register("player_name")} />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Number</Field.Label>
                    <Input type="number" {...register("number")} />
                  </Field.Root>
                  <AsyncDropdown
                    name="team_id"
                    control={control}
                    label="Team"
                    placeholder="Select player's team"
                    disabled={isEditMode}
                    collection={teamCollection}
                    isLoading={isLoadingTeams}
                    itemToKey={(item) => item.team_id}
                    renderItem={(item) => (
                      <Stack gap={0}>
                        <Text>{item.team_name}</Text>
                      </Stack>
                    )}
                  />
                  <Field.Root mb={4}>
                    <Field.Label>Notes</Field.Label>
                    <Textarea
                      placeholder="Any notes on player"
                      {...register("notes")}
                      size="xl"
                      variant="outline"
                    />
                  </Field.Root>
                  <Controller
                    control={control}
                    name="is_active"
                    render={({ field }) => (
                      <Field.Root>
                        <Checkbox.Root
                          checked={field.value}
                          onCheckedChange={({ checked }) => field.onChange(checked)}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>Active?</Checkbox.Label>
                        </Checkbox.Root>
                      </Field.Root>
                    )}
                  />
                </VStack>
              </Dialog.Body>

              <Dialog.Footer>
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button
                  type="submit"
                  form="player-form"
                  loading={isSubmitting}
                >
                  {isEditMode ? 'Save Changes' : 'Create Player'}
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
