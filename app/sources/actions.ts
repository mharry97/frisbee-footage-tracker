"use server"

import { normalizeTimestampToHHMMSS } from "@/lib/utils"

export async function getVeoVideoUrl(veoUrl: string): Promise<string | null> {
  try {
    // Extract match ID from the URL
    const matchIdMatch = veoUrl.match(/\/matches\/([^\/?#]+)/)
    if (!matchIdMatch) {
      console.error("Could not extract match ID from Veo URL:", veoUrl)
      return null
    }

    const matchId = matchIdMatch[1]

    // Extract timestamp fragment (e.g. #t=68:52)
    const timeMatch = veoUrl.match(/[#?&]t=([0-9]{1,2}:[0-9]{2})/)
    const formattedTimestamp = timeMatch
      ? normalizeTimestampToHHMMSS(timeMatch[1])
      : null

    const apiUrl = `https://app.veo.co/api/app/matches/${matchId}/videos/`

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
        "Content-Type": "application/json",
        Referer: `https://app.veo.co/matches/${matchId}/`,
        "Veo-App-Id": "hazard",
      },
    })

    if (!response.ok) {
      console.error("Veo API request failed:", response.status, response.statusText)
      return null
    }

    const data = await response.json()

    let videoUrl: string | null = null

    if (Array.isArray(data)) {
      videoUrl = data.find((item) => item?.url?.includes(".mp4"))?.url ?? null
    }

    if (videoUrl) {
      return formattedTimestamp ? `${videoUrl}#t=${formattedTimestamp}` : videoUrl
    }

    console.error("Could not find video URL in Veo response:", data)
    return null
  } catch (error) {
    console.error("Error fetching Veo video URL:", error)
    return null
  }
}
