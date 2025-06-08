import {Heading} from "@chakra-ui/react";
import React from "react";
import BackButton from "@/components/back-button.tsx";
import CollapsibleMainMenu from "@/components/collapsible-main-menu.tsx";

interface StandardHeaderProps {
  text: string;
  is_admin: boolean;
  is_home?: boolean;
}

export default function StandardHeader({text, is_admin, is_home}: StandardHeaderProps) {
  return (
    <>
      <BackButton />
      <Heading as="h1" fontWeight="light" size='4xl' color="white" mb={4} mt={4}>
        {text}
      </Heading>
      <CollapsibleMainMenu is_admin={is_admin} is_home={is_home} />
    </>
  )
}
