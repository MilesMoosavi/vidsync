"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import { isSupportedMediaUrl } from "@/lib/media";
import { AlertCircle, X } from "lucide-react";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleLinkSubmit = (url: string) => {
    if (!url.trim()) {
      setVideoUrl("");
      return;
    }

    if (!isSupportedMediaUrl(url)) {
      setToastMessage("Failed to load media: Unsupported format or link structure");
      setVideoUrl("");
    } else {
      setVideoUrl(url);
    }
  };

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", position: "relative" }}>
      <Navbar onLinkPaste={handleLinkSubmit} />
      
      <main style={{ flex: 1, padding: 0, minHeight: 0 }}>
        <VideoPlayer videoUrl={videoUrl} />
      </main>

      {/* Floating Toast Notification at bottom-right */}
      {toastMessage && (
        <div className="toast-notification">
          <AlertCircle size={16} className="toast-icon" />
          <span className="toast-text">{toastMessage}</span>
          <button className="toast-close-btn" onClick={() => setToastMessage(null)} aria-label="Dismiss toast">
            <X size={14} />
          </button>
        </div>
      )}

      <style jsx global>{`
        .toast-notification {
          position: absolute;
          bottom: 24px;
          right: 24px;
          background-color: #121212;
          border: 1px solid #e50914;
          border-radius: 6px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
          z-index: 10000;
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .toast-icon {
          color: #e50914;
          flex-shrink: 0;
        }

        .toast-text {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #ffffff;
        }

        .toast-close-btn {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          margin-left: 6px;
          transition: color 0.15s;
        }

        .toast-close-btn:hover {
          color: #ffffff;
        }

        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
