# Learnings — Museum Mpu Tantular a11y plan

## Codebase conventions
- React 19 + TS strict, `noUnusedLocals` + `noUnusedParameters` enforced (prefix unused params with `_` or remove)
- Single stylesheet at `src/styles/global.css` — append new blocks at end, do not introduce new CSS files
- No router, no state lib, no CSS framework
- All UI strings, aria-labels, comments in Bahasa Indonesia
- Verification = `npm run lint && npm run build` (no test runner)
- PSV (photo-sphere-viewer) is the only 360° viewer; do not introduce alternatives
- localStorage keys live in app code; convention is `mpu-tantular-*` prefix

## Established patterns (Wave 1, 2026-06-03)
- **Audio context**: module-level singleton `sharedAudioContext`, lazy-created on first `play()` call (not at import). `resume()` invoked inside `play()` to satisfy Safari iOS gesture requirement. `useAudioPlayer` exposes `gain`/`panner` refs as a no-op (gain/panner factory functions exported, but graph wiring deferred to Wave 2 Task 9).
- **A11y prefs storage**: single `mpu-tantular-a11y` key holds `{ contrast, textSize, musicEnabled }`. `useA11yPrefs` reads with lazy `useState` initializer, applies via `useLayoutEffect` to `<html>` dataset (`data-contrast`, `data-text-size`). Pre-paint script in `index.html` applies contrast/text-size attrs before React mounts to prevent FOUC.
- **SkipLink + LiveAnnouncer**: both simple functional components, mounted in `App.tsx` as siblings of `<main id="main">`. LiveAnnouncer returns `useLiveAnnouncer()` hook exporting `{ announce, regionRef }`. Consumers call `announce("Berpindah ke X")` for state transitions in Bahasa Indonesia.
- **Modal a11y**: focus moves to close button on open via `requestAnimationFrame`; previous focus saved in `useRef`; focus trap on `Tab`/`Shift+Tab` cycles within dialog; `Escape` closes; `body.style.overflow = "hidden"` while open; backdrop is a `<button aria-label="Tutup detail artefak">` that closes only on direct click (not dialog children); `aria-describedby` points to description `<p>` with id `artifact-modal-desc`.
- **Artifact type extension**: `description?: string` and `voiceover?: string` added to both `Artifact` and `RawArtifact`. `artifacts.json` gets empty strings for both fields on all 37 entries (user fills content).
- **Existing `aria-hidden` Volume2 icon in TourViewer** (line 191) intentionally preserved — Task 9 will replace with real music toggle button.

## Build/lint state
- Lint: 0 errors, 1 warning (`react-refresh/only-export-components` on `LiveAnnouncer.tsx` — exports both `useLiveAnnouncer` hook and `LiveAnnouncer` default. Non-blocking, dev-only HMR concern.)
- Build: passes (tsc -b && vite build, 1.01s)
- Bundle: 588.85 KB main chunk (above 500 KB warning threshold but pre-existing — not new regression)

## Integration risks for Wave 2
- `src/App.tsx` heavily modified by Tasks 4 + 6 in parallel — Tasks 4's `announce()` calls and Task 6's modal focus-trap MUST coexist; verified all 3 announce() sites in `handleSelectMuseum`, `handleArtifactSelect`, `handleArtifactClose` (lines 79-93) coexist with modal's focus mgmt
- PSV `viewer.animate({ yaw, pitch, speed })` API to be used by Task 11 (keyboard rotation) — speed is duration in ms per `package-lock.json` types
- `viewer.getPosition()` returns `{ yaw, pitch }` for current orientation read
