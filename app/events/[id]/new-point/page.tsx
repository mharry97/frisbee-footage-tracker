"use client";

import React, { useEffect, useState } from "react";
import { fetchSources, Source } from "@/app/sources/supabase";
import type { Player } from "@/lib/supabase";
import { fetchEvent } from "@/app/events/supabase";
import { fetchTeam, TeamDetailed } from "@/app/teams/supabase";
import { fetchHomePlayers } from "@/app/teams/[team_id]/[player_id]/supabase";
import { writePoint, writePointPlayers } from "./supabase";
import {useParams, useRouter} from "next/navigation";
import { getFootageProvider, convertTimestampToSeconds, convertYoutubeUrlToEmbed } from "@/lib/utils";
import {AuthWrapper} from "@/components/auth-wrapper";
import {useAuth} from "@/lib/auth-context.tsx";
import StandardHeader from "@/components/standard-header.tsx";

function getTimestampUrl(sourceUrl: string, timestamp: string): string {
  const provider = getFootageProvider(sourceUrl);
  if (provider === "veo") {
    return `${sourceUrl}#t=${timestamp}`;
  } else if (provider === "youtube") {
    const seconds = convertTimestampToSeconds(timestamp);
    return convertYoutubeUrlToEmbed(sourceUrl, seconds);
  } else if (provider === "google_drive") {
    const seconds = convertTimestampToSeconds(timestamp);
    const separator = sourceUrl.includes('?') ? '&' : '?';
    return `${sourceUrl}${separator}start=${seconds}`;
  } else {
    return sourceUrl;
  }
}

function EventPageContent() {
  const { id } = useParams<{ id: string }>();
  const { player } = useAuth();
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [timestamp, setTimestamp] = useState("");
  const [homePlayers, setHomePlayers] = useState<Player[]>([]);
  const [offenceTeam, setOffenceTeam] = useState("");
  const [teamData, setTeamData] = useState<TeamDetailed[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(Array(7).fill(""));
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const sourcesData = await fetchSources();
      setSources(sourcesData);

      const eventData = await fetchEvent(id);
      if (eventData) {
        const team1Data = await fetchTeam(eventData.team_1_id);
        const team2Data = await fetchTeam(eventData.team_2_id);
        const teams: TeamDetailed[] = [];
        if (team1Data) teams.push(team1Data);
        if (team2Data) teams.push(team2Data);
        setTeamData(teams);
      }

      const homePlayersData = await fetchHomePlayers();
      setHomePlayers(homePlayersData);
      setLoading(false);
    };
    void fetchData();
  }, [id]);

  const hasHomeTeam = teamData.some((team) => team.is_home_team);

  const computedDefenceTeam = (() => {
    if (teamData.length < 2 || teamData[0].team_id === teamData[1].team_id) {
      return offenceTeam;
    }
    const foundTeam = teamData.find((team) => team.team_id !== offenceTeam);
    return foundTeam ? foundTeam.team_id : offenceTeam;
  })();

  const handleCancel = () => {
    router.push(`/events/${id}`);
  };

  const handleAdd = async () => {
    try {
      const sourceUrl = sources.find((s) => s.source_id === source)?.url || "";
      const timestamp_url = getTimestampUrl(sourceUrl, timestamp);

      const pointData = {
        event_id: id,
        source_id: source,
        timestamp,
        offence_team: offenceTeam,
        defence_team: computedDefenceTeam,
        timestamp_url,
        base_url: sourceUrl,
      };

      const insertedPoints = await writePoint(pointData);
      const point_id = insertedPoints[0].point_id;

      const pointPlayersData = selectedPlayers
        .filter((playerId) => playerId)
        .map((playerId) => ({ point_id, player_id: playerId }));

      await writePointPlayers(pointPlayersData);
      router.push(`/events/${id}/${point_id}`);
    } catch (error) {
      console.error("Error writing data:", error);
    }
  };

  if (!player || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading player data...</p>
      </div>
    );
  }

  const selectClass = "w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:border-neutral-500";
  const inputClass = "w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:border-neutral-500";
  const labelClass = "block text-sm font-medium text-neutral-300 mb-1";

  return (
    <div className="py-8">
      <StandardHeader text="Point Form" />

      <div className="mb-4">
        <label className={labelClass}>Source</label>
        <select
          className={selectClass}
          value={source}
          onChange={(e) => setSource(e.currentTarget.value)}
        >
          <option value="">Select Source</option>
          {sources.map((s) => (
            <option key={s.source_id} value={s.source_id}>{s.title}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className={labelClass}>Timestamp</label>
        <input
          className={inputClass}
          placeholder="e.g. 6:32"
          value={timestamp}
          onChange={(e) => setTimestamp(e.currentTarget.value)}
        />
      </div>

      <div className="mb-4">
        <label className={labelClass}>Offence Team</label>
        <select
          className={selectClass}
          value={offenceTeam}
          onChange={(e) => setOffenceTeam(e.currentTarget.value)}
        >
          <option value="">Select Offence Team</option>
          {teamData.map((t) => (
            <option key={t.team_id} value={t.team_id}>{t.team_name}</option>
          ))}
        </select>
      </div>

      {hasHomeTeam && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="mb-4">
              <label className={labelClass}>{`Player ${index + 1}`}</label>
              <select
                className={selectClass}
                value={selectedPlayers[index]}
                onChange={(e) => {
                  const newSelections = [...selectedPlayers];
                  newSelections[index] = e.currentTarget.value;
                  setSelectedPlayers(newSelections);
                }}
              >
                <option value="">{`Select Player ${index + 1}`}</option>
                {homePlayers.map((p) => (
                  <option key={p.player_id} value={p.player_id}>{p.player_name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between mb-4">
        <button
          onClick={handleCancel}
          className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleAdd}
          className="px-4 py-2 rounded bg-green-700 hover:bg-green-600 text-sm transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default function EventPage() {
  return (
    <AuthWrapper>
      <EventPageContent />
    </AuthWrapper>
  )
}
