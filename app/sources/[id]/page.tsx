"use client";

import React, { useEffect, useState } from "react";
import { Container } from "@chakra-ui/react";
import Header from "@/components/header";
import { Source } from "@/lib/supabase"
import { fetchSourceById } from "@/app/sources/supabase";
import {AuthWrapper} from "@/components/auth-wrapper";

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the promised params
  const { id } = React.use(params);
  const [sourceData, setSourceData] = useState<Source | null>(null);

  // Fetch Source
  useEffect(() => {
    if (!id) return;
    async function loadSource() {
      const sources = await fetchSourceById(id);
      if (sources.length > 0) {
        setSourceData(sources[0]);
      }
    }
    loadSource();
  }, [id]);

  return (
    <AuthWrapper>
      <Container maxW="4xl">
        <Header
          title={sourceData ? sourceData.title : ""}
          buttonText="sources"
          redirectUrl="/sources"
        />
      </Container>
    </AuthWrapper>
  );
}
