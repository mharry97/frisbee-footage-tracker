import {Box, Spinner, Text} from "@chakra-ui/react";
import React from "react";

type LoadingSpinnerProps = {
  text: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text }) => {
  return (
    <Box display="flex" minH="50vh">
      <Spinner size="md" color="yellow" mr={2} />
      <Text color="white" fontSize="lg">
        {text}
      </Text>
    </Box>
  )
}

export default LoadingSpinner;
