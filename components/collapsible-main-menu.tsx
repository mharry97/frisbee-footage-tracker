import MainMenu from "@/components/main-menu"
import React from "react";
import {Button, Collapsible, HStack, Separator} from "@chakra-ui/react";
import { FaAngleDown } from "react-icons/fa";

interface CollapsibleMainMenuProps {
  is_admin: boolean;
}

export default function CollapsibleMainMenu({is_admin}: CollapsibleMainMenuProps) {
  return (
    <>
      <Collapsible.Root>
        <Collapsible.Trigger paddingY="3">
          <Button variant={'ghost'}>
            <HStack>
              Menu
              <FaAngleDown />
            </HStack>
          </Button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <MainMenu is_admin={is_admin} />
        </Collapsible.Content>
      </Collapsible.Root>
      <Separator mb={4} />
    </>
  )
}
