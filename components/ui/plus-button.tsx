"use client";

import React from "react";
import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";


const FloatingActionButton: React.FC<IconButtonProps> = (props) => {
  return (
    <IconButton
      position="fixed"
      bottom={4}
      right={4}
      zIndex={9999}
      colorPalette="green"
      rounded="full"
      size="lg"
      boxShadow="lg"
      {...props}
    >
      <AddIcon />
    </IconButton>
  );
};

export default FloatingActionButton;
