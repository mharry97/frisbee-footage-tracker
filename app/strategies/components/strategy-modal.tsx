import React, { useMemo } from "react";
import { AsyncDropdown } from "@/components/async-dropdown.tsx";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchStratTypes, Strategy, upsertStrat } from "@/app/strategies/supabase.ts";
import { CustomModal } from "@/components/modal";

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

export function AddStratModal({ isOpen, onClose, mode, stratToEdit }: AddStratModalProps) {
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<AddStrat>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      strategy: mode === 'edit' ? stratToEdit?.strategy : '',
      strategy_type: mode === 'edit' ? [stratToEdit?.strategy_type] : [],
      play_type: mode === 'edit' ? [stratToEdit?.play_type] : [],
      description: mode === 'edit' ? stratToEdit?.description : '',
    },
  });
  const queryClient = useQueryClient()

  const { data: stratsData, isLoading } = useQuery({
    queryKey: ["stratTypes"],
    queryFn: fetchStratTypes,
  });

  const stratTypeCollection = useMemo(
    () => ({ items: stratsData ?? [] }),
    [stratsData]
  );

  const playTypeCollection = useMemo(() => ({ items: playTypes }), []);

  const { mutateAsync: upsertStratMutation } = useMutation({
    mutationFn: upsertStrat,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["strats"] }) }
  });

  const onSubmit = async (formData: AddStrat) => {
    try {
      await upsertStratMutation({
        strategy: formData.strategy,
        strategy_type: formData.strategy_type[0],
        play_type: formData.play_type[0],
        description: formData.description,
        strategy_id: stratToEdit?.strategy_id ?? undefined,
      });
      onClose();
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "Submission failed" });
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title={mode === "edit" ? "Edit Strategy" : "Add New Strategy"} width="500px">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-300 mb-1">Strategy Name</label>
          <input
            {...register("strategy", { required: "Name is required" })}
            className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:border-neutral-500"
          />
          {errors.strategy && <p className="text-red-400 text-xs mt-1">{errors.strategy.message}</p>}
        </div>
        <AsyncDropdown
          name="play_type"
          control={control}
          label="Play Type"
          placeholder="Select play type"
          collection={playTypeCollection}
          isLoading={isLoading}
          itemToKey={(item) => item.id}
          disabled={mode === "edit"}
          renderItem={(item) => item.name}
        />
        <AsyncDropdown
          name="strategy_type"
          control={control}
          label="Strategy Type"
          placeholder="Select strategy type"
          collection={stratTypeCollection}
          isLoading={isLoading}
          itemToKey={(item) => item.strategy_type}
          disabled={mode === "edit"}
          renderItem={(item) => item.strategy_type}
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-300 mb-1">Description</label>
          <textarea
            {...register("description", { required: "Description is required" })}
            placeholder="Brief description"
            rows={3}
            className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:border-neutral-500 resize-none"
          />
          {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
        </div>
        <div className="flex justify-between">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors disabled:opacity-50"
          >
            {mode === "edit" ? "Update" : "Add"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded hover:bg-neutral-800 text-sm transition-colors text-neutral-400"
          >
            Cancel
          </button>
        </div>
        {errors.root && <p className="text-red-400 text-xs mt-2">{errors.root.message}</p>}
      </form>
    </CustomModal>
  );
}
