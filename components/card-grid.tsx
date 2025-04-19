import React from "react";
import { Grid, GridProps } from "@chakra-ui/react";

interface BaseGridProps extends GridProps {
  children: React.ReactNode;
}

export const BaseGrid: React.FC<BaseGridProps> = ({ children, ...props }) => {
  return (
    <Grid
      templateColumns={{ base: "repeat(1, minmax(250px, 1fr))", md: "repeat(3, minmax(250px, 1fr))" }} gap={4}
      {...props}
    >
      {children}
    </Grid>
  );
};
