import { WatchButton } from "@/components/watch-button";
import React from "react";
import { getFootageProvider } from "@/lib/utils";
import {AspectRatio, Center} from "@chakra-ui/react";

type TurnoverFormProps = {
  url: string;
};

export default function OnPageVideoLink({ url }: TurnoverFormProps) {
  const provider = getFootageProvider(url);

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

  return url ? <Center><WatchButton url={url} /></Center> : null;
}
