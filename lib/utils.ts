// Determin footage provider from URL
export function getFootageProvider(
  url: string
): "youtube" | "google_drive" | "veo" | "other" {
  try {
    // Parse the URL to extract the hostname
    const { hostname } = new URL(url.toLowerCase());

    // Basic checks for known domains
    if (
      hostname.includes("youtube.com") ||
      hostname.includes("youtu.be")
    ) {
      return "youtube";
    } else if (
      hostname.includes("drive.google.com") ||
      hostname.includes("docs.google.com")
    ) {
      return "google_drive";
    } else if (
      hostname.includes("veo.co") ||
      hostname.includes("veo.dev")
    ) {
      return "veo";
    }
  } catch (error) {
    // If URL parsing fails or we can't detect a known domain, return unknown
    console.error("Error parsing URL:", error);
  }

  return "other";
}

export function convertTimestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(":").map(Number);
  if (parts.length === 3) {
    // hh:mm:ss (normal)
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    // mm:ss — even if mm is over 60 (e.g. 102:34)
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  } else if (parts.length === 1 && !isNaN(parts[0])) {
    return parts[0]; // already seconds
  }
  return 0;
}

// Extracts the YouTube video ID from a URL using a regex.
function getYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11)
    ? match[2]
    : null;
}

// Converts a YouTube URL (desktop or mobile) to its embed URL with the time parameter appended.
export function convertYoutubeUrlToEmbed(url: string, seconds: number): string {
  const videoId = getYoutubeVideoId(url);
  if (videoId) {
    // Produces an embed URL with the time parameter, e.g.:
    return `https://www.youtube.com/embed/${videoId}?start=${seconds}`;
  }
  // If we cannot extract the video ID, return the original URL.
  return url;
}

export function baseUrlToTimestampUrl(url: string, timestamp:string): string {
  if (getFootageProvider(url) === "youtube") {
    const timeParam = convertTimestampToSeconds(timestamp);
    return convertYoutubeUrlToEmbed(url, timeParam)
  } else if (getFootageProvider(url) === "veo") {
    return url + "#t=" + timestamp
  }
  return url;
}


// Returns team_name from given team_id
export interface Team {
  team_name: string;
  team_id: string;
  is_home_team: boolean;
}

export function getTeamName(teams: Team[], teamId: string): string {
  const team = teams.find((team) => team.team_id === teamId);
  return team ? team.team_name : "";
}

export function normalizeTimestampToHHMMSS(time: string): string {
  const [minStr, secStr] = time.split(":");

  const minutes = parseInt(minStr, 10);
  const seconds = parseInt(secStr, 10);

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const pad = (num: number) => String(num).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(remainingMinutes)}:${pad(seconds)}`;
  }

  // if under 1 hour, return M:SS (no leading zeros)
  return `${minutes}:${pad(seconds)}`;
}




