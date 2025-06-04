"use client"

import React from "react";
import NextLink from "next/link";
import { Grid, Link, Box, Text } from "@chakra-ui/react";
import { MdOutlineScoreboard } from "react-icons/md";
import { LuFilm } from "react-icons/lu";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FiDatabase } from "react-icons/fi";
import { BsBarChartLine } from "react-icons/bs";
import { TbPlaylistAdd } from "react-icons/tb";

type MenuItemProps = {
    title: string;
    icon: string;
    href: string;
    active?: boolean;
};

const iconMap: Record<string, React.ReactNode> = {
    scoreboard: <MdOutlineScoreboard size={40} />,
    film: <LuFilm size={40} />,
    calendar: <FaRegCalendarAlt size={40} />,
    database: <FiDatabase size={40} />,
    "bar-chart": <BsBarChartLine size={40} />,
    playlist: <TbPlaylistAdd size={40} />,
};

export function MenuGrid({ items }: { items: MenuItemProps[] }) {
    return (
        <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={4}>
            {items.map((item) => (
                <Link
                    as={NextLink}
                    key={item.title}
                    href={item.href}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    p={6}
                    rounded="lg"
                    bg={item.active ? "#252525" : "#1a1a1a"}
                    color="white"
                    _hover={{ bg: "#252525", textDecoration: "none" }}
                >
                    <Box mb={3} color="gray.300">
                        {iconMap[item.icon] || <LuFilm size={40} />}
                    </Box>
                    <Text fontSize="lg" fontWeight="light">
                        {item.title}
                    </Text>
                </Link>
            ))}
        </Grid>
    );
}
