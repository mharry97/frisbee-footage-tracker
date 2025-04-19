"use client"
import React, { useState } from "react";
import { CustomModal } from "@/components/modal";


import { SupabaseSelect } from "@/components/ui/standard-dropdown";
import { AddableSupabaseSelect } from "@/components/ui/drop-down-with-add";
import { TextInput } from "@/components/ui/text-input";
import { DateInput } from "@/components/ui/date-input";

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

  const isGame = eventType === "Game";
  const isTrainingOrScrimmage = eventType === "Training" || eventType === "Scrimmage";

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
      if (!eventType) return;
      await onAddEvent(
        title,
        eventDate,
        eventType as EventType,
        team1,
        team2
      );
      onClose();
      resetFields();
    } catch (err) {
      console.error("Error adding event:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const canAdd =
    eventType &&
    (!(eventType === "Game") || (eventType === "Game" && title)) &&
    ((isGame || isTrainingOrScrimmage) ? eventDate : true);

  return (
    <CustomModal isOpen={isOpen} onClose={handleCancel} title="Add New Event">

      {/* Event type, remainder of form depends on this */}
      <SupabaseSelect
        label="Event Type"
        tableName="events"
        displayColumn="type"
        value={eventType}
        onChange={setEventType}
        isRequired
      />

      {/* Title for when type is game */}
      {isGame && (
        <TextInput
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="e.g. Nationals 2024"
          isRequired
        />
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
          <AddableSupabaseSelect
            label="Team 1"
            tableName="teams"
            displayColumn="team_name"
            value={team1}
            onChange={setTeam1}
          />
          <AddableSupabaseSelect
            label="Team 2"
            tableName="teams"
            displayColumn="team_name"
            value={team2}
            onChange={setTeam2}
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
