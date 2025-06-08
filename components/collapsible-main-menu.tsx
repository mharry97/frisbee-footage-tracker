import MainMenu from "@/components/main-menu"
import React from "react";
import {Box, Collapsible, HStack, Separator} from "@chakra-ui/react";
import { FaAngleDown } from "react-icons/fa";

interface CollapsibleMainMenuProps {
  is_admin: boolean;
  is_home?: boolean;
}

export default function CollapsibleMainMenu({is_admin, is_home}: CollapsibleMainMenuProps) {
  return (
    <>
      <Collapsible.Root>
        <Collapsible.Trigger paddingY="3">
          <Box _hover={{ bg: "gray.800", borderColor: "gray.400" }} borderRadius="md" _focus={{ borderColor: "gray.400" }}>
            <HStack p={2}>
              Menu
              <FaAngleDown />
            </HStack>
          </Box>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <MainMenu is_admin={is_admin} is_home={is_home} />
        </Collapsible.Content>
      </Collapsible.Root>
      <Separator mb={4} />
    </>
  )
}
