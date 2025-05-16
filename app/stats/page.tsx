"use client";
import {
  Container,
} from "@chakra-ui/react";
import Header from "@/components/header";

export default function PointView(){


  return (
    <Container maxW="4xl" py={8}>
      <Header title="Coming Soon" buttonText="dashboard" redirectUrl={`/dashboard`} />
    </Container>
  );
}
