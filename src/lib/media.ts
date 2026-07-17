const YOUTUBE_ID_REGEX = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
const DIRECT_VIDEO_REGEX = /\.(mp4|webm|ogg|mov|m4v)($|\?)/i;

export function getYouTubeId(url: string): string | null {
  const match = url.match(YOUTUBE_ID_REGEX);
  return match && match[2].length === 11 ? match[2] : null;
}

export function isDirectVideoUrl(url: string): boolean {
  return DIRECT_VIDEO_REGEX.test(url);
}

// TODO: extend when Tier 1/2/3 providers (Vimeo, Twitch, oEmbed, generic) are added
export function isSupportedMediaUrl(url: string): boolean {
  return Boolean(getYouTubeId(url)) || isDirectVideoUrl(url);
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

export async function fetchYouTubeMetadata(url: string): Promise<{ title: string; thumbnailUrl: string } | null> {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;

  const thumbnailUrl = getYouTubeThumbnailUrl(videoId);
  let title = "YouTube Video";

  try {
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    title = data.title || title;
  } catch {
    // noembed unreachable — fall back to generic title
  }

  return { title, thumbnailUrl };
}
