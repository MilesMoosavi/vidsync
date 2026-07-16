# Vidsync Project Planning

This document consolidates features, architecture, legal compliance, competitor analysis, and name options for Vidsync.

## Planned Features and Architecture

- **Landing Page Link Input**
  - Prompt input field for video URLs directly on landing page.
  - Quick action submit button to resolve embed.

- **Embed Extraction**
  - Serverless resolution of target links to find the main video embed.
  - Automatically loads the most prominent embed on the page.

- **Feature and Extension Preservation**
  - Keeps identical native player options (captions, volume, quality settings, fullscreen).
  - Preserves browser extension features (audio compressors, custom player overrides).

- **Lobby Management and Security**
  - Host authorization required to join watch sessions (accept/deny request notifications).
  - Permissions model allows host to delegate controls (pause, rewind, subtitles) to specific guests.

- **Real-Time Sync**
  - Instant synchronization of playback state via Firebase Realtime Database.
  - Accessible on all devices including desktop and mobile.

## Legal and Policy Compliance

- **Embedding Terms**
  - Use official standard players (YouTube Iframe Player API, Twitch Embed API) to remain compliant with developer terms.
  - Avoid altering advertisements, overlays, or player controls directly to prevent TOS violations.
  - Syncing playback states (play, pause, timestamp) does not constitute unauthorized public performance since each guest pulls directly from the source host.

## Competitor Analysis

- **Watch2Gether** (https://w2g.tv): Browser-based room sync for YouTube/Vimeo; does not require extensions.
- **Teleparty / Netflix Party** (https://www.teleparty.com): Extension-based sync for commercial subscription streaming platforms.
- **Kosmi** (https://kosmi.io): Multi-functional virtual room sharing with screen sharing and chat.
- **SyncUp** (https://syncup.tv): Direct link syncing for HTML5 videos and YouTube.


## Name Workshop Ideas

- **Vidsync** (Recommended; open for watch parties; only minor conflicts exist with a scientific 3D video tool and an OBS broadcasting app).
- **Synco** (Taken; active property management chat app operates at `teamsynco.com` and a major microphone brand operates at `syncoaudio.com`).
- **Synchro** (Free of watch party competitors, but heavily associated with Bentley's construction management suite; does not imply video as clearly as Vidsync).




