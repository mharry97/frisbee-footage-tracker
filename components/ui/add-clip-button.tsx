"use client";

import React from "react";
import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { FaScissors } from "react-icons/fa6";


const FloatingClipButton: React.FC<IconButtonProps> = (props) => {
  return (
    <IconButton
      position="fixed"
      bottom={4}
      right={4}
      zIndex={9999}
      colorPalette="white"
      rounded="full"
      size="lg"
      boxShadow="lg"
      {...props}
    >
      <FaScissors />
    </IconButton>
  );
};

export default FloatingClipButton;
