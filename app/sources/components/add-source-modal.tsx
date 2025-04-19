import React, { useState } from "react";
import { CustomModal } from "@/components/modal";
import {Field, Input} from "@chakra-ui/react"
import { DateInput } from "@/components/ui/date-input";

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSource: (title: string, url: string, recordedDate: string) => Promise<void>;
}

export function AddSourceModal({ isOpen, onClose, onAddSource }: AddSourceModalProps) {
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [recordedDate, setRecordedDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetFields() {
    setTitle("");
    setSourceUrl("");
    setRecordedDate("");
  }

  function handleCancel() {
    onClose();
    resetFields();
  }

  async function handleAdd() {
    try {
      setIsSubmitting(true);
      await onAddSource(title, sourceUrl, recordedDate);
      onClose();
      resetFields();
    } catch (error) {
      console.error("Error adding source:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // If not open, render nothing
  if (!isOpen) return null;

  return (
    <CustomModal isOpen={isOpen} onClose={handleCancel} title="Add Source">
      {/* The Chakra form components below */}
      <Field.Root mb={4}>
        <Field.Label>Title</Field.Label>
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />
      </Field.Root>
      <Field.Root mb={4}>
        <Field.Label>Source URL</Field.Label>
        <Input
          placeholder="URL"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.currentTarget.value)}
        />
      </Field.Root>
      <DateInput
        label="Recorded Date"
        value={recordedDate}
        onChange={setRecordedDate}
        isRequired
      />

      <div style={buttonContainerStyle}>
        <button
          onClick={handleCancel}
          style={{ ...buttonStyle, backgroundColor: "#2a2a2a" }}
        >
          Cancel
        </button>
        <button
          onClick={handleAdd}
          style={{ ...buttonStyle, backgroundColor: "green" }}
          disabled={!title || !sourceUrl || !recordedDate || isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add"}
        </button>
      </div>
    </CustomModal>
  );
}

/** Minimal inline styling for the bottom buttons */
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
