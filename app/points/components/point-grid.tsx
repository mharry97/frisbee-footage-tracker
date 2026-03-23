"use client";

import React, { useState } from "react";
import OnPageVideoLink from "@/components/on-page-video-link";
import { baseUrlToTimestampUrl } from "@/lib/utils";
import { PointDetailed } from "@/app/points/supabase.ts";
import NextLink from "next/link";
import { CustomModal } from "@/components/modal";

interface PointGridProps {
  points: PointDetailed[];
}

export function PointGrid({ points }: PointGridProps) {
  const [quickViewUrl, setQuickViewUrl] = useState<string | null>(null);

  if (!points || points.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-neutral-400">No points found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {points.map((item) => (
          <div key={item.point_id} className="bg-neutral-900 rounded-lg border border-neutral-700 overflow-hidden">
            <div className="p-4 border-b border-neutral-700">
              <h3 className="font-medium">{item.event_name}</h3>
              <p className="text-neutral-400 text-sm">{item.timestamp}</p>
              <p className="text-sm mt-1">Offence Team: {item.offence_team_name}</p>
            </div>
            <div className="p-4">
              <div className="mb-3">
                {item.point_outcome === "break" ? (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-red-900/50 text-red-400">Break</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-green-900/50 text-green-400">Hold</span>
                )}
              </div>
              <div className="flex gap-2">
                <NextLink
                  href={`/events/${item.event_id}/${item.point_id}/view`}
                  className="px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors"
                >
                  Details
                </NextLink>
                <button
                  onClick={() => setQuickViewUrl(baseUrlToTimestampUrl(item.base_url, item.timestamp))}
                  className="px-3 py-1.5 rounded hover:bg-neutral-800 text-sm transition-colors text-neutral-400"
                >
                  Quick View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CustomModal isOpen={!!quickViewUrl} onClose={() => setQuickViewUrl(null)} title="Quick View" width="700px">
        {quickViewUrl && <OnPageVideoLink url={quickViewUrl} />}
      </CustomModal>
    </>
  );
}
