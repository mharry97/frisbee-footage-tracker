"use client"
import React, {useEffect, useState} from "react";
import { CustomModal } from "@/components/modal";

import { DateInput } from "@/components/ui/date-input";
import {Field, Input, NativeSelect} from "@chakra-ui/react";
import CustomDropdownInput from "@/app/events/[id]/[point_id]/components/custom-dropdown-with-add";
import { fetchTeams, upsertTeam } from "@/app/teams/supabase"
import {Team} from "@/lib/supabase";

export type EventType = "Game" | "Training" | "Scrimmage";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (
    title: string,
    eventDate: string,
    eventType: EventType,
    team1: string,
    team2: string
  ) => Promise<void>;
}

export function AddEventModal({
  isOpen,
  onClose,
  onAddEvent,
}: AddEventModalProps) {
  const [eventType, setEventType] = useState("");
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);

  const isGame = eventType === "Game";
  const isTrainingOrScrimmage = eventType === "Training" || eventType === "Scrimmage";

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const teams = await fetchTeams();
    setTeams(teams);
  };

  function resetFields() {
    setEventType("");
    setTitle("");
    setEventDate("");
    setTeam1("");
    setTeam2("");
  }

  function handleCancel() {
    onClose();
    resetFields();
  }

  async function handleAdd() {
    try {
      setIsSubmitting(true);
      let team_1_final = team1
      let team_2_final = team2
      if (!teams.some(t => t.team_id === team1)) {
        const team_1_ret = await upsertTeam(team1);
        team_1_final = team_1_ret.team_id
      }
      if (!teams.some(t => t.team_id === team2)) {
        const team_2_ret = await upsertTeam(team2);
        team_2_final = team_2_ret.team_id
      }
      if (!eventType) return;
      await onAddEvent(
        title,
        eventDate,
        eventType as EventType,
        team_1_final,
        team_2_final
      );
      onClose();
      resetFields();
    } catch (err) {
      console.error("Error adding event:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const eventTypes = ["Game", "Training", "Scrimmage"];

  const canAdd =
    eventType &&
    (!(eventType === "Game") || (eventType === "Game" && title)) &&
    ((isGame || isTrainingOrScrimmage) ? eventDate : true);

  return (
    <CustomModal isOpen={isOpen} onClose={handleCancel} title="Add New Event">

      {/* Event type, remainder of form depends on this */}
      <Field.Root mb={4}>
        <Field.Label>Event Type</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field
            placeholder="Select Event Type"
            value={eventType}
            onChange={(e) => setEventType(e.currentTarget.value)}
          >
            {eventTypes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>

      {/* Title for when type is game */}
      {isGame && (
        <Field.Root mb={4}>
          <Field.Label>Title</Field.Label>
          <Input
            placeholder="e.g. Nationals 2024"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
          />
        </Field.Root>
      )}

      {/* Date input */}
      {(isGame || isTrainingOrScrimmage) && (
        <DateInput
          label="Date"
          value={eventDate}
          onChange={setEventDate}
          isRequired
        />
      )}

      {/* Team fields for game */}
      {isGame && (
        <>
          <CustomDropdownInput
            label="Team 1"
            placeholder="Team 1"
            value={team1}
            onChange={(val) => setTeam1(val)}
            options={teams.map((t) => ({ value: t.team_id, label: t.team_name }))} // This probably isn't smart but i don't need ids here
          />
          <CustomDropdownInput
            label="Team 2"
            placeholder="Team 2"
            value={team2}
            onChange={(val) => setTeam2(val)}
            options={teams.map((t) => ({ value: t.team_id, label: t.team_name }))}  // This probably isn't smart but i don't need ids here
          />
        </>
      )}

      {/* Buttons */}
      <div style={buttonContainerStyle}>
        <button
          onClick={handleCancel}
          style={{ ...buttonStyle, backgroundColor: "#2a2a2a" }}
        >
          Cancel
        </button>
        <button
          onClick={handleAdd}
          style={{
            ...buttonStyle,
            backgroundColor: "green",
            opacity: canAdd ? 1 : 0.6,
          }}
          disabled={!canAdd || isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add"}
        </button>
      </div>
    </CustomModal>
  );
}


const buttonContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "1rem",
};

const buttonStyle: React.CSSProperties = {
  color: "white",
  padding: "0.5rem 1rem",
  borderRadius: "4px",
  border: "none",
  cursor: "pointer",
};
