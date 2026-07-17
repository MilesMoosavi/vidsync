const YOUTUBE_ID_REGEX = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
const DIRECT_VIDEO_REGEX = /\.(mp4|webm|ogg|mov|m4v)($|\?)/i;

// Tier 2: providers with a public oEmbed endpoint but no JS control SDK — native controls
// render, no cross-user sync. Vimeo and Twitch are deliberately excluded even though Vimeo
// supports oEmbed: both are named Tier 1 candidates (JS control SDK exists), so routing them
// through the cheaper Tier 2 path here would silently foreclose sync support later.
const TIER2_OEMBED_DOMAINS = ["streamable.com", "ted.com"];

export function getYouTubeId(url: string): string | null {
  const match = url.match(YOUTUBE_ID_REGEX);
  return match && match[2].length === 11 ? match[2] : null;
}

export function isDirectVideoUrl(url: string): boolean {
  return DIRECT_VIDEO_REGEX.test(url);
}

export function isOEmbedProviderUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return TIER2_OEMBED_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

// TODO: extend when Tier 1 (Vimeo, Twitch) or Tier 3 (generic unknown URL) providers are added
export function isSupportedMediaUrl(url: string): boolean {
  return Boolean(getYouTubeId(url)) || isDirectVideoUrl(url) || isOEmbedProviderUrl(url);
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

export async function fetchMediaMetadata(url: string): Promise<{ title: string; thumbnailUrl: string } | null> {
  let title = "Media Video";
  let thumbnailUrl = "";

  const videoId = getYouTubeId(url);
  if (videoId) {
    thumbnailUrl = getYouTubeThumbnailUrl(videoId);
    title = "YouTube Video";
  }

  try {
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    title = data.title || title;
    thumbnailUrl = data.thumbnail_url || thumbnailUrl;
  } catch {
    // noembed unreachable — fall back to generic
  }

  // If no title and no thumbnail, maybe it's not supported by noembed and isn't YT
  if (!thumbnailUrl && !videoId) return null;

  return { title, thumbnailUrl };
}

// Tier 2 metadata: noembed's oEmbed response includes an `html` field for providers without
// a JS control SDK — a ready-made iframe embed snippet we render as-is (see VideoPlayer).
export async function fetchOEmbedMetadata(url: string): Promise<{ title: string; html: string } | null> {
  if (!isOEmbedProviderUrl(url)) return null;

  try {
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    if (!data.html) return null;
    return { title: data.title || "Video", html: data.html };
  } catch {
    return null;
  }
}
