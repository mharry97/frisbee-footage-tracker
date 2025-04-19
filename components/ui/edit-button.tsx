"use client";

import React from "react";
import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { LuPencil } from "react-icons/lu";


const EditButton: React.FC<IconButtonProps> = (props) => {
  return (
    <IconButton
      position="absolute"
      variant="ghost"
      zIndex={9999}
      right={1}
      bottom={1}
      colorPalette="gray"
      rounded="full"
      size="2xs"
      boxShadow="2xs"
      {...props}
    >
      <LuPencil />
    </IconButton>
  );
};

export default EditButton;
