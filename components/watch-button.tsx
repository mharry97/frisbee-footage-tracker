import React from "react";
import { getFootageProvider } from "@/lib/utils";

interface WatchButtonProps {
  url: string;
}

export const WatchButton: React.FC<WatchButtonProps> = ({ url }) => {
  const host = getFootageProvider(url);

  return (
    <button
      onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
      className="mt-4 px-4 py-2 rounded bg-green-700 hover:bg-green-600 text-white text-sm transition-colors"
    >
      Watch on {host}
    </button>
  );
};
