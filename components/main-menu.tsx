import React from "react";
import { Box, HStack, Icon, Text, VStack, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";
import { FiDatabase } from "react-icons/fi";
import { FaRegCalendarAlt } from "react-icons/fa";
import { TbPlaylistAdd } from "react-icons/tb";
import { MdOutlineAdminPanelSettings, MdOutlineScoreboard } from "react-icons/md";
import { IoPeopleOutline } from "react-icons/io5";
import { IoHomeOutline } from "react-icons/io5";
import { PiStrategy } from "react-icons/pi";

interface MainMenuProps {
  is_admin: boolean;
  is_home?: boolean;
}

interface HorizontalMenuItem {
  title: string;
  href: string;
  iconComponent: React.ElementType;
}

function HorizontalIconMenu({ menuItems }: { menuItems: HorizontalMenuItem[] }) {
  return (
    <Box
      overflowX="auto"
      pb={2}
      width="100%"
      scrollbar="hidden">
      <HStack gap={3} px={2}>
        {menuItems.map((item) => (
          <ChakraLink
            key={item.href}
            as={NextLink}
            href={item.href}
            _hover={{ textDecoration: "none" }}
            _focus={{ boxShadow: "none", outline: "none" }}
            flexShrink={0}
          >
            <VStack
              w="120px"
              h="120px"
              justifyContent="center"
              alignItems="center"
              gap={1}
              bg="transparent"
              _hover={{ bg: "whiteAlpha.100", rounded: "md" }}
              transition="background-color 0.2s ease-in-out"
              rounded="md"
            >
              <Icon as={item.iconComponent} boxSize="30px" color="white" />
              <Text fontSize="xs" color="white" textAlign="center">
                {item.title}
              </Text>
            </VStack>
          </ChakraLink>
        ))}
      </HStack>
    </Box>
  );
}

export default function MainMenu({ is_admin, is_home }: MainMenuProps) {
  const menuItems: HorizontalMenuItem[] = [
    ...(!is_home
      ? [{ title: "Home", href: "/", iconComponent: IoHomeOutline }]
      : []),
    { title: "Sources", href: "/sources", iconComponent: FiDatabase },
    { title: "Events", href: "/events", iconComponent: FaRegCalendarAlt },
    { title: "Playlists", href: "/playlists", iconComponent: TbPlaylistAdd },
    { title: "Strategies", href: "/strategies", iconComponent: PiStrategy },
    { title: "Possessions", href: "/possessions", iconComponent: MdOutlineScoreboard },
    { title: "Teams", href: "/teams", iconComponent: IoPeopleOutline },
    ...(is_admin
      ? [{ title: "Admin", href: "/admin", iconComponent: MdOutlineAdminPanelSettings }]
      : []),
  ];

  return <HorizontalIconMenu menuItems={menuItems} />;
}

