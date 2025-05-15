"use client";

import React, { useState } from "react";
import {
  Text,
  HStack,
  Flex,
  Button,
  IconButton,
  HStack as ChakraHStack,
} from "@chakra-ui/react";
import { Field, NativeSelect, NumberInput as ChakraNumberInput } from "@chakra-ui/react";
import CustomDropdownInput from "./custom-dropdown-with-add";
import { LuMinus, LuPlus } from "react-icons/lu";

// Placeholder components – replace these with your actual subforms later.
const ScoreForm = () => <Text mt={4}>[ScoreForm Placeholder]</Text>;
const TurnoverForm = () => <Text mt={4}>[TurnoverForm Placeholder]</Text>;

interface PossessionFormProps {
  possessionNumber: number;
  offenceTeam: string;
  dInitPlay: string;
  setDInitPlay: (val: string) => void;
  dInitSucc: string;
  setDInitSucc: (val: string) => void;
  oInitPlay: string;
  setOInitPlay: (val: string) => void;
  oInitSucc: string;
  setOInitSucc: (val: string) => void;
  dMainPlay: string;
  setDMainPlay: (val: string) => void;
  oMainPlay: string;
  setOMainPlay: (val: string) => void;
  dInitPlays: { play: string }[];
  oInitPlays: { play: string }[];
  dMainPlays: { play: string }[];
  oMainPlays: { play: string }[];
}

export default function PossessionForm(props: PossessionFormProps) {
  const {
    possessionNumber,
    offenceTeam,
    dInitPlay,
    setDInitPlay,
    dInitSucc,
    setDInitSucc,
    oInitPlay,
    setOInitPlay,
    oInitSucc,
    setOInitSucc,
    dMainPlay,
    setDMainPlay,
    oMainPlay,
    setOMainPlay,
    dInitPlays,
    oInitPlays,
    dMainPlays,
    oMainPlays,
  } = props;

  // Local state for tracking the outcome of the possession:
  // "score" will present the score form (ending possessions),
  // "turnover" will present the turnover form (then a new possession form will be needed)
  const [possessionOutcome, setPossessionOutcome] = useState<"score" | "turnover" | null>(null);

  return (
    <>
      {/* Possession header */}
      <Text fontSize="2xl" mb={4}>
        Possession #{possessionNumber} – Offence: {offenceTeam}
      </Text>

      {/* Possession fields */}
      <HStack gap={4}>
        <CustomDropdownInput
          label="Defence Initiation"
          placeholder="e.g. Flex"
          value={dInitPlay}
          onChange={(val) => setDInitPlay(val)}
          options={dInitPlays.map((p) => ({ value: p.play, label: p.play }))}
          customOptionValue="+ Add Strategy"
        />
        <Field.Root mb={4}>
          <Field.Label>Initiation Successful?</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              placeholder="Select option"
              value={dInitSucc}
              onChange={(e) => setDInitSucc(e.currentTarget.value)}
            >
              <option value="true">Successful</option>
              <option value="false">Unsuccessful</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
      </HStack>

      <HStack gap={4}>
        <CustomDropdownInput
          label="Offence Initiation"
          placeholder="e.g. Slash"
          value={oInitPlay}
          onChange={(val) => setOInitPlay(val)}
          options={oInitPlays.map((p) => ({ value: p.play, label: p.play }))}
        />
        <Field.Root mb={4}>
          <Field.Label>Initiation Successful?</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              placeholder="Select option"
              value={oInitSucc}
              onChange={(e) => setOInitSucc(e.currentTarget.value)}
            >
              <option value="true">Successful</option>
              <option value="false">Unsuccessful</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
      </HStack>

      <HStack gap={4}>
        <CustomDropdownInput
          label="Defence Main Play"
          placeholder="e.g. Flick"
          value={dMainPlay}
          onChange={(val) => setDMainPlay(val)}
          options={dMainPlays.map((p) => ({ value: p.play, label: p.play }))}
        />
        <CustomDropdownInput
          label="Offence Main Play"
          placeholder="e.g. Vertical Stack"
          value={oMainPlay}
          onChange={(val) => setOMainPlay(val)}
          options={oMainPlays.map((p) => ({ value: p.play, label: p.play }))}
        />
      </HStack>

      <Field.Root mb={4}>
        <Field.Label>Throws</Field.Label>
        <ChakraNumberInput.Root defaultValue="0" unstyled spinOnPress={false}>
          <ChakraHStack gap={2}>
            <ChakraNumberInput.DecrementTrigger asChild>
              <IconButton variant="outline" size="sm">
                <LuMinus />
              </IconButton>
            </ChakraNumberInput.DecrementTrigger>
            <ChakraNumberInput.ValueText textAlign="center" fontSize="lg" minW="3ch" />
            <ChakraNumberInput.IncrementTrigger asChild>
              <IconButton variant="outline" size="sm">
                <LuPlus />
              </IconButton>
            </ChakraNumberInput.IncrementTrigger>
          </ChakraHStack>
        </ChakraNumberInput.Root>
      </Field.Root>

      {/* Outcome buttons */}
      <Flex direction="row" justifyContent="center" mt={4} gap={4}>
        <Button
          onClick={() => setPossessionOutcome("score")}
          colorScheme={possessionOutcome === "score" ? "blue" : "gray"}
        >
          Score
        </Button>
        <Button
          onClick={() => setPossessionOutcome("turnover")}
          colorScheme={possessionOutcome === "turnover" ? "blue" : "gray"}
        >
          Turnover
        </Button>
      </Flex>

      {/* Conditional subform rendering */}
      {possessionOutcome === "score" && <ScoreForm />}
      {possessionOutcome === "turnover" && <TurnoverForm />}
    </>
  );
}
