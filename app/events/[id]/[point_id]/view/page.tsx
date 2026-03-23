"use client";

import React, { useEffect, useState } from "react";
import { fetchPointPossessions } from "@/app/possessions/supabase";
import OnPageVideoLink from "@/components/on-page-video-link";
import PointOverview from "@/app/events/[id]/[point_id]/view/components/point-overview";
import PossessionSection from "@/app/events/[id]/[point_id]/view/components/possession-section";
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
import { deletePossession } from "@/app/possessions/supabase";
import EditPossessionDialog from "@/app/events/[id]/[point_id]/view/components/edit-possession";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context.tsx";
import StandardHeader from "@/components/standard-header.tsx";
import { AuthWrapper } from "@/components/auth-wrapper.tsx";
import { baseUrlToTimestampUrl } from "@/lib/utils.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPoint } from "@/app/points/supabase.ts";
import { AddClipModal } from "@/app/clips/components/add-clip-modal.tsx";
import FloatingActionButton from "@/components/ui/floating-plus.tsx";
import { CustomModal } from "@/components/modal";

function PointViewContent() {
  const { id, point_id } = useParams<{ id: string; point_id: string }>()
  const queryClient = useQueryClient()
  const router = useRouter();
  const { player } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(0);
  const [clipOpen, setClipOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: possessionPageData, isLoading } = useQuery({
    queryKey: ["possessions"],
    queryFn: async () => {
      const pointData = await fetchPoint(point_id)
      if (!pointData) throw new Error("Point not found.");
      const possessionsData = await fetchPointPossessions(point_id)
      return { point: pointData, possessions: possessionsData }
    }
  })

  const { point, possessions } = possessionPageData || { point: null, possessions: [] };

  interface DeletePossessionVars {
    possessionNumber: number;
    pointId: string;
  }

  const { mutate: deletePossessionMutation, isPending: isDeleting } = useMutation({
    mutationFn: (variables: DeletePossessionVars) =>
      deletePossession(variables.pointId, variables.possessionNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["possessions"] });
      setDeleteOpen(false);
    },
    onError: (error) => console.error("Failed to delete possession:", error)
  });

  useEffect(() => {
    if (possessions && currentIndex >= possessions.length) {
      setCurrentIndex(Math.max(0, possessions.length - 1));
    }
  }, [possessions, currentIndex]);

  if (!player || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading point data...</p>
      </div>
    )
  }
  if (!point) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">No point data found</p>
      </div>
    )
  }

  if (possessions.length === 0) {
    return (
      <div className="py-8">
        <StandardHeader text="Point Info" />
        <p className="mt-8">
          {isLoading ? "Loading point data" : "No data found for this point yet."}
        </p>
        {!isLoading && (
          <button
            className="mt-6 px-4 py-2 rounded bg-green-700 hover:bg-green-600 text-white text-sm transition-colors"
            onClick={() => router.push(`/events/${id}/${point_id}`)}
          >
            Add Possession
          </button>
        )}
      </div>
    );
  }

  const last = possessions[possessions.length - 1];
  const possession = possessions[currentIndex];
  const currentPossession = currentIndex + 1;
  const possessionCount = possessions.length;
  const scorer = last.score_player_name || "Unknown";
  const possessionOutcome = possession.is_score ? "Score" : "Turnover";
  const lastOutcome = last.is_score ? "Score" : "Turnover";
  const outcome = last.is_score && last.offence_team === last.point_offence_team ? "Hold" : "Break";

  const overview = {
    offence_team: possession.offence_team_name || "Unknown",
    throws: possession.throws || 0,
    outcome: lastOutcome,
  };

  const plays = {
    o_init: possession.offence_init_name || "None",
    o_main: possession.offence_main_name || "None",
    d_init: possession.defence_init_name || "None",
    d_main: possession.defence_main_name || "None",
  };

  const turnover = {
    throw_zone: Number(possession.turn_throw_zone) || 1,
    receive_zone: Number(possession.turn_receive_zone) || 1,
    thrower: possession.turn_thrower_name || "Unknown",
    receiver: possession.turn_intended_receiver_name || "Unknown",
    turnover_reason: possession.turnover_reason || "Unknown",
    d_player: possession.d_player_name || "None",
    scorer: possession.score_player_name || "Unknown",
    assister: possession.assist_player_name || "Unknown",
    method: possession.score_method || "Unknown",
    outcome: possession.is_score ? "Score" : "Turnover",
  };

  return (
    <div className="py-8">
      <StandardHeader text={point.event_name} />
      <p className="mt-4 text-lg text-neutral-400">{`Offence: ${point.offence_team_name}`}</p>

      <PointOverview
        last_possession_type={lastOutcome}
        possessions={possessionCount}
        outcome={outcome}
        scorer={scorer}
      />

      <OnPageVideoLink url={baseUrlToTimestampUrl(point.base_url, point.timestamp)} />

      <div className="flex justify-between items-center mt-5">
        <button
          className="p-2 text-yellow-400 hover:bg-neutral-800 rounded transition-colors disabled:opacity-30"
          onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentIndex === 0}
        >
          <FaLongArrowAltLeft size={24} />
        </button>
        <span className="text-center">
          Possession {currentIndex + 1} of {possessions.length}
        </span>
        <button
          className="p-2 text-yellow-400 hover:bg-neutral-800 rounded transition-colors disabled:opacity-30"
          onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, possessions.length - 1))}
          disabled={currentIndex === possessions.length - 1}
        >
          <FaLongArrowAltRight size={24} />
        </button>
      </div>

      <PossessionSection overview={overview} plays={plays} turnover={turnover} />

      <div className="flex justify-between gap-2">
        <button
          onClick={() => setEditOpen(true)}
          className="px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors"
        >
          Edit
        </button>
        {possessionOutcome !== "Turnover" && currentPossession === possessionCount && null}
        {possessionOutcome === "Turnover" && currentPossession === possessionCount && (
          <button
            className="px-3 py-1.5 rounded bg-green-700 hover:bg-green-600 text-sm transition-colors"
            onClick={() => router.push(`/events/${id}/${point_id}`)}
          >
            Add Next Possession
          </button>
        )}
        {currentPossession === possessionCount && (
          <button
            onClick={() => setDeleteOpen(true)}
            className="px-3 py-1.5 rounded bg-red-800 hover:bg-red-700 text-sm transition-colors"
          >
            Delete
          </button>
        )}
      </div>

      <EditPossessionDialog
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        possessionNumber={currentIndex + 1}
        pointId={point.point_id}
      />

      <CustomModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Confirm Deletion">
        <p className="mb-4">Are you sure you want to delete this possession? This cannot be undone.</p>
        <div className="flex justify-between">
          <button
            onClick={() => setDeleteOpen(false)}
            className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => deletePossessionMutation({ possessionNumber: currentIndex + 1, pointId: point.point_id })}
            disabled={isDeleting}
            className="px-4 py-2 rounded bg-red-800 hover:bg-red-700 text-sm transition-colors disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </CustomModal>

      <FloatingActionButton onClick={() => setClipOpen(true)} iconType="clip" />
      <AddClipModal
        isOpen={clipOpen}
        onClose={() => setClipOpen(false)}
        eventId={id}
        sourceId={point.source_id}
        playerId={player.player_id}
        mode="add"
      />
    </div>
  );
}

export default function PointView() {
  return (
    <AuthWrapper>
      <PointViewContent />
    </AuthWrapper>
  )
}
