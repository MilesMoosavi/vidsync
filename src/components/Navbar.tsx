"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, Link, Play, X } from "lucide-react";
import NextLink from "next/link";
import { fetchMediaMetadata } from "@/lib/media";
import "./Navbar.css";

const DEFAULT_MEDIA_LINKS = [
  "https://www.youtube.com/watch?v=XIMLoLxmTDw",
  "https://www.youtube.com/watch?v=ucZl6vQ_8Uo",
  "https://streamable.com/moo"
];

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
}: NavbarProps) {
  const [localTitle, setLocalTitle] = useState(roomTitle);
  const [pasteValue, setPasteValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mediaMetadata, setMediaMetadata] = useState<Record<string, { title: string; thumbnailUrl: string }>>({});
  const [showTooltip, setShowTooltip] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [showProfileTooltip, setShowProfileTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
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

  // Fetch media title and thumbnail dynamically
  useEffect(() => {
    const fetchMetadata = async () => {
      const metadataMap: Record<string, { title: string; thumbnailUrl: string }> = {};
      for (const link of DEFAULT_MEDIA_LINKS) {
        const meta = await fetchMediaMetadata(link);
        if (meta) {
          metadataMap[link] = meta;
        }
      }
      setMediaMetadata(metadataMap);
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
          <NextLink href="/" className="navbar-brand">
            <Play className="navbar-logo-icon" size={18} fill="currentColor" />
            <span className="navbar-brand-name">VidSync</span>
          </NextLink>
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
            onMouseEnter={() => setShowCopyTooltip(true)}
            onMouseLeave={() => setShowCopyTooltip(false)}
          >
            <Link size={14} />
            <div className={`navbar-tooltip ${showCopyTooltip ? "active" : ""}`}>
              <div className="navbar-tooltip-item">Copy room link</div>
            </div>
          </button>
          <div
            className="navbar-user-counter"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <User size={16} />
            <span>{userCount}</span>
            <div className={`navbar-tooltip ${showTooltip ? "active" : ""}`}>
              <div className="navbar-tooltip-title">Users currently connected</div>
              <div className="navbar-tooltip-item">1. Placeholdername (You)</div>
            </div>
          </div>
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
                {DEFAULT_MEDIA_LINKS.map((link) => {
                  const meta = mediaMetadata[link];
                  return (
                    <button
                      key={link}
                      type="button"
                      className="navbar-paste-dropdown-item"
                      onClick={() => selectDropdownItem(link)}
                    >
                      {meta?.thumbnailUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={meta.thumbnailUrl}
                          alt="Thumbnail"
                          className="navbar-paste-dropdown-thumb"
                        />
                      )}
                      <div className="navbar-paste-dropdown-meta">
                        <span className="navbar-paste-dropdown-title">
                          {meta?.title || "Video details..."}
                        </span>
                        <span className="navbar-paste-dropdown-url">
                          {link}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <button type="button" className="navbar-profile-btn" onMouseEnter={() => setShowProfileTooltip(true)} onMouseLeave={() => setShowProfileTooltip(false)}>
            <User size={18} className="navbar-profile-icon" />
            <div className={`navbar-tooltip ${showProfileTooltip ? "active" : ""}`}>
              <div className="navbar-tooltip-item">Account creation coming soon</div>
            </div>
          </button>
        </div>
      </div>

      {/*
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowModal(false)} aria-label="Close modal">
              <X size={18} />
            </button>
            <h2 className="modal-title">Create Account</h2>
            
            <form onSubmit={(e) => { e.preventDefault(); setShowModal(false); }} className="modal-form">
              <div className="modal-input-group">
                <input
                  type="email"
                  placeholder="Email address"
                  className="modal-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="modal-submit-btn" disabled={!email.trim()}>
                Continue
              </button>
            </form>
            
            <div className="modal-divider">
              <span>or</span>
            </div>
            
            <button type="button" className="modal-google-btn" onClick={() => setShowModal(false)}>
              <svg className="google-icon" viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '8px' }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Sign in with Google
            </button>
            
            <div className="modal-footer">
              Already have an account? <button type="button" className="modal-link-btn" onClick={() => setShowModal(false)}>Sign in</button>
            </div>
          </div>
        </div>
      */}
    </nav>
  );
}
