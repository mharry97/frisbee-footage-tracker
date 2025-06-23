"use client";

import React from "react";
import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { IoMdAdd } from "react-icons/io";


const FloatingActionButton: React.FC<IconButtonProps> = (props) => {
  return (
    <IconButton
      position="fixed"
      bottom={4}
      right={4}
      zIndex={9999}
      rounded="full"
      size="lg"
      boxShadow="lg"
      {...props}
    >
      <IoMdAdd />
    </IconButton>
  );
};

export default FloatingActionButton;
