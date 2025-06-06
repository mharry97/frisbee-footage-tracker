import React, {useEffect, useState} from "react";
import {
  Dialog,
  Button,
  Portal,
  Field,
  Input,
  CloseButton,
  Textarea,
  NativeSelect
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import {Source} from "@/app/sources/supabase";
import {fetchSources} from "@/app/sources/supabase";
import {upsertClip} from "@/app/clips/supabase";
import {baseUrlToTimestampUrl} from "@/lib/utils";
import {upsertPlaylistClip} from "@/app/playlists/supabase";

interface AddSourceClipModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
}

export function AddSourceClipModal({ isOpen, onClose, playlistId }: AddSourceClipModalProps) {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [timestamp, setTimestamp] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
        // Get all the required data
        const sourcesData = await fetchSources();
        setSources(sourcesData);
    }
    void fetchData();
  }, [toast]);


  function handleCancel() {
    onClose();
    resetForm();
  }

  function resetForm() {
    setTitle("");
    setSource("");
    setTimestamp("");
    setDescription("");
  }

  async function handleAdd() {
    try {
      setIsSubmitting(true);

      const newSourceClip = await upsertClip({
        title,
        event_id: null,
        timestamp,
        description,
        is_public: true,
        timestamp_url: baseUrlToTimestampUrl(source, timestamp)
      });

      await upsertPlaylistClip({
        playlist_id: playlistId,
        clip_id: newSourceClip.clip_id,
      });


      toast({
        title: "Clip saved successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      resetForm();
    } catch (error) {
      console.error("Error saving clip:", error);
      toast({
        title: "Failed to save clip",
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
              <Dialog.Title>Add Clip</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Field.Root mb={4}>
                <Field.Label>Title</Field.Label>
                <Input
                  placeholder="Clip Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Field.Root>

              <Field.Root mb={4}>
                <Field.Label>Source</Field.Label>
                <NativeSelect.Root>
                  <NativeSelect.Field
                    placeholder="Select Source"
                    value={source}
                    onChange={(e) => setSource(e.currentTarget.value)}
                  >
                    {sources.map((s) => (
                      <option key={s.source_id} value={s.url}>
                        {s.title}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>

              <Field.Root mb={4}>
                <Field.Label>Timestamp</Field.Label>
                <Input
                  placeholder="e.g. 6:32"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                />
              </Field.Root>

              <Field.Root mb={4}>
                <Field.Label>Description</Field.Label>
                <Textarea
                  placeholder="Optional description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  size="xl"
                  variant="outline"
                />
              </Field.Root>
            </Dialog.Body>

            <Dialog.Footer display="flex" justifyContent="space-between">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                colorPalette="green"
                onClick={handleAdd}
                loading={isSubmitting}
                disabled={!title || !timestamp}
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
