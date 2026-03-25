"use client";

import React, { useState } from "react";
import OnPageVideoLink from "@/components/on-page-video-link";
import { baseUrlToTimestampUrl } from "@/lib/utils";
import { PointDetailed } from "@/app/points/supabase.ts";
import NextLink from "next/link";
import { CustomModal } from "@/components/modal";
import { CardGrid } from "@/components/card-grid";
import { Card, CardHeader, CardBody } from "@/components/card";

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
      <CardGrid>
        {points.map((item) => (
          <Card key={item.point_id}>
            <CardHeader>
              <h3 className="font-medium">{item.event_name}</h3>
              <p className="text-neutral-400 text-sm">{item.timestamp}</p>
              <p className="text-sm mt-1">Offence Team: {item.offence_team_name}</p>
            </CardHeader>
            <CardBody>
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
            </CardBody>
          </Card>
        ))}
      </CardGrid>

      <CustomModal isOpen={!!quickViewUrl} onClose={() => setQuickViewUrl(null)} title="Quick View" fullWidth>
        {quickViewUrl && <OnPageVideoLink url={quickViewUrl} />}
      </CustomModal>
    </>
  );
}
