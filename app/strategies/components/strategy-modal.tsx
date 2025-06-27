import React, { useMemo } from "react";
import {
  Dialog,
  Button,
  Portal,
  Field,
  Input,
  Textarea,
  createListCollection,
  Stack,
  Text,
} from "@chakra-ui/react";
import {AsyncDropdown} from "@/components/async-dropdown.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {fetchStratTypes, Strategy, upsertStrat} from "@/app/strategies/supabase.ts";

const schema = z.object({
  strategy: z.string(),
  strategy_type: z.string().array(),
  play_type: z.string().array(),
  description: z.string(),
})

type AddStrat = z.infer<typeof schema>

interface AddStratModalProps {
  stratToEdit?: Strategy;
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
}

const playTypes = [
  { name: "Defence Initiation", id: "defence_initiation" },
  { name: "Defence Main", id: "defence_main" },
  { name: "Offence Initiation", id: "offence_initiation" },
  { name: "Offence Main", id: "offence_main" },
];

export function AddStratModal({ isOpen,
                               onClose,
                               mode,
                               stratToEdit}: AddStratModalProps) {
  // console.log(sourceId);
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: {errors, isSubmitting, isValid}} = useForm<AddStrat>({ resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      strategy: mode === 'edit' ? stratToEdit?.strategy : '',
      strategy_type: mode === 'edit' ? [stratToEdit?.strategy_type] : [],
      play_type: mode === 'edit' ? [stratToEdit?.play_type] : [],
      description: mode === 'edit' ? stratToEdit?.description : '',
    },
  });
  const queryClient = useQueryClient()

  // Fetch data for dropdowns

  // Strat types

  const { data: stratsData, isLoading } = useQuery({
    queryKey: ["stratTypes"],
    queryFn: fetchStratTypes,
  });

  // Form collections for dropdowns

  const stratTypeCollection = useMemo(() =>
      createListCollection({
        items: stratsData ?? [],
        itemToString: (item) => item.strategy_type,
        itemToValue: (item) => item.strategy_type,
      }),
    [stratsData]
  );

  const playTypeCollection = useMemo(() =>
      createListCollection({
        items: playTypes,
        itemToString: (item) => item.name,
        itemToValue: (item) => item.id,
      }),
    []
  );

  const { mutateAsync: upsertStratMutation } = useMutation({
    mutationFn: upsertStrat,
    onSuccess: () => {queryClient.invalidateQueries({ queryKey: ["strats"] })}
  });

  const onSubmit = async (formData: AddStrat) => {
    try {
      const clipPayload = {
        strategy: formData.strategy,
        strategy_type: formData.strategy_type[0],
        play_type: formData.play_type[0],
        description: formData.description,
        strategy_id: stratToEdit?.strategy_id ?? undefined,
      };

      await upsertStratMutation(clipPayload);
      onClose();
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "Submission failed" });
    }
  };

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
            <form onSubmit={handleSubmit(onSubmit)}>
              <Dialog.Header>
                <Dialog.Title>
                  {mode==="edit" ? 'Edit Strategy' : 'Add New Strategy'}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Field.Root mb={4}>
                  <Field.Label>Strategy Name</Field.Label>
                  <Input {...register("strategy", { required: "Name is required" })} />
                  {errors.strategy && (
                    <Field.ErrorText>{errors.strategy.message}</Field.ErrorText>
                  )}
                </Field.Root>
                <AsyncDropdown
                  name="play_type"
                  control={control}
                  label="Play Type"
                  placeholder="Select play type"
                  collection={playTypeCollection}
                  isLoading={isLoading}
                  itemToKey={(item) => item.id}
                  disabled={mode==="edit"}
                  renderItem={(item) => (
                    <Stack gap={0}>
                      <Text>{item.name}</Text>
                    </Stack>
                  )}
                />
                <AsyncDropdown
                  name="strategy_type"
                  control={control}
                  label="Strategy Type"
                  placeholder="Select strategy type"
                  collection={stratTypeCollection}
                  isLoading={isLoading}
                  itemToKey={(item) => item.strategy_type}
                  disabled={mode==="edit"}
                  renderItem={(item) => (
                    <Stack gap={0}>
                      <Text>{item.strategy_type}</Text>
                    </Stack>
                  )}
                />
                <Field.Root mb={4}>
                  <Field.Label>Description</Field.Label>
                  <Textarea
                    placeholder="Brief description"
                    {...register("description", { required: "Description is required" })}
                    size="xl"
                    variant="outline"
                  />
                  {errors.description && (
                    <Field.ErrorText>{errors.description.message}</Field.ErrorText>
                  )}
                </Field.Root>
              </Dialog.Body>
              <Dialog.Footer display="flex" justifyContent="space-between">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={!isValid || isSubmitting}
                >
                  {mode === "edit" ? 'Update' : 'Add'}
                </Button>
                <Button variant="ghost" onClick={onClose} mt={4}>
                  Cancel
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
