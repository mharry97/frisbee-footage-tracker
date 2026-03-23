"use client";

import React, { useState } from "react";
import OnPageVideoLink from "@/components/on-page-video-link";
import { baseUrlToTimestampUrl } from "@/lib/utils";
import type { ClipDetail } from "@/app/clips/supabase";
import { AddClipModal } from "@/app/clips/components/add-clip-modal.tsx";
import { CustomModal } from "@/components/modal";
import { CardGrid } from "@/components/card-grid";
import { Card, CardHeader, CardBody } from "@/components/card";

interface ClipCardProps {
  clip: ClipDetail;
  playerId: string;
}

function ClipCard({ clip, playerId }: ClipCardProps) {
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{clip.title}</h3>
            {!clip.is_public && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-green-900/50 text-green-400">Private</span>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-neutral-400 text-sm mb-3">{clip.description}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setViewOpen(true)}
              className="px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors"
            >
              View Clip
            </button>
            <button
              onClick={() => setEditOpen(true)}
              className="px-3 py-1.5 rounded hover:bg-neutral-800 text-sm transition-colors text-neutral-400"
            >
              Edit
            </button>
          </div>
        </CardBody>
      </Card>

      <CustomModal isOpen={viewOpen} onClose={() => setViewOpen(false)} title={clip.title} width="700px">
        <OnPageVideoLink url={baseUrlToTimestampUrl(clip.url, clip.timestamp)} />
      </CustomModal>

      <AddClipModal
        playerId={playerId}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        mode="edit"
        clipToEdit={clip}
      />
    </>
  );
}

interface ClipGridProps {
  clips: ClipDetail[];
  playerId: string;
}

export function ClipGrid({ clips, playerId }: ClipGridProps) {
  if (!clips || clips.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-neutral-400">No clips found.</p>
      </div>
    );
  }

  return (
    <CardGrid>
      {clips.map((item) => (
        <ClipCard key={item.clip_id} clip={item} playerId={playerId} />
      ))}
    </CardGrid>
  );
}
