import React, { useState } from "react";
import {
  Dialog,
  Button,
  Portal,
  Field,
  Input,
  CloseButton,
  Textarea
} from "@chakra-ui/react";
import {addPlaylist} from "@/app/playlists/supabase";
import { useToast } from "@chakra-ui/toast";


interface AddClipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPlaylistModal({ isOpen, onClose }: AddClipModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  function handleCancel() {
    onClose();
    resetForm();
  }

  function resetForm() {
    setTitle("");
    setDescription("");
  }

  async function handleAdd() {
    try {
      setIsSubmitting(true);

      await addPlaylist({
        title,
        description,
        is_public: true,
        creator: '5e75ce13-baa6-46ed-92f4-1f1cd8e195bf'
      });

      onClose();
      resetForm();
    } catch (error) {
      console.error("Error saving playlist:", error);
      toast({
        title: "Failed to save playlist",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Add Playlist</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Field.Root mb={4}>
                <Field.Label>Title</Field.Label>
                <Input
                  placeholder="Playlist Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Field.Root>
              <Field.Root mb={4}>
                <Field.Label>Description</Field.Label>
                <Textarea
                  placeholder="Brief outline of the sort of clips found in the playlist"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  size="xl"
                  variant="outline"
                  required
                />
              </Field.Root>
            </Dialog.Body>
            <Dialog.Footer display="flex" justifyContent="space-between">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={handleAdd}
                loading={isSubmitting}
                disabled={!title || !description}
              >
                Add
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="2" right="2" onClick={handleCancel} />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
