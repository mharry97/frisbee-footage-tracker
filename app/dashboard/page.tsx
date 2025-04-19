import { Container, Box, Heading } from "@chakra-ui/react";
import { MenuGrid } from "@/app/dashboard/components/menu-grid";

export default function DashboardPage() {
  const menuItems = [
    { title: "sources", icon: "database", href: "/sources" },
    { title: "events", icon: "calendar", href: "/events" },
    { title: "clips", icon: "film", href: "/clips" },
    { title: "points", icon: "scoreboard", href: "/points" },
    { title: "stats", icon: "bar-chart", href: "/stats" },
  ];

  return (
    <Box minH="100vh" bg="black" p={4}>
      <Container maxW="4xl">
        <Heading as="h1" size="4xl" fontWeight="light" color="white" mb={8} mt={4}>
          footage tracker
        </Heading>
        <MenuGrid items={menuItems} />
      </Container>
    </Box>
  );
}
