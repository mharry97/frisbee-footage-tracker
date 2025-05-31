"use client"

import { WatchButton } from "@/components/watch-button";
import React, { useState, useEffect } from "react";
import { getFootageProvider } from "@/lib/utils";
import {AspectRatio, Center, Container, Link, Text} from "@chakra-ui/react";
import { getVeoVideoUrl } from "@/app/sources/actions";

type TurnoverFormProps = {
  url: string;
};

export default function OnPageVideoLink({ url }: TurnoverFormProps) {
  const [veoVideoUrl, setVeoVideoUrl] = useState<string | null>(null);
  const [veoLoading, setVeoLoading] = useState(false);

  const provider = getFootageProvider(url);

  // Fetch Veo MP4 URL if it's a Veo video
  useEffect(() => {
    if (provider === "veo") {
      setVeoLoading(true);

      getVeoVideoUrl(url)
        .then((mp4Url) => {
          setVeoVideoUrl(mp4Url);
        })
        .catch((error) => {
          console.error('Error fetching Veo video:', error);
        })
        .finally(() => {
          setVeoLoading(false);
        });
    }
  }, [url, provider]);

  // Handle YouTube and Google Drive (existing logic)
  if (provider === "google_drive" || provider === "youtube") {
    return (
      <AspectRatio ratio={16 / 9} w="full" maxW="4xl" mx="auto">
        <iframe
          src={url}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 0 }}
        />
      </AspectRatio>
    );
  }

  // Handle Veo videos
  if (provider === "veo") {
    if (veoLoading) {
      return (
        <AspectRatio ratio={16 / 9} w="full" maxW="4xl" mx="auto">
          <Center bg="gray.100" borderRadius="md">
            <Text>Loading Veo video...</Text>
          </Center>
        </AspectRatio>
      );
    }

    if (veoVideoUrl) {
      return (
        <Container>
          <Text>
            For interactive view, open on{" "}
            <Link href={url} color="blue.400" textDecoration="underline">
              Veo
            </Link>

          </Text>
          <AspectRatio ratio={16 / 9} w="full" maxW="4xl" mx="auto">
            <video
              src={veoVideoUrl}
              controls
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '6px'
              }}
            >
              Your browser does not support the video tag.
            </video>
          </AspectRatio>
        </Container>
      );
    }

    // Fallback to WatchButton if Veo embedding failed
  }

  // Fallback for Veo (if failed) and other providers
  return url ? <Center><WatchButton url={url} /></Center> : null;
}
