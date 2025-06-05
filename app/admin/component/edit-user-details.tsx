import {
  HiLockClosed,
  HiShieldCheck,
  HiUser
} from "react-icons/hi";
import {
  Container,
  Input,
  Field,
  Button,
  VStack,
  CheckboxCard,
  SimpleGrid,
  Icon,
  Float
} from "@chakra-ui/react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";


interface EditUserDetailsPortalProps {
  onSuccess: () => void;
  defaultValues: {
    player_name: string;
    email: string;
    is_active: boolean;
    is_admin: boolean;
    is_editor: boolean;
  };
  playerId: string;
  auth_user_id: string;
}

// Schema
const schema = z.object({
  player_name: z.string(),
  email: z.string().includes("@app.local", { message: "Email must include @app.local" }),
  is_active: z.boolean(),
  is_editor: z.boolean(),
  is_admin: z.boolean(),
});

type UserFormData = z.infer<typeof schema>;

const roleItems = [
  {
    key: "is_active",
    icon: <HiLockClosed />,
    label: "Active",
    description: "Active account",
  },
  {
    key: "is_editor",
    icon: <HiUser />,
    label: "Editor",
    description: "Can manage events",
  },
  {
    key: "is_admin",
    icon: <HiShieldCheck />,
    label: "Admin",
    description: "Full access",
  },
];

export default function EditUserDetailsPortal({
                                                onSuccess,
                                                defaultValues,
                                                playerId,
                                                auth_user_id,
                                              }: EditUserDetailsPortalProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    try {
      console.log("Submitting data:", data);
      await fetch("/api/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, player_id:playerId, auth_user_id }),
      })

      onSuccess?.();
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  return (
    <Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={4}>
          <Field.Root>
            <Field.Label>Player Name</Field.Label>
            <Input {...register("player_name")} />
            {errors.player_name && (
              <Field.ErrorText>{errors.player_name.message}</Field.ErrorText>
            )}
          </Field.Root>
          <Field.Root>
            <Field.Label>Email</Field.Label>
            <Input {...register("email")} />
            {errors.email && (
              <Field.ErrorText>{errors.email.message}</Field.ErrorText>
            )}
          </Field.Root>
          <SimpleGrid minChildWidth="200px" gap={2}>
            {roleItems.map((item) => (
              <Controller
                key={item.key}
                control={control}
                name={item.key as keyof UserFormData}
                render={({ field }) => (
                  <CheckboxCard.Root
                    align="center"
                    checked={!!field.value}
                    onCheckedChange={({ checked }) => field.onChange(checked)}
                  >
                    <CheckboxCard.HiddenInput />
                    <CheckboxCard.Control>
                      <CheckboxCard.Content>
                        <Icon fontSize="2xl" mb="2">
                          {item.icon}
                        </Icon>
                        <CheckboxCard.Label>{item.label}</CheckboxCard.Label>
                        <CheckboxCard.Description>
                          {item.description}
                        </CheckboxCard.Description>
                      </CheckboxCard.Content>
                      <Float placement="top-end" offset="6">
                        <CheckboxCard.Indicator />
                      </Float>
                    </CheckboxCard.Control>
                  </CheckboxCard.Root>
                )}
              />
            ))}
          </SimpleGrid>

          <Button type="submit" disabled={isSubmitting}>
            Submit
          </Button>
        </VStack>
      </form>
    </Container>
  );
}
