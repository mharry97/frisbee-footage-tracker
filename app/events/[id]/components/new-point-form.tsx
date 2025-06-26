import {z} from 'zod'
import {
  Button,
  Field,
  Input,
  VStack,
  Text,
  useDisclosure,
  Dialog,
  Portal,
  HStack,
  Select,
  Spinner,
  createListCollection,
  Stack
} from "@chakra-ui/react";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import React, {useMemo} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import { addPoint } from "@/app/points/supabase";
import FloatingActionButton from "@/components/ui/floating-plus.tsx";
import {useAsync} from "react-use";
import {fetchSources} from "@/app/sources/supabase.ts";
import {fetchEventTeams, fetchEventTeamsInfo } from "@/app/events/[id]/supabase.ts";
import {useRouter} from "next/navigation";

interface PortalProps {
  event_id: string;
}

const schema = z.object({
  source_id: z.string().array().nonempty({ message: "Please select a source." }),
  timestamp: z.string().min(1, { message: "Timestamp is required." }),
  offence_team: z.string().array().min(1, { message: "Please select an offence team." }),
});

type PointData = z.infer<typeof schema>;

const PointForm = ({ event_id }: PortalProps) => {
  const router = useRouter();
  const { open, onOpen, onClose } = useDisclosure()
  const {
    register,
    handleSubmit,
    setError,
    control,
    reset,
    watch,
    formState: {errors, isSubmitting, isValid}} = useForm<PointData>({
    resolver:zodResolver(schema),
    mode: "onChange",
    })


  // Fetch sources for source dropdown and form collection
  const sourceState = useAsync(fetchSources)

  const sourceCollection = useMemo(() => {
    return createListCollection({
      items: sourceState.value ?? [],
      itemToString: (source) => source.title,
      itemToValue: (source) => source.source_id,
    })
  }, [sourceState.value])

  // Fetch both teams and form collection
  const teamsState = useAsync(async () => {
    if (!event_id) return [];
    const teamIds = await fetchEventTeams(event_id);
    if (teamIds.length === 0) {
      return [];
    }
    return await fetchEventTeamsInfo(teamIds);
  }, [event_id]);

  const teamsCollection = useMemo(() => {
    return createListCollection({
      items: teamsState.value ?? [],
      itemToString: (team) => team.team_name,
      itemToValue: (team) => team.team_id,
    })
  }, [teamsState.value])

  const selectedOffenceTeamId = watch("offence_team")?.[0];
  const defenceTeam = useMemo(() => {
    if (!selectedOffenceTeamId || !teamsState.value) {
      return undefined;
    }
    return teamsState.value.find(
      (team) => team.team_id !== selectedOffenceTeamId
    );
  }, [selectedOffenceTeamId, teamsState.value]);



  const handleOpenPortal = () => {
    reset();
    onOpen()
  }

  const onSubmit: SubmitHandler<PointData> = async (data) => {
    const defence_team_id = defenceTeam?.team_id;
    if (!defence_team_id) {
      setError("root", { message: "Could not determine the defence team." });
      return;
    }
    const payload = {
      ...data,
      source_id: data.source_id[0],
      offence_team: data.offence_team[0],
      event_id,
      defence_team: defence_team_id
    };
    try {
      const point_id = await addPoint(payload)
      router.push(`/events/${event_id}/${point_id}`);
    } catch (error) {
      if (error instanceof Error) {
        setError("root", {
          message: error.message,
        });
      } else {
        setError("root", {
          message: "An unknown error occurred",
        });
      }
    }

  }

  return(
    <>
      <FloatingActionButton onClick={handleOpenPortal} iconType="add"/>
      <Dialog.Root open={open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>Add Point</Dialog.Header>
              <Dialog.Body>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <VStack gap={4}>
                    <Field.Root>
                      <Field.Label>Source</Field.Label>
                      <Controller
                        name="source_id"
                        control={control}
                        render={({ field }) => (
                          <Select.Root
                            name={field.name}
                            value={field.value}
                            onValueChange={
                              ({ value }) => {field.onChange(value)}}
                            onInteractOutside={() => field.onBlur()}
                            collection={sourceCollection}
                          >
                            <Select.HiddenSelect />
                            <Select.Control>
                              <Select.Trigger>
                                <Select.ValueText placeholder="Select point source" />
                              </Select.Trigger>
                              <Select.IndicatorGroup>
                                {sourceState.loading && (
                                  <Spinner />
                                )}
                                <Select.Indicator />
                              </Select.IndicatorGroup>
                            </Select.Control>
                            <Select.Positioner>
                              <Select.Content>
                                {sourceCollection.items.map((source) => (
                                  <Select.Item item={source} key={source.source_id}>
                                    <Stack gap={0}>
                                      <Text>{source.title}</Text>
                                      <Text color="fg.muted" fontSize="xs">{source.recorded_date}</Text>
                                    </Stack>
                                    <Select.ItemIndicator />
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Positioner>
                          </Select.Root>
                        )}
                      />
                      {errors.source_id && <Field.ErrorText>{errors.source_id.message}</Field.ErrorText>}
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Timestamp</Field.Label>
                      <Input {...register("timestamp")} placeholder="Enter timestamp" />
                      {errors.timestamp && (
                        <Field.ErrorText>{errors.timestamp.message}</Field.ErrorText>
                      )}
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Offence Team</Field.Label>
                      <Controller
                        name="offence_team"
                        control={control}
                        render={({ field }) => (
                          <Select.Root
                            name={field.name}
                            value={field.value}
                            onValueChange={
                              ({ value }) => {field.onChange(value)}}
                            onInteractOutside={() => field.onBlur()}
                            collection={teamsCollection}
                          >
                            <Select.HiddenSelect />
                            <Select.Control>
                              <Select.Trigger>
                                <Select.ValueText placeholder="Select team on offence" />
                              </Select.Trigger>
                              <Select.IndicatorGroup>
                                {sourceState.loading && (
                                  <Spinner />
                                )}
                                <Select.Indicator />
                              </Select.IndicatorGroup>
                            </Select.Control>
                            <Select.Positioner>
                              <Select.Content>
                                {teamsCollection.items.map((team) => (
                                  <Select.Item item={team} key={team.team_id}>
                                    <Text>{team.team_name}</Text>
                                    <Select.ItemIndicator />
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Positioner>
                          </Select.Root>
                        )}
                      />
                      {errors.offence_team && <Field.ErrorText>{errors.offence_team.message}</Field.ErrorText>}
                    </Field.Root>
                  </VStack>
                  <HStack justify="space-between">
                    <Button type="submit" disabled={!isValid || isSubmitting} mt={4}>
                      Add
                    </Button>
                    {errors.root && (
                      <Text color="red" mt={4}>{errors.root.message}</Text>
                    )}
                    <Button variant="ghost" onClick={onClose} mt={4}>
                      Cancel
                    </Button>
                  </HStack>
                </form>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}

export default PointForm;
