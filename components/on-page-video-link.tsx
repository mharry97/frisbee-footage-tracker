import { WatchButton } from "@/components/watch-button";
import React from "react";
import { getFootageProvider } from "@/lib/utils";
import {Center} from "@chakra-ui/react";

type TurnoverFormProps = {
  url: string;
};

export default function OnPageVideoLink({ url }: TurnoverFormProps) {
  const provider = getFootageProvider(url);

  if (provider === "google_drive" || provider === "youtube") {
    return (
      <iframe
        src={url}
        width="100%"
        height="315"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ marginTop: "16px" }}
      ></iframe>
    );
  }

  return url ? <Center><WatchButton url={url} /></Center> : null;
}
