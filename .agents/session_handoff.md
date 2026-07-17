# Handoff State

**Suggested Title**: VidSync Embed Tiers (Tier 2 — oEmbed providers)

**Timestamp**: 2026-07-16T19:20:16-04:00

**Session Mode**: continue — ACTION REQUIRED: resume Tier 2 embed work immediately after reading.

**Current Objective**: Build a generic media-embedding system for VidSync (a watch-party app) across a 3-tier architecture:
- Tier 1 (done this session): known provider + JS control SDK (YouTube shipped; Vimeo/Twitch not started).
- Tier 2 (next): known via oEmbed, no control SDK — native controls render, no cross-user sync.
- Tier 3 (not started): arbitrary unknown URL — embeddability must be checked server-side via response headers (X-Frame-Options/CSP), since a blocked iframe fails silently client-side.

**Active Files**:
- [src/components/VideoPlayer.tsx](src/components/VideoPlayer.tsx) — main player component, now YouTube-IFrame-API-driven.
- [src/lib/media.ts](src/lib/media.ts) — shared media-URL parsing/metadata module (`getYouTubeId`, `isDirectVideoUrl`, `isSupportedMediaUrl`, `getYouTubeThumbnailUrl`, `fetchYouTubeMetadata`). Has a `// TODO: extend when Tier 1/2/3 providers are added` marker at `isSupportedMediaUrl` — this is the gate every new provider must extend.
- [src/app/page.tsx](src/app/page.tsx), [src/components/Navbar.tsx](src/components/Navbar.tsx) — both call into `src/lib/media.ts`, no duplicated regex remains.
- [docs/embed-tier-test-links.md](docs/embed-tier-test-links.md) — real test links for Tier 2 (Streamable, TED) and Tier 3 (Google/GitHub/NYT blocked, example.com allowed-but-empty).

