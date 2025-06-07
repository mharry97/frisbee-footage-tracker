import {z} from 'zod'
import {
  Button,
  Container,
  Field,
  Input,
  VStack,
  Text,
  useDisclosure,
  Dialog,
  Portal,
  HStack
} from "@chakra-ui/react";
import {SubmitHandler, useForm} from "react-hook-form";
import React from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {addSource, editSource, Source} from "@/app/sources/supabase";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import FloatingPlusButton from "@/components/ui/floating-plus.tsx";

interface PortalProps {
  mode: "add" | "edit";
  currentSourceData?: Source;
  onSuccess?: () => void;
}

const schema = z.object({
  title: z.string(),
  url: z.string(),
  recorded_date: z.string(),
});

type SourceData = z.infer<typeof schema>;

const SourceForm = ({ mode, currentSourceData }: PortalProps) => {
  const queryClient = useQueryClient()
  const { open, onOpen, onClose } = useDisclosure()
  const {
    register,
    handleSubmit,
    setError,
    formState: {errors, isSubmitting}} = useForm<SourceData>({
    resolver:zodResolver(schema),
    defaultValues: currentSourceData
      ? {
        ...currentSourceData,
        recorded_date: currentSourceData.recorded_date?.split("T")[0] || "",
      }
      : {
        title: "",
        url: "",
        recorded_date: "",
      },
  })

  const { mutateAsync: addSourceMutation } = useMutation({
    mutationFn: addSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] })
      onClose();
    }
  })

  const { mutateAsync: editSourceMutation } = useMutation({
    mutationFn: editSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] })
      onClose();
    }
  })

  const onSubmit: SubmitHandler<SourceData> = async (data) => {
    try {
      if (mode === "add") {
        await addSourceMutation(data);
      } else {
        await editSourceMutation({ ...data, source_id: currentSourceData!.source_id });
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
    <Container>
      {mode === "add" ? <FloatingPlusButton onClick={onOpen} /> : <Button variant="solid" onClick={onOpen}>Edit</Button>}
      <Dialog.Root open={open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>{mode === "add" ? "New Source" : "Edit Source"}</Dialog.Header>
              <Dialog.Body>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <VStack gap={4}>
                    <Field.Root>
                      <Field.Label>Title</Field.Label>
                      <Input {...register("title")} />
                      {errors.title && (
                        <Field.ErrorText>{errors.title.message}</Field.ErrorText>
                      )}
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>URL</Field.Label>
                      <Input {...register("url")} />
                      {errors.url && (
                        <Field.ErrorText>{errors.url.message}</Field.ErrorText>
                      )}
                    </Field.Root>
                    <Field.Root >
                      <Field.Label>Recorded Date</Field.Label>
                      <Input {...register("recorded_date")} type="date" />
                      {errors.recorded_date && (
                        <Field.ErrorText>{errors.recorded_date.message}</Field.ErrorText>
                      )}
                    </Field.Root>
                  </VStack>
                  <HStack justify="space-between">
                    <Button type="submit" disabled={isSubmitting} mt={4}>
                      {mode === "add" ? "Add Source" : "Update Source"}
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
    </Container>
  )
}

export default SourceForm;
