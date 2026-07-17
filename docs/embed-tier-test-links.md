# Embed Tier Test Links

Reference links for manually testing the three embed tiers described in the iframe architecture discussion.

## Tier 2 — oEmbed available, no control SDK (native controls, no sync)

- `https://streamable.com/moo` — Streamable, public oEmbed endpoint, no JS player API.
- `https://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action` — TED, oEmbed supported, no JS control API.

## Tier 3 — unknown URL, no oEmbed

**Blocked by X-Frame-Options / CSP (framing refused, iframe stays blank):**
- `https://www.google.com`
- `https://github.com`
- `https://www.nytimes.com`

**Allowed to frame, but no video/oEmbed present (renders, nothing sync-relevant to extract):**
- `https://example.com`

## Notes

- Tier 3 "blocked" cases won't throw a JS error — confirm via a server-side HEAD/GET request inspecting response headers, not by watching the iframe render.
- Direct file links (`.mp4`, `.webm`) bypass all three tiers — they hit the existing `<video>` fallback path in `VideoPlayer.tsx`, not the iframe logic.
