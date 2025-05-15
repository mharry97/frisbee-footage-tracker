// import { Box, Grid, GridItem, Text } from "@chakra-ui/react"
// import { Select } from "@chakra-ui/select"
// import { FormControl, FormLabel } from "@chakra-ui/form-control"
// import type React from "react"
//
// import { TextInput } from "@/components/ui/text-input"
// import type { Source, Team, Player } from "@/lib/supabase"
//
// interface PointInfoFormProps {
//   sources: Source[]
//   teams: Team[]
//   homePlayers: Player[]
//   pointData: {
//     sourceId: string
//     baseUrl: string
//     timestamp: string
//     offenceTeam: string
//     defenceTeam: string
//     players: string[]
//   }
//   onChange: (field: string, value: any) => void
// }
//
// export function PointInfoForm({ sources, teams, homePlayers, pointData, onChange }: PointInfoFormProps) {
//   // Handle source selection
//   const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const value = e.target.value
//     const selectedSource = sources.find((s) => s.id === value)
//     onChange("sourceId", value)
//     if (selectedSource) {
//       onChange("baseUrl", selectedSource.url)
//     }
//   }
//
//   // Handle timestamp change and calculate timestamp URL
//   const handleTimestampChange = (value: string) => {
//     onChange("timestamp", value)
//     // Timestamp URL calculation will be handled in the savePoint function
//   }
//
//   // Handle team selection
//   const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const value = e.target.value
//
//     // Find the other team (the one not selected)
//     const otherTeam = teams.find((t) => t.team_id !== value)?.team_id || ""
//
//     onChange("offenceTeam", value)
//     onChange("defenceTeam", otherTeam)
//   }
//
//   // Handle player selection
//   const handlePlayerChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
//     const value = e.target.value
//     const updatedPlayers = [...pointData.players]
//     updatedPlayers[index] = value
//     onChange("players", updatedPlayers)
//   }
//
//   // Check if either team is the home team
//   const hasHomeTeam = teams.some((team) => team.is_home_team)
//
//   console.log("Teams in PointInfoForm:", teams)
//
//   return (
//     <Box>
//       <Grid gap={4} templateColumns="repeat(2, 1fr)">
//         {/* Source Selection */}
//         <GridItem colSpan={2}>
//           <FormControl mb={4} isRequired>
//             <FormLabel color="gray.300" mb={4}>
//               Source
//             </FormLabel>
//             <Select
//               bg="#2a2a2a"
//               color="white"
//               borderColor="#3a3a3a"
//               value={pointData.sourceId}
//               onChange={handleSourceChange}
//               placeholder="Select a source"
//             >
//               {sources.map((source) => (
//                 <option key={source.id} value={source.id}>
//                   {source.title}
//                 </option>
//               ))}
//             </Select>
//           </FormControl>
//         </GridItem>
//
//         {/* Timestamp */}
//         <GridItem colSpan={2}>
//           <TextInput
//             label="Timestamp"
//             value={pointData.timestamp}
//             onChange={(val) => handleTimestampChange(val)}
//             placeholder="e.g. 1:23:45"
//             isRequired
//           />
//         </GridItem>
//
//         {/* Offence Team */}
//         <GridItem colSpan={2}>
//           <FormControl mb={4} isRequired>
//             <FormLabel color="gray.300" mb={4}>
//               Offence Team
//             </FormLabel>
//             <Select
//               bg="#2a2a2a"
//               color="white"
//               borderColor="#3a3a3a"
//               value={pointData.offenceTeam}
//               onChange={handleTeamChange}
//               placeholder="Select offence team"
//             >
//               {teams.length > 0 ? (
//                 teams.map((team) => (
//                   <option key={team.team_id} value={team.team_id}>
//                     {team.team_name}
//                   </option>
//                 ))
//               ) : (
//                 <option disabled value="">
//                   No teams available
//                 </option>
//               )}
//             </Select>
//           </FormControl>
//         </GridItem>
//
//         {/* Player Selection - Only show if there's a home team */}
//         {hasHomeTeam && homePlayers.length > 0 && (
//           <>
//             <GridItem colSpan={2}>
//               <Text color="gray.400" mt={2} mb={2}>
//                 Players
//               </Text>
//             </GridItem>
//
//             {/* Player dropdowns - up to 7 */}
//             {Array.from({ length: 7 }).map((_, index) => (
//               <GridItem key={index}>
//                 <FormControl mb={4}>
//                   <FormLabel color="gray.300" mb={4}>
//                     Player {index + 1}
//                   </FormLabel>
//                   <Select
//                     bg="#2a2a2a"
//                     color="white"
//                     borderColor="#3a3a3a"
//                     value={pointData.players[index] || ""}
//                     onChange={(e) => handlePlayerChange(index, e)}
//                     placeholder="Select player"
//                   >
//                     {homePlayers.map((player) => (
//                       <option key={player.player_id} value={player.player_id}>
//                         {player.player_name}
//                       </option>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </GridItem>
//             ))}
//           </>
//         )}
//       </Grid>
//     </Box>
//   )
// }
