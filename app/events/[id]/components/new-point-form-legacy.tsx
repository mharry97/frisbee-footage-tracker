// import {z} from 'zod'
// import {
//   Button,
//   Field,
//   Input,
//   VStack,
//   Text,
//   useDisclosure,
//   Dialog,
//   Portal,
//   HStack,
//   Select,
//   Spinner,
//   createListCollection,
//   Stack
// } from "@chakra-ui/react";
// import {Controller, SubmitHandler, useForm} from "react-hook-form";
// import React, {useMemo} from "react";
// import {zodResolver} from "@hookform/resolvers/zod";
// import { addPoint } from "@/app/points/supabase";
// import FloatingPlusButton from "@/components/ui/floating-plus.tsx";
// import {useAsync} from "react-use";
// import {fetchSources} from "@/app/sources/supabase.ts";
// import {fetchEventPlayers, fetchEventTeams, fetchEventTeamsInfo } from "@/app/events/[id]/supabase.ts";
//
// interface PortalProps {
//   event_id: string;
// }
//
// const schema = z.object({
//   source_id: z.string().array(),
//   timestamp: z.string(),
//   offence_team: z.string().array().min(1, { message: "Please select an offence team." }),
//   offence_team_players: z.string().array().max(7, { message: "You can select a maximum of 7 offence players." }),
//   defence_team_players: z.string().array().max(7, { message: "You can select a maximum of 7 defence players." }),
// });
//
// type PointData = z.infer<typeof schema>;
//
// const PointForm = ({ event_id }: PortalProps) => {
//
//   const {
//     value: teamsWithPlayers,
//     error
//   } = useAsync(async () => {
//     if (!event_id) return [];
//     const teams = await fetchEventTeams(event_id);
//     if (teams.length === 0) {
//       return [];
//     }
//     if (error) throw error;
//     console.log(fetchEventPlayers(teams))
//     return await fetchEventPlayers(teams);
//   }, [event_id]);
//
//
//   const { open, onOpen, onClose } = useDisclosure()
//   const {
//     register,
//     handleSubmit,
//     setError,
//     control,
//     reset,
//     watch,
//     formState: {errors, isSubmitting}} = useForm<PointData>({
//     resolver:zodResolver(schema),
//   })
//
//   const selectedOffenceTeamId = watch("offence_team")?.[0];
//
//   const { offenceTeamData, defenceTeamData } = useMemo(() => {
//     const offence = teamsWithPlayers?.find(
//       (team) => team.team_id === selectedOffenceTeamId
//     );
//     const defence = teamsWithPlayers?.find(
//       (team) => team.team_id !== selectedOffenceTeamId
//     );
//     return { offenceTeamData: offence, defenceTeamData: defence };
//   }, [selectedOffenceTeamId, teamsWithPlayers]);
//
//   const offenceCollection = useMemo(() => {
//     return createListCollection({
//       items: offenceTeamData?.players ?? [],
//       itemToString: (player) => player.player_name,
//       itemToValue: (player) => player.player_id,
//     })
//   }, [offenceTeamData])
//
//   const defenceCollection = useMemo(() => {
//     return createListCollection({
//       items: defenceTeamData?.players ?? [],
//       itemToString: (player) => player.player_name,
//       itemToValue: (player) => player.player_id,
//     })
//   }, [defenceTeamData])
//
//   // Fetch sources for source dropdown
//   const sourceState = useAsync(fetchSources)
//
//   const sourceCollection = useMemo(() => {
//     return createListCollection({
//       items: sourceState.value ?? [],
//       itemToString: (source) => source.title,
//       itemToValue: (source) => source.source_id,
//     })
//   }, [sourceState.value])
//
//   // Fetch both teams
//   const teamsState = useAsync(async () => {
//     if (!event_id) return [];
//     const teamIds = await fetchEventTeams(event_id);
//     if (teamIds.length === 0) {
//       return [];
//     }
//     return await fetchEventTeamsInfo(teamIds);
//   }, [event_id]);
//
//
//   const teamsCollection = useMemo(() => {
//     return createListCollection({
//       items: teamsState.value ?? [],
//       itemToString: (team) => team.team_name,
//       itemToValue: (team) => team.team_id,
//     })
//   }, [teamsState.value])
//
//   const handleOpenPortal = () => {
//     reset();
//     onOpen()
//   }
//
//   const onSubmit: SubmitHandler<PointData> = async (data) => {
//     if (!defenceTeamData?.team_id) {
//       setError("root", {
//         message: "Please select an offence team to determine the defence team.",
//       });
//       return;
//     }
//     const payload = {
//       ...data,
//       source_id: data.source_id[0],
//       offence_team: data.offence_team[0],
//       event_id,
//       defence_team: defenceTeamData.team_id
//     };
//     try {
//       await addPoint(payload)
//       // Take to page
//     } catch (error) {
//       if (error instanceof Error) {
//         setError("root", {
//           message: error.message,
//         });
//       } else {
//         setError("root", {
//           message: "An unknown error occurred",
//         });
//       }
//     }
//   }
//   const isDisabled = !selectedOffenceTeamId
//
//   return(
//     <>
//       <FloatingPlusButton onClick={handleOpenPortal} />
//       <Dialog.Root open={open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
//         <Portal>
//           <Dialog.Backdrop />
//           <Dialog.Positioner>
//             <Dialog.Content>
//               <Dialog.Header>Add Point</Dialog.Header>
//               <Dialog.Body>
//                 <form onSubmit={handleSubmit(onSubmit)}>
//                   <VStack gap={4}>
//                     <Field.Root>
//                       <Field.Label>Source</Field.Label>
//                       <Controller
//                         name="source_id"
//                         control={control}
//                         render={({ field }) => (
//                           <Select.Root
//                             name={field.name}
//                             value={field.value}
//                             onValueChange={
//                               ({ value }) => {field.onChange(value)}}
//                             onInteractOutside={() => field.onBlur()}
//                             collection={sourceCollection}
//                           >
//                             <Select.HiddenSelect />
//                             <Select.Control>
//                               <Select.Trigger>
//                                 <Select.ValueText placeholder="Select point source" />
//                               </Select.Trigger>
//                               <Select.IndicatorGroup>
//                                 {sourceState.loading && (
//                                   <Spinner />
//                                 )}
//                                 <Select.Indicator />
//                               </Select.IndicatorGroup>
//                             </Select.Control>
//                             <Select.Positioner>
//                               <Select.Content>
//                                 {sourceCollection.items.map((source) => (
//                                   <Select.Item item={source} key={source.source_id}>
//                                     <Stack gap={0}>
//                                       <Text>{source.title}</Text>
//                                       <Text color="fg.muted" fontSize="xs">{source.recorded_date}</Text>
//                                     </Stack>
//                                     <Select.ItemIndicator />
//                                   </Select.Item>
//                                 ))}
//                               </Select.Content>
//                             </Select.Positioner>
//                           </Select.Root>
//                         )}
//                       />
//                       {errors.source_id && <Field.ErrorText>{errors.source_id.message}</Field.ErrorText>}
//                     </Field.Root>
//                     <Field.Root>
//                       <Field.Label>Timestamp</Field.Label>
//                       <Input {...register("timestamp")} placeholder="Enter timestamp" />
//                       {errors.timestamp && (
//                         <Field.ErrorText>{errors.timestamp.message}</Field.ErrorText>
//                       )}
//                     </Field.Root>
//                     <Field.Root>
//                       <Field.Label>Offence Team</Field.Label>
//                       <Controller
//                         name="offence_team"
//                         control={control}
//                         render={({ field }) => (
//                           <Select.Root
//                             name={field.name}
//                             value={field.value}
//                             onValueChange={
//                               ({ value }) => {field.onChange(value)}}
//                             onInteractOutside={() => field.onBlur()}
//                             collection={teamsCollection}
//                           >
//                             <Select.HiddenSelect />
//                             <Select.Control>
//                               <Select.Trigger>
//                                 <Select.ValueText placeholder="Select team on offence" />
//                               </Select.Trigger>
//                               <Select.IndicatorGroup>
//                                 {sourceState.loading && (
//                                   <Spinner />
//                                 )}
//                                 <Select.Indicator />
//                               </Select.IndicatorGroup>
//                             </Select.Control>
//                             <Select.Positioner>
//                               <Select.Content>
//                                 {teamsCollection.items.map((team) => (
//                                   <Select.Item item={team} key={team.team_id}>
//                                     <Text>{team.team_name}</Text>
//                                     <Select.ItemIndicator />
//                                   </Select.Item>
//                                 ))}
//                               </Select.Content>
//                             </Select.Positioner>
//                           </Select.Root>
//                         )}
//                       />
//                       {errors.offence_team && <Field.ErrorText>{errors.offence_team.message}</Field.ErrorText>}
//                     </Field.Root>
//                     <Field.Root>
//                       <Field.Label>Offence Players</Field.Label>
//                       <Controller
//                         name="offence_team_players"
//                         control={control}
//                         render={({ field }) => (
//                           <Select.Root
//                             name={field.name}
//                             value={field.value}
//                             multiple
//                             disabled={isDisabled}
//                             onValueChange={
//                               ({ value }) => {field.onChange(value)}}
//                             onInteractOutside={() => field.onBlur()}
//                             collection={offenceCollection}
//                           >
//                             <Select.HiddenSelect />
//                             <Select.Control>
//                               <Select.Trigger>
//                                 <Select.ValueText placeholder="Select players on offence" />
//                               </Select.Trigger>
//                               <Select.IndicatorGroup>
//                                 {sourceState.loading && (
//                                   <Spinner />
//                                 )}
//                                 <Select.Indicator />
//                               </Select.IndicatorGroup>
//                             </Select.Control>
//                             <Select.Positioner>
//                               <Select.Content>
//                                 {offenceCollection.items.map((player) => (
//                                   <Select.Item item={player} key={player.player_id}>
//                                     <Text>{player.player_name}</Text>
//                                     <Select.ItemIndicator />
//                                   </Select.Item>
//                                 ))}
//                               </Select.Content>
//                             </Select.Positioner>
//                           </Select.Root>
//                         )}
//                       />
//                       {errors.offence_team_players && <Field.ErrorText>{errors.offence_team_players.message}</Field.ErrorText>}
//                     </Field.Root>
//                     <Field.Root>
//                       <Field.Label>Defence Players</Field.Label>
//                       <Controller
//                         name="defence_team_players"
//                         control={control}
//                         render={({ field }) => (
//                           <Select.Root
//                             name={field.name}
//                             value={field.value}
//                             multiple
//                             disabled={isDisabled}
//                             onValueChange={
//                               ({ value }) => {field.onChange(value)}}
//                             onInteractOutside={() => field.onBlur()}
//                             collection={defenceCollection}
//                           >
//                             <Select.HiddenSelect />
//                             <Select.Control>
//                               <Select.Trigger>
//                                 <Select.ValueText placeholder="Select players on defence" />
//                               </Select.Trigger>
//                               <Select.IndicatorGroup>
//                                 {sourceState.loading && (
//                                   <Spinner />
//                                 )}
//                                 <Select.Indicator />
//                               </Select.IndicatorGroup>
//                             </Select.Control>
//                             <Select.Positioner>
//                               <Select.Content>
//                                 {defenceCollection.items.map((player) => (
//                                   <Select.Item item={player} key={player.player_id}>
//                                     <Stack gap={0}>
//                                       <Text>{player.player_name}</Text>
//                                       <Text color="fg.muted" fontSize="xs">{player.number ? "#" : ""}{player.number}{player.is_active ? "Active" : "Inactive"}</Text>
//                                     </Stack>
//                                     <Select.ItemIndicator />
//                                   </Select.Item>
//                                 ))}
//                               </Select.Content>
//                             </Select.Positioner>
//                           </Select.Root>
//                         )}
//                       />
//                       {errors.defence_team_players && <Field.ErrorText>{errors.defence_team_players.message}</Field.ErrorText>}
//                     </Field.Root>
//                   </VStack>
//                   <HStack justify="space-between">
//                     <Button type="submit" disabled={isSubmitting} mt={4}>
//                       Add
//                     </Button>
//                     {errors.root && (
//                       <Text color="red" mt={4}>{errors.root.message}</Text>
//                     )}
//                     <Button variant="ghost" onClick={onClose} mt={4}>
//                       Cancel
//                     </Button>
//                   </HStack>
//                 </form>
//               </Dialog.Body>
//             </Dialog.Content>
//           </Dialog.Positioner>
//         </Portal>
//       </Dialog.Root>
//     </>
//   )
// }
//
// export default PointForm;
