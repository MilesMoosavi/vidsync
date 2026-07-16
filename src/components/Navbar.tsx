"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, Plus, Link, Play, X } from "lucide-react";
import "./Navbar.css";

const DEFAULT_YT_LINK = "https://www.youtube.com/watch?v=XIMLoLxmTDw";

interface NavbarProps {
  roomTitle?: string;
  userCount?: number;
  onLinkPaste?: (url: string) => void;
  onInviteClick?: () => void;
}

export default function Navbar({
  roomTitle = "Temporary Room",
  userCount = 1,
  onLinkPaste,
  onInviteClick,
}: NavbarProps) {
  const [localTitle, setLocalTitle] = useState(roomTitle);
  const [pasteValue, setPasteValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [ytMetadata, setYtMetadata] = useState<{ title: string; thumbnailUrl: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setLocalTitle(roomTitle);
      e.currentTarget.blur();
    }
  };

  const handlePasteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasteValue(e.target.value);
  };

  const handlePasteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = e.currentTarget.value;
      if (onLinkPaste) {
        onLinkPaste(val);
      }
      setShowDropdown(false);
      e.currentTarget.blur();
    }
  };

  const selectDropdownItem = (url: string) => {
    setPasteValue(url);
    if (onLinkPaste) {
      onLinkPaste(url);
    }
    setShowDropdown(false);
  };

  // Fetch YouTube title and thumbnail dynamically
  useEffect(() => {
    const fetchMetadata = async () => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = DEFAULT_YT_LINK.match(regExp);
      const videoId = match && match[2].length === 11 ? match[2] : null;
      if (!videoId) return;

      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      
      try {
        const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(DEFAULT_YT_LINK)}`);
        const data = await response.json();
        setYtMetadata({
          title: data.title || "YouTube Video",
          thumbnailUrl,
        });
      } catch (err) {
        setYtMetadata({
          title: "YouTube Video",
          thumbnailUrl,
        });
      }
    };

    fetchMetadata();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="navbar-brand">
            <Play className="navbar-logo-icon" size={18} fill="currentColor" />
            <span className="navbar-brand-name">VidSync</span>
          </div>
          <span className="navbar-separator">|</span>
          <div className="navbar-room-title-wrapper">
            <span className="navbar-room-title-dummy">{localTitle || " "}</span>
            <input
              type="text"
              className="navbar-room-title-input"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              aria-label="Room Title"
            />
          </div>
          <button
            type="button"
            className="navbar-icon-btn navbar-copy-btn"
            onClick={() => {
              if (typeof window !== "undefined") {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            title="Copy room link"
          >
            <Link size={14} />
          </button>
        </div>

        <div className="navbar-right">
          <div className="navbar-paste-container" ref={dropdownRef}>
            <input
              type="text"
              className="navbar-paste-input"
              placeholder="Paste a video link..."
              value={pasteValue}
              onChange={handlePasteChange}
              onKeyDown={handlePasteKeyDown}
              onFocus={() => setShowDropdown(true)}
              aria-label="Paste video link"
            />
            {pasteValue && (
              <button
                type="button"
                className="navbar-clear-btn"
                onClick={() => {
                  setPasteValue("");
                  if (onLinkPaste) onLinkPaste("");
                }}
                aria-label="Clear paste link"
              >
                <X size={14} />
              </button>
            )}
            {showDropdown && (
              <div className="navbar-paste-dropdown">
                <button
                  type="button"
                  className="navbar-paste-dropdown-item"
                  onClick={() => selectDropdownItem(DEFAULT_YT_LINK)}
                >
                  {ytMetadata?.thumbnailUrl && (
                    <img
                      src={ytMetadata.thumbnailUrl}
                      alt="Thumbnail"
                      className="navbar-paste-dropdown-thumb"
                    />
                  )}
                  <div className="navbar-paste-dropdown-meta">
                    <span className="navbar-paste-dropdown-title">
                      {ytMetadata?.title || "Loading video details..."}
                    </span>
                    <span className="navbar-paste-dropdown-url">
                      {DEFAULT_YT_LINK}
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="navbar-user-counter">
            <User size={16} />
            <span>{userCount}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
