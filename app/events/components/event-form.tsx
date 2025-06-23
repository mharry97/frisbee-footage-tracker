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
  HStack, Select, Spinner, createListCollection
} from "@chakra-ui/react";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import React, {useMemo} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {addEvent, editEvent, EventDetail} from "@/app/events/supabase";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import FloatingPlusButton from "@/components/ui/floating-plus.tsx";
import {useAsync} from "react-use";
import {fetchTeams} from "@/app/teams/supabase.ts";

interface PortalProps {
  mode: "add" | "edit";
  currentData?: EventDetail;
  onSuccess?: () => void;
}
const game_types = z.enum(["Game", "Training"])

const schema = z.object({
  event_name: z.string(),
  event_date: z.string(),
  type: game_types.array(),
  teams: z.string().array().max(2, { message: "You can select a maximum of 2 teams." }),
});

type EventData = z.infer<typeof schema>;

const EventForm = ({ mode, currentData }: PortalProps) => {
  // Fetch for team dropdowns
  const state = useAsync(fetchTeams)

  const collection = useMemo(() => {
    return createListCollection({
      items: state.value ?? [],
      itemToString: (team) => team.team_name,
      itemToValue: (team) => team.team_id,
    })
  }, [state.value])

  const typeCollection = createListCollection({
    items: ["Game", "Training"],
    itemToString: (item) => item,
    itemToValue: (item) => item,
  })

  const queryClient = useQueryClient()
  const { open, onOpen, onClose } = useDisclosure()
  const {
    register,
    handleSubmit,
    setError,
    control,
    reset,
    watch,
    formState: {errors, isSubmitting}} = useForm<EventData>({
    resolver:zodResolver(schema),
    defaultValues: currentData
      ? {
        event_name: currentData.event_name,
        event_date: currentData.event_date?.split("T")[0] || "",
        type: currentData.type ? [currentData.type] : [],
        teams: [currentData.team_1_id,currentData.team_2_id],
      }
      : {
        // Set defaults for "add" mode to empty arrays
        event_name: "",
        event_date: "",
        type: [],
        teams: [],
      },
  })

  const { mutateAsync: addEventMutation } = useMutation({
    mutationFn: addEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
      onClose();
    }
  })

  const { mutateAsync: editEventMutation } = useMutation({
    mutationFn: editEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
      onClose();
    }
  })

  const handleOpenPortal = () => {
      reset();
      onOpen()
  }

  const gameType = watch("type");

  // Create a boolean variable for the disabled state.
  // Optional chaining (?.) makes it safe if the array is empty.
  const isGameFieldsDisabled = gameType?.[0] !== "Game";

  const onSubmit: SubmitHandler<EventData> = async (data) => {
    console.log("Data received by onSubmit:", JSON.stringify(data, null, 2));
    const payload = {
      ...data,
      type: data.type[0],
      team_1_id: data.teams[0],
      team_2_id: data.teams[1],
    };

    try {
      if (mode === "add") {
        await addEventMutation(payload);
      } else {
        await editEventMutation({ ...payload, event_id: currentData!.event_id });
      }
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
      {mode === "add" ? <FloatingPlusButton onClick={handleOpenPortal} /> : <Button variant="ghost" onClick={handleOpenPortal}>Edit</Button>}
      <Dialog.Root open={open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>{mode === "add" ? "New Event" : "Edit Event"}</Dialog.Header>
              <Dialog.Body>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <VStack gap={4}>
                    <Field.Root>
                      <Field.Label>Game Type</Field.Label>
                      <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                          <Select.Root
                            name={field.name}
                            value={field.value}
                            onValueChange={({ value }) => {field.onChange(value)}}
                            onInteractOutside={field.onBlur}
                            collection={typeCollection}
                          >
                            <Select.HiddenSelect />
                            <Select.Control>
                              <Select.Trigger>
                                <Select.ValueText placeholder="Select game type" />
                              </Select.Trigger>
                              <Select.IndicatorGroup>
                                <Select.Indicator />
                              </Select.IndicatorGroup>
                            </Select.Control>
                            <Select.Positioner>
                              <Select.Content>
                                {["Game", "Training"].map((item) => (
                                  <Select.Item item={item} key={item}>
                                    {item}
                                    <Select.ItemIndicator />
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Positioner>
                          </Select.Root>
                        )}
                      />
                      {errors.type && <Field.ErrorText>{errors.type.message}</Field.ErrorText>}
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Event Name</Field.Label>
                      <Input {...register("event_name")} disabled={isGameFieldsDisabled} />
                      {errors.event_name && (
                        <Field.ErrorText>{errors.event_name.message}</Field.ErrorText>
                      )}
                    </Field.Root>
                    <Field.Root >
                      <Field.Label>Event Date</Field.Label>
                      <Input {...register("event_date")} type="date" />
                      {errors.event_date && (
                        <Field.ErrorText>{errors.event_date.message}</Field.ErrorText>
                      )}
                    </Field.Root>
                    <Field.Root>
                      <Controller
                        control={control}
                        name = "teams"
                        render={({ field }) => (
                          <Select.Root
                            name={field.name}
                            value={field.value}
                            multiple
                            onValueChange={
                              ({ value }) => {field.onChange(value)}}
                            onInteractOutside={() => field.onBlur()}
                            collection={collection}
                            disabled={isGameFieldsDisabled}
                          >
                            <Select.HiddenSelect />
                            <Select.Label>Teams</Select.Label>
                            <Select.Control>
                              <Select.Trigger>
                                <Select.ValueText placeholder="Select teams" />
                              </Select.Trigger>
                              <Select.IndicatorGroup>
                                {state.loading && (
                                  <Spinner />
                                )}
                                <Select.Indicator />
                              </Select.IndicatorGroup>
                            </Select.Control>
                            <Select.Positioner>
                              <Select.Content>
                                {collection.items.map((team) => (
                                  <Select.Item item={team} key={team.team_id}>
                                    {team.team_name}
                                    <Select.ItemIndicator />
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Positioner>
                          </Select.Root>
                        )}
                      />
                      {errors.teams && (
                        <Field.ErrorText>{errors.teams.message}</Field.ErrorText>
                      )}
                    </Field.Root>
                  </VStack>
                  <HStack justify="space-between">
                    <Button type="submit" disabled={isSubmitting} mt={4}>
                      {mode === "add" ? "Add" : "Update"}
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

export default EventForm;