**Session Context**:
- Deduplicated a YouTube-regex that was copy-pasted across 3 files into `src/lib/media.ts` (ran `/simplify` with 4 parallel review agents — reuse/simplification/efficiency/altitude — before starting Tier 1 work; altitude review explicitly recommended NOT building a provider-registry abstraction yet, since only one provider (YouTube) exists as a concrete case — wait for Tier 2/3 to inform that shape).
- Replaced the raw `<iframe src="youtube.com/embed/...">` with a real `YT.Player` instance via the YouTube IFrame API (`loadYouTubeApi()` helper injects the script once; `youtubePlayerRef` holds the instance; `loadVideoById` reused for swaps rather than reconstructing).
- **Found and fixed a real bug during verification**: conditionally unmounting the YT wrapper div via a ternary (based on `ytId` truthy/falsy) crashed the whole page with `NotFoundError: Failed to execute 'removeChild'` when the link was cleared — because the IFrame API replaces that div with its own iframe outside React's tracking, so React's unmount attempt hit a DOM node it no longer recognized. Fix: the wrapper stays permanently mounted, just hidden via `display: none` when `ytId` is falsy; player is only destroyed on true component unmount (empty-deps effect).
- Verified via Playwright driving the real dev server (no project verify/run skill existed yet, so installed `playwright` with `channel: "chrome"` pointing at the already-installed system Chrome — no browser binary download). Confirmed: initial load, swap between two different YouTube videos (works via `loadVideoById`, `src` attribute doesn't change — that's normal, not a bug), and clear-to-empty (crashed before the fix, clean after).
- Playwright was uninstalled again after verification (`npm uninstall playwright`) to keep `package.json` clean — reinstall with `npm install --no-save playwright` if driving the browser again for Tier 2 work.
- **Went down a wrong path investigating a claimed layout bug** (YouTube's own internal top-right vs bottom-right control cluster placement inside their iframe) — theorized twice (transient intro overlay, then width-breakpoint) and the user rejected both as inaccurate/contradicted by what they were seeing live. Abandoned this thread at the user's explicit instruction ("forget it, let's just move onto tier 2"). **Do not re-open this investigation** unless the user explicitly asks — see `feedback_screenshot_debugging` memory (saved this session) for why: screenshot-based reasoning about third-party iframe internals we don't control is low-confidence, and repeated re-theorizing from more screenshots after a first rejection wastes the user's patience. If revisited, get stronger evidence (e.g. verify live with the user watching) rather than more isolated screenshots.
- Docs cleanup this session: moved 8 reference screenshots (cineby-homepage.png, netflix-homepage.png, w2g_*.png) from `docs/` into `docs/inspo/` for tidiness. Confirmed no markdown files referenced them by path, so no link updates were needed.
- Ported several Gemini/Antigravity global workflows into Claude Code this session: `/caveman`, `/mcq`, `/tidy-workspace` (renamed from `minimalist-workspace`), `/postmortem` (renamed from `protocol-correction`), `/create-snapshot`, plus a new `/migrate` command (`~/.claude/commands/migrate.md`) for porting configs between AI agent environments generally. Two Gemini workflows were folded into `CLAUDE.md` as passive rules instead of commands, since they aren't invocable tasks: `Minimal-Edit Philosophy` (from `minimally-trim`) and `Workflow/Rule Authoring Standards` (from `system-customization`). Also added a **Transcript Path** field to `~/.claude/commands/handoff.md` (this command) — a real capability gap vs. Gemini's handoff workflow, now fixed.

**Environmental State**: Next.js dev server was running on `http://localhost:3000/` for most of this session (confirmed responding via `curl` multiple times). Not confirmed still running at handoff time — check before assuming it's up. `playwright` package is NOT currently installed (removed after verification); reinstall via `npm install --no-save playwright` if browser-driving verification is needed again.

**Transcript Path**: `C:\Users\the10\.claude\projects\c--Users-the10-OneDrive-Documents-GitHub-vidsync\c1937464-f1ed-4590-8bef-19a288616b5c.jsonl` — full chronological log of this session, including the Tier 1 implementation, the /simplify pass, and the abandoned control-layout investigation.

**Last Working State**: Tier 1 YouTube embed confirmed working end-to-end via live browser verification (load, swap, clear-to-empty all pass; lint clean; no console errors beyond YouTube's own ad-pixel CORS noise, which is expected/unrelated).

**Failed Approaches**:
- Theorizing YouTube's internal top-right control cluster placement was a transient "just loaded" overlay — rejected by user as inaccurate.
- Theorizing it was a width-based responsive breakpoint (tested 400/640/900/1200/1600px viewports, cluster appeared consistently at 900px+ widths, contradicting a clean breakpoint theory) — also rejected by user before this could be fully resolved. **Explicitly told to drop this and move on.**

**Captured User Intent**: "no, you are just straight up wrong again. your scratch is inaccurate, or image parsing abilities are weak. forget it, let's just move onto tier 2. /handoff"

**Recommendation**: Start Tier 2 work directly — do NOT revisit the control-layout investigation. Concrete next steps:
1. Extend `src/lib/media.ts` to detect Tier 2 (oEmbed-known, no control SDK) providers. Reference test links already staged in `docs/embed-tier-test-links.md`: Streamable (`https://streamable.com/moo`) and TED (`https://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action`).
2. Likely approach: check for oEmbed discovery (either a known provider list, or a generic oEmbed-endpoint lookup via something like `noembed.com`, which `fetchYouTubeMetadata` in `media.ts` already demonstrates the pattern for) — reuse that fetch pattern rather than reinventing it.
3. Remember the altitude-review guidance from the `/simplify` pass: don't build the full provider-registry abstraction yet — Tier 2's concrete shape (oEmbed response parsing, no control SDK) is the second data point that should inform whether/how to generalize, not something to guess ahead of.
4. Update the `// TODO` marker at `isSupportedMediaUrl` in `media.ts` once Tier 2 providers are added, per its own comment.
5. Verify any Tier 2 work the same way Tier 1 was verified: live browser drive via Playwright (reinstall it), not just lint/typecheck — this repo had no project verify skill, so consider running `/run-skill-generator` per the verify skill's suggestion if this becomes a recurring need.

**Workflow Delta**:
- New commands: `/caveman`, `/mcq`, `/tidy-workspace`, `/postmortem`, `/create-snapshot`, `/migrate`.
- New `CLAUDE.md` rules: `Minimal-Edit Philosophy`, `Workflow/Rule Authoring Standards`.
- `~/.claude/commands/handoff.md` (this command) now includes a **Transcript Path** field — already reflected in this handoff's structure.
- New memory saved: `feedback_screenshot_debugging` (type: feedback) — read it before doing further visual/screenshot-based debugging of any third-party embed's internal UI.

**Primer**: This session did real implementation work (not just planning) — dedup refactor, a live browser-verified Tier 1 YouTube integration with one real bug found and fixed, and a rejected debugging tangent. The user is technically engaged, checks actual rendered output (not just code), and pushes back hard and directly when a claim doesn't match what they're observing — don't over-theorize from limited evidence (especially screenshots of third-party UI) and don't restate a rejected theory in different words. They want Tier 2 started next, directly, without re-litigating the abandoned investigation.

**Rule Sync**: On arrival, read `~/.claude/CLAUDE.md` and check `~/.claude/commands/` for the current command set (six new ones were added this session, listed above).
