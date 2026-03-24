"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/header";
import { Source } from "@/app/sources/supabase"
import { fetchSourceById } from "@/app/sources/supabase";
import { AuthWrapper } from "@/components/auth-wrapper";

export default function EventPage({ params }: { params: Promise<{ source_id: string }> }) {
  const { source_id } = React.use(params);
  const [sourceData, setSourceData] = useState<Source | null>(null);

  useEffect(() => {
    if (!source_id) return;
    async function loadSource() {
      const sources = await fetchSourceById(source_id);
      if (sources.length > 0) {
        setSourceData(sources[0]);
      }
    }
    loadSource();
  }, [source_id]);

  return (
    <AuthWrapper>
      <div>
        <Header
          title={sourceData ? sourceData.title : ""}
          buttonText="Sources"
          redirectUrl="/sources"
        />
      </div>
    </AuthWrapper>
  );
}
