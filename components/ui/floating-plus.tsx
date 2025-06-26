"use client";

import React from "react";
import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { IoMdAdd } from "react-icons/io";
import { FiEdit } from "react-icons/fi";
import { FaScissors } from "react-icons/fa6";

interface ActionButtonProps extends Omit<IconButtonProps, "icon" | "children"> {
  iconType: "add" | "edit" | "clip";
}

const FloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  ActionButtonProps
>(({ iconType, ...props }, ref) => {
  const iconMap = {
    add: <IoMdAdd />,
    edit: <FiEdit />,
    clip: <FaScissors />,
  };

  return (
    <IconButton
      ref={ref}
      position="fixed"
      bottom={4}
      right={4}
      zIndex={9999}
      colorPalette = 'gray'
      rounded="full"
      size="lg"
      boxShadow="lg"
      aria-label="Floating Button"
      {...props}
    >
      {iconMap[iconType]}
    </IconButton>
  );
});

FloatingActionButton.displayName = "FloatingActionButton";

export default FloatingActionButton;
