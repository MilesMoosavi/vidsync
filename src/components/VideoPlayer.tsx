"use client";

import React, { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Settings, Film } from "lucide-react";
import "./VideoPlayer.css";

interface VideoPlayerProps {
  videoUrl?: string;
}

export default function VideoPlayer({ videoUrl = "" }: VideoPlayerProps) {
  const progressContainerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [prevVolume, setPrevVolume] = useState(80);
  const [progress, setProgress] = useState(30); // dummy progress percentage

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

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const ytId = getYouTubeId(videoUrl);
  const isDirectVideo = /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(videoUrl);
  const hasValidMedia = ytId || isDirectVideo;

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
        {ytId ? (
          <iframe
            className="player-video"
            src={`https://www.youtube.com/embed/${ytId}?autoplay=0&controls=1&rel=0`}
            title="Video Playback"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        ) : isDirectVideo ? (
          <video
            className="player-video"
            src={videoUrl}
            controls
            preload="auto"
            playsInline
          />
        ) : (
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
