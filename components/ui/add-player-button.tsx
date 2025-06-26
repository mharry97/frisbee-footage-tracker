import {Button, HStack, Icon, Text} from "@chakra-ui/react";
import { RiUserAddLine } from "react-icons/ri";
import React from "react";


const AddPlayerButton = React.forwardRef<
  HTMLButtonElement,
  ActionButtonProps
>(({...props}, ref) => {
  return (
    <Button ref={ref} {...props} variant="ghost">
      <HStack>
        <Icon>
          <RiUserAddLine />
        </Icon>
        <Text>Add player</Text>
      </HStack>
    </Button>
  )
});

AddPlayerButton.displayName = "AddPlayerButton";

export default AddPlayerButton;
