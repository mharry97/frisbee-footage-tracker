"use client";

import React from "react";
import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { IoMdAdd } from "react-icons/io";

// Use forwardRef so Dialog.Trigger can access the ref
const FloatingPlusButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (props, ref) => {
    return (
      <IconButton
        ref={ref}
        position="fixed"
        bottom={4}
        right={4}
        zIndex={9999}
        rounded="full"
        size="lg"
        boxShadow="lg"
        aria-label="Add Source"
        {...props}
      >
        <IoMdAdd />
      </IconButton>
    );
  }
);

FloatingPlusButton.displayName = "FloatingPlusButton";

export default FloatingPlusButton;
