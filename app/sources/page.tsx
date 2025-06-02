"use client";

import React, { useEffect, useState } from "react";
import { Container } from "@chakra-ui/react";
import Header from "@/components/header";
import { BaseGrid } from "@/components/card-grid";
import { SourceCard } from "@/app/sources/components/source-card";
import type { Source } from "@/lib/supabase";
import { fetchSources, insertSource } from "@/app/sources/supabase";
import LoadingSpinner from "@/components/ui/loading-spinner";
import FloatingActionButton from "@/components/ui/plus-button";
import { AddSourceModal } from "@/app/sources/components/add-source-modal";
import {AuthWrapper} from "@/components/auth-wrapper";

function SourcesPageContent() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch sources on mount
  useEffect(() => {
    loadSources();
  }, []);

  // Load or reload the sources from Supabase
  async function loadSources() {
    setLoading(true);
    const data = await fetchSources();
    setSources(data);
    setLoading(false);
  }

  // Open the modal
  const handleAdd = () => {
    setIsModalOpen(true);
  };

  // Called when the user submits the Add Source form
  const handleAddSource = async (title: string, url: string, recordedDate: string) => {
    try {
      // Insert into Supabase
      await insertSource(title, url, recordedDate);
      // Reload the list to show the newly added source
      await loadSources();
    } catch (error) {
      console.error("Error adding source:", error);
    }
  };

  return (
    <>
      <Container maxW="4xl">
        <Header title="Sources" buttonText="Home" redirectUrl="/" />
        {loading ? (
          <LoadingSpinner text="Loading sources..." />
        ) : (
          <BaseGrid>
            {sources.map((source) => (
              <SourceCard {...source} />
            ))}
          </BaseGrid>
        )}
      </Container>

      <FloatingActionButton aria-label="Add Source" onClick={handleAdd} />

      <AddSourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddSource={handleAddSource}
      />
    </>
  );
}

export default function SourcesPage() {
  return (
    <AuthWrapper>
      <SourcesPageContent />
    </AuthWrapper>
  )
}
