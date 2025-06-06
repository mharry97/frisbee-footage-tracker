import {z} from 'zod'
import {Button, Container, Field, Input, VStack, Text} from "@chakra-ui/react";
import {SubmitHandler, useForm} from "react-hook-form";
import React from "react";
import {supabase} from "@/lib/supabase.ts";
import {zodResolver} from "@hookform/resolvers/zod";
import type { Source } from "@/app/sources/supabase";

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

const SourceForm = ({ mode, currentSourceData, onSuccess }: PortalProps) => {

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
  const onSubmit: SubmitHandler<SourceData> = async (data) => {
    const payload =
      mode === "edit" && currentSourceData?.source_id
        ? { ...data, source_id: currentSourceData.source_id }
        : data;

    const query = supabase.from("sources");

    const { error } =
      mode === "edit"
        ? await query.upsert(payload, { onConflict: "source_id" })
        : await query.insert(payload);

    if (error) {
      setError("root", {
        message: error.message,
      });
    }
    if (typeof onSuccess === "function") {
      onSuccess?.();
    }
  };

  return(
    <Container>
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
        <Button type="submit" disabled={isSubmitting} mt={4}>
          {mode === "edit" ? "Update" : "Add"} Source
        </Button>
        {errors.root && (
          <Text color="red" mt={4}>{errors.root.message}</Text>
        )}
      </form>
    </Container>
  )
}

export default SourceForm;
