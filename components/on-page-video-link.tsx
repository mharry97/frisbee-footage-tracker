"use client"

import { WatchButton } from "@/components/watch-button";
import React, { useState, useEffect } from "react";
import { getFootageProvider } from "@/lib/utils";
import { getVeoVideoUrl } from "@/app/sources/actions";

type VideoProps = {
  url: string;
};

export default function OnPageVideoLink({ url }: VideoProps) {
  const [veoVideoUrl, setVeoVideoUrl] = useState<string | null>(null);
  const [veoLoading, setVeoLoading] = useState(false);

  const provider = getFootageProvider(url);

  useEffect(() => {
    if (provider === "veo") {
      setVeoLoading(true);
      getVeoVideoUrl(url)
        .then((mp4Url) => setVeoVideoUrl(mp4Url))
        .catch((error) => console.error("Error fetching Veo video:", error))
        .finally(() => setVeoLoading(false));
    }
  }, [url, provider]);

  if (provider === "google_drive" || provider === "youtube") {
    return (
      <div className="relative w-full mt-4" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={url}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
        />
      </div>
    );
  }

  if (provider === "veo") {
    if (veoLoading) {
      return (
        <div className="relative w-full mt-4 bg-neutral-800 rounded flex items-center justify-center" style={{ paddingBottom: "56.25%" }}>
          <span className="absolute text-neutral-400">Loading Veo video...</span>
        </div>
      );
    }

    if (veoVideoUrl) {
      return (
        <div className="mb-4 mt-4">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <video
              src={veoVideoUrl}
              controls
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: "6px" }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            For interactive view, open on{" "}
            <a href={url} className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">
              Veo
            </a>
          </p>
        </div>
      );
    }
  }

  return url ? (
    <div className="flex justify-center">
      <WatchButton url={url} />
    </div>
  ) : null;
}
