"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Settings, Film } from "lucide-react";
import { getYouTubeId, isDirectVideoUrl, isOEmbedProviderUrl, fetchOEmbedMetadata } from "@/lib/media";
import "./VideoPlayer.css";

// The YouTube IFrame API attaches its own YT namespace to window at runtime —
// there's no npm package for it, so we type just the surface we call.
interface YouTubePlayer {
  loadVideoById(videoId: string): void;
  destroy(): void;
}

interface YouTubePlayerOptions {
  videoId: string;
  width?: string | number;
  height?: string | number;
  playerVars?: { autoplay?: 0 | 1; controls?: 0 | 1; rel?: 0 | 1 };
}

interface YouTubeNamespace {
  Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer;
}

declare global {
  interface Window {
    YT: YouTubeNamespace;
    onYouTubeIframeAPIReady: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

// Injects the YouTube IFrame API script once per page load and resolves when
// window.YT is ready to construct players. Repeat calls reuse the same promise
// instead of re-adding the script tag.
function loadYouTubeApi(): Promise<void> {
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    const previousReadyCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousReadyCallback) previousReadyCallback();
      resolve();
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });

  return youtubeApiPromise;
}

interface VideoPlayerProps {
  videoUrl?: string;
}

export default function VideoPlayer({ videoUrl = "" }: VideoPlayerProps) {
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const youtubeMountRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [prevVolume, setPrevVolume] = useState(80);
  const [progress, setProgress] = useState(30); // dummy progress percentage
  // Tagged with the URL it was fetched for, so a stale result from a since-changed
  // videoUrl is never rendered without needing a synchronous reset inside the effect below.
  const [oembedResult, setOembedResult] = useState<{ forUrl: string; html: string } | null>(null);

  const handlePlayToggle = () => setIsPlaying(!isPlaying);
  const handleRestart = () => setProgress(0);

  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolume(0);
    }
  };

  const ytId = getYouTubeId(videoUrl);
  const isDirectVideo = isDirectVideoUrl(videoUrl);
  const isOEmbedTier = isOEmbedProviderUrl(videoUrl);
  const oembedHtml = isOEmbedTier && oembedResult?.forUrl === videoUrl ? oembedResult.html : null;
  const hasValidMedia = ytId || isDirectVideo || isOEmbedTier;

  // Tier 2 (oEmbed, no control SDK): fetch the provider's embed HTML whenever videoUrl
  // changes to a Tier 2 link. No JS handle here — just native controls, no sync.
  useEffect(() => {
    if (!isOEmbedTier) return;

    let cancelled = false;
    fetchOEmbedMetadata(videoUrl).then((result) => {
      if (!cancelled && result?.html) setOembedResult({ forUrl: videoUrl, html: result.html });
    });

    return () => {
      cancelled = true;
    };
  }, [isOEmbedTier, videoUrl]);

  // Mounts (or swaps the loaded video on) a YT.Player instance whenever ytId changes.
  // Using the IFrame API instead of a raw <iframe src> gives us a JS handle (play/pause/seek)
  // for cross-user sync later, instead of just an embedded, uncontrollable player.
  useEffect(() => {
    if (!ytId) return;

    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !youtubeMountRef.current) return;

      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.loadVideoById(ytId);
      } else {
        youtubePlayerRef.current = new window.YT.Player(youtubeMountRef.current, {
          videoId: ytId,
          width: "100%",
          height: "100%",
          playerVars: { autoplay: 0, controls: 1, rel: 0 },
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [ytId]);

  // Destroys the player only when VideoPlayer itself unmounts. The mount div stays in the
  // DOM (just hidden) between YouTube links instead of being conditionally unmounted, since
  // the IFrame API replaces that div with its own iframe outside React's knowledge — letting
  // React try to remove/replace it on a ytId change causes a removeChild DOM mismatch.
  useEffect(() => {
    return () => {
      youtubePlayerRef.current?.destroy();
      youtubePlayerRef.current = null;
    };
  }, []);

  const handleProgressScrub = (clientX: number) => {
    if (!progressContainerRef.current) return;
    const rect = progressContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setProgress(percentage);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    handleProgressScrub(e.clientX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleProgressScrub(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="player-container">
      <div className="player-viewport">
        {/* Always mounted (just hidden when inactive) — the IFrame API owns this div's
            contents once created, so it must never be conditionally unmounted by React. */}
        <div className="player-video" style={{ display: ytId ? "block" : "none" }}>
          <div ref={youtubeMountRef} style={{ width: "100%", height: "100%" }} />
        </div>

        {!ytId && isDirectVideo && (
          <video
            className="player-video"
            src={videoUrl}
            controls
            preload="auto"
            playsInline
          />
        )}

        {/* Tier 2: no JS control SDK, so we render the provider's own embed HTML as-is —
            native controls only, no cross-user sync. Safe to inject: html only ever comes
            from noembed for a URL that already passed the Tier 2 domain allowlist. */}
        {!ytId && !isDirectVideo && oembedHtml && (
          <div
            className="player-video player-oembed"
            dangerouslySetInnerHTML={{ __html: oembedHtml }}
          />
        )}

        {!ytId && !isDirectVideo && !oembedHtml && (
          <div className="player-empty-state">
            <Film className="player-empty-icon" size={32} />
            <span className="player-empty-text">No media loaded</span>
          </div>
        )}

        {/* Custom playback controls as fallback overlay when no active media is loaded */}
        {!hasValidMedia && (
          <div className="player-controls-overlay">
            {/* Progress bar */}
            <div
              ref={progressContainerRef}
              className="player-progress-container"
              onMouseDown={handleMouseDown}
            >
              <div className="player-progress-bar" style={{ width: `${progress}%` }}>
                <div className="player-progress-handle" />
              </div>
            </div>

            {/* Control items */}
            <div className="player-controls-row">
              <div className="player-controls-left">
                <button className="player-control-btn" onClick={handlePlayToggle} aria-label={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                </button>
                <button className="player-control-btn" onClick={handleRestart} aria-label="Restart">
                  <RotateCcw size={16} />
                </button>
                <div className="player-volume-container">
                  <button className="player-control-btn" onClick={handleMuteToggle} aria-label={isMuted ? "Unmute" : "Mute"}>
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="player-volume-slider"
                    value={isMuted ? 0 : volume}
                    style={{
                      background: `linear-gradient(to right, #e50914 0%, #e50914 ${isMuted ? 0 : volume}%, rgba(255, 255, 255, 0.2) ${isMuted ? 0 : volume}%, rgba(255, 255, 255, 0.2) 100%)`
                    }}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setVolume(val);
                      if (val > 0) {
                        setPrevVolume(val);
                        if (isMuted) setIsMuted(false);
                      } else {
                        setIsMuted(true);
                      }
                    }}
                    aria-label="Volume"
                  />
                </div>
                <span className="player-time-display">00:00 / 00:00</span>
              </div>

              <div className="player-controls-right">
                <button className="player-control-btn" aria-label="Settings">
                  <Settings size={16} />
                </button>
                <button className="player-control-btn" aria-label="Fullscreen">
                  <Maximize size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
