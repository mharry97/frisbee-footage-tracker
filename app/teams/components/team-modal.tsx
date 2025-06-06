import {Button, CloseButton, Container, Dialog, Field, Input, Portal, Text, useDisclosure} from "@chakra-ui/react";
import React from "react";
import FloatingPlusButton from "@/components/ui/floating-plus.tsx";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {addTeam} from "@/app/teams/supabase.ts";


const schema = z.object({
  team_name: z.string(),
})

type TeamData = z.infer<typeof schema>

export default function TeamModal() {
  const {
    register,
    handleSubmit,
    setError,
    formState: {errors, isSubmitting}} = useForm<TeamData>({ resolver: zodResolver(schema) })
  const queryClient = useQueryClient()
  const { open, onOpen, onClose } = useDisclosure()

  const { mutateAsync: addTeamMutation } = useMutation({
    mutationFn: addTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      onClose();
    }
  })

  const onSubmit: SubmitHandler<TeamData> = async (data) => {
    try {
      await addTeamMutation(data.team_name);
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


  return (
    <Container>
      <Dialog.Root open={open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
        <Dialog.Trigger asChild>
          <FloatingPlusButton />
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>New Team</Dialog.Header>
              <Dialog.Body>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Field.Root>
                    <Field.Label>Team Name</Field.Label>
                    <Input {...register("team_name")} />
                    {errors.team_name && (
                      <Field.ErrorText>{errors.team_name.message}</Field.ErrorText>
                    )}
                  </Field.Root>
                  <Button type="submit" disabled={isSubmitting} mt={4}>
                    Add Team
                  </Button>
                  {errors.root && (
                    <Text color="red" mt={4}>{errors.root.message}</Text>
                  )}
                </form>
              </Dialog.Body>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

    </Container>
  )
}
