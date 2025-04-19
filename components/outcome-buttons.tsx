// "use client";
//
// import React, { useState } from "react";
// import { Box, Button, HStack, Text } from "@chakra-ui/react";
// import { v4 as uuidv4 } from "uuid";
// import ScoreForm from "@/components/score-form";
// import TurnoverForm from "@/components/turnover-form";
//
// type Outcome = "score" | "turnover";
//
// type Possession = {
//   id: string;
//   outcome: Outcome;
//   // ... include any additional fields you want for each possession
// };
//
// export default function PossessionManager() {
//   const [possessions, setPossessions] = useState<Possession[]>([]);
//
//   // Adds a new possession with the given outcome
//   const addPossession = (outcome: Outcome) => {
//     setPossessions((prev) => [...prev, { id: uuidv4(), outcome }]);
//   };
//
//   // This example renders two buttons and a list of possession forms:
//   return (
//     <Box>
//       <Text mb={2}>Select Outcome for Possession:</Text>
//       <HStack gap={4}>
//         <Button
//           colorScheme="green"
//           onClick={() => addPossession("score")}
//           variant="ghost"
//           _hover={{ bg: "#252525" }}
//         >
//           Score
//         </Button>
//         <Button
//           colorScheme="green"
//           onClick={() => addPossession("turnover")}
//           variant="ghost"
//           _hover={{ bg: "#252525" }}
//         >
//           Turnover
//         </Button>
//       </HStack>
//       <Text mt={2}>
//         Number of possessions: <strong>{possessions.length}</strong>
//       </Text>
//       {possessions.map((possession) => (
//         <Box key={possession.id} mt={4}>
//           {possession.outcome === "score" ? (
//             <ScoreForm possession={possession} />
//           ) : (
//             <TurnoverForm possession={possession} />
//           )}
//         </Box>
//       ))}
//       {/* A button here could later trigger saving all possessions to Supabase */}
//       <Button mt={4} colorScheme="blue">
//         Save Possessions
//       </Button>
//     </Box>
//   );
// }
