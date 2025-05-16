import React, {useEffect, useMemo, useState} from "react";
import {
  Dialog,
  Button,
  Portal,
  Field,
  Input,
  Select,
  CloseButton,
  Textarea,
  createListCollection
} from "@chakra-ui/react";
import {fetchPlaylists, upsertPlaylistClip} from "@/app/playlists/supabase";
import { useToast } from "@chakra-ui/toast";
import type { PlaylistWithCreator } from "@/app/playlists/supabase";
import {upsertClip} from "@/app/clips/supabase";
import { baseUrlToTimestampUrl } from "@/lib/utils";

interface AddClipModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  baseUrl: string;
}

export function AddClipModal({ isOpen, onClose, eventId, baseUrl }: AddClipModalProps) {
  const [title, setTitle] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [description, setDescription] = useState("");
  const [playlists, setPlaylists] = useState<PlaylistWithCreator[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();


  useEffect(() => {
    async function loadPlaylists() {
      const playlists = await fetchPlaylists();
      setPlaylists(playlists);
    }
    void loadPlaylists();
  }, []);

  useEffect(() => {
    (async () => {
      const playlists = await fetchPlaylists();
      setPlaylists(playlists);
    })();
  }, []);

  const collection = useMemo(
    () =>
      createListCollection({
        items: playlists.map((p) => ({
          value: p.playlist_id,
          label: p.title,
        })),
      }),
    [playlists],
  );

  function handleCancel() {
    onClose();
    resetForm();
  }

  function resetForm() {
    setTitle("");
    setTimestamp("");
    setDescription("");
    setSelectedPlaylists([]);
  }

  async function handleAdd() {
    try {
      setIsSubmitting(true);

      const newClip = await upsertClip({
        title,
        event_id: eventId,
        timestamp,
        description,
        is_public: true,
        timestamp_url: baseUrlToTimestampUrl(baseUrl, timestamp)
      });

      await upsertPlaylistClip(
        selectedPlaylists.map((pid) => ({
          playlist_id: pid,
          clip_id: newClip.clip_id,
        })),
      );

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
              <Select.Root multiple
                           collection={collection}
                           size="sm"
                           width="320px"
                           value={selectedPlaylists}
                           onValueChange={(d) => setSelectedPlaylists(d.value as string[])}>
                <Select.HiddenSelect />
                <Select.Label>Playlist</Select.Label>
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Select playlists/s" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content
                      zIndex="popover">
                      {collection.items.map((playlist) => (
                        <Select.Item item={playlist} key={playlist.value}>
                          {playlist.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>


            </Dialog.Body>

            <Dialog.Footer display="flex" justifyContent="space-between">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                colorPalette="green"
                onClick={handleAdd}
                isLoading={isSubmitting}
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
