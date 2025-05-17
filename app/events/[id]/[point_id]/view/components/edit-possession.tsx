import React from "react";
import {Dialog, Button, CloseButton, Portal} from "@chakra-ui/react";

type PointOverviewProps = {
  last_possession_type: string;
  possessions: number;
  scorer: string;
  outcome: string;
  onClose: () => void;
  handleUpdate: (point: PointOverviewProps) => void;
};

export default function PointOverview({
                                        last_possession_type,
                                        possessions,
                                        onClose,
                                        handleUpdate,
                                      }: PointOverviewProps) {

  return (
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Edit Possession</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>

          </Dialog.Body>

          <Dialog.Footer display="flex" justifyContent="space-between">
            <Button onClick={onClose}>Cancel</Button>
            <Button colorPalette="red" onClick={handleUpdate}>
              Update Possession
            </Button>
          </Dialog.Footer>

          <Dialog.CloseTrigger asChild>
            <CloseButton position="absolute" top="2" right="2" onClick={onClose} />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  );
}
