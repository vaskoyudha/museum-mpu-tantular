# Plan: A11y + Audio + Reorder — Museum Mpu Tantular 360° SPA

## TL;DR

> **Quick Summary**: Add audio infrastructure (gamelan background + artifact voiceover), refine accessibility for blind/low-vision users (aria-live announcer, skip link, high contrast, text scaling, keyboard rotation, text-catalog section, rich alt text), retrofit the existing modal with focus management, and document the data structure so the user can self-reorder the 23 room sequence without breaking the hotspot graph.
>
> **Deliverables**:
> - `useAudioPlayer` hook + `useA11yPrefs` hook (vanilla Web Audio + localStorage, no new deps)
> - `SkipLink`, `LiveAnnouncer`, `AccessibilityWidget`, `CatalogSection`, `ArtifactVoiceover` components
> - CSS additions in `src/styles/global.css` (high-contrast tokens, text-scale tokens, focus rings, skip link, catalog, widget, voiceover player)
> - `Artifact` type extended with `description` and `voiceover` fields; `artifacts.json` skeleton with empty fields user can fill
> - Modal a11y retrofit: focus moves in on open, focus trap, return focus on close, `aria-describedby`, keyboard handler for backdrop
> - Keyboard rotation for the 360° viewer (arrow keys + +/- + Home, pitch clamped ±85°, respects `prefers-reduced-motion`)
> - Music toggle in `TourViewer` toolbar with stereo pan based on yaw + gain-node ducking when voiceover plays
> - Pre-paint inline script in `index.html` to apply a11y prefs before first paint (no FOUC)
> - `docs/audio-assets.md` uploader guide (no code blocked on user uploading audio)
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 3 implementation waves + 1 final verification wave
> **Critical Path**: Audio hook (1) → Music toggle (8) & Voiceover (9) & Keyboard rotation (10) → Final QA

---

## Context

### Original Request
User listed 4 revisions: (1) Gamelan Jawa background music, (2) voiceover per artifact (files already on Google Drive), (3) self-reorder the 23 room sequence, (4) blind/low-vision accessibility features (provided 6-feature AI list, asked which are realistic).

### Interview Summary

**Key Discussions**:
- User wants plan first before any code execution
- Mode Katalog: section (not toggle) — default chosen, no router
- User will reorder rooms themselves; plan documents data structure only
- Bahasa Indonesia throughout, including `aria-label`s and comments
- No new npm dependencies; vanilla Web Audio + HTML5 audio only
- Voiceover + music defaults OFF (no autoplay)

**Research Findings** (from Metis gap analysis + code read):
- `Artifact` type currently has only `id, sceneId, name, photos, cards, x, y, angle` — no `description` or `voiceover` field
- `sceneAssets` (array) and `routeHotspots` (graph) are TWO independent layers in `src/data/museums.ts`; reordering must touch both
- PSV (photo-sphere-viewer) does NOT have native keyboard rotation; need a `keydown` handler on the stage div calling `viewer.animate({ yaw, pitch })` (API verified via `package-lock.json`)
- `StereoPannerNode` is supported in all evergreen browsers (Safari ≥ 14.1); fallback to `GainNode` L/R pair for older
- Existing modal lacks focus management, focus trap, return-focus-on-close — these are real gaps to fix
- LSP reports zero diagnostics; the 6 ARIA "errors" the user mentioned must come from a separate audit. Plan includes a manual a11y checklist in the final verification wave.

### Metis Review (50+ findings, all addressed below)

**Audio**:
- Lock to MP3 only, ~80KB per file target, ≤2MB total budget
- Ducking: voiceover lowers gamelan to 30% via `GainNode`
- AudioContext.resume() inside click handler (Safari iOS quirk)
- Music pauses on `document.visibilitychange`
- Loop seam handled by user-supplied clip or 1–2s crossfade

**Guardrails (added to Must NOT Have below)**:
- No React Context for a11y prefs; no focus-management libraries; no `useReducer`; no service worker; no analytics
- No Three.js mutation; use only documented PSV public API
- No English in `aria-label`; no `console.log` debug noise

**Modal retrofit**:
- Focus moves to close button on open
- Focus trap (Tab/Shift+Tab cycle)
- Return focus to trigger button on close
- `aria-describedby` actually points to a description element
- Announce open/close via LiveAnnouncer

**Catalog**:
- `<details>` per scene collapsed by default
- Group by 4 existing categories (mirror TourSection)
- Heading hierarchy h2 → h3 (scene) → h4 (artifact)
- Each artifact is a button that opens ArtifactModal (reuses state)
- Voiceover play button inline in catalog (if file exists)

**High contrast**:
- Apply on `<html>` (not `body`) for cascade into portals
- Pre-paint inline script in `index.html` to avoid FOUC
- Token overrides: `--paper → #000`, `--ink → #FFF`, accent colors → borders
- Drop shadow tokens in high-contrast scope
- One localStorage key: `mpu-tantular-a11y`

---

## Work Objectives

### Core Objective
Make the Mpu Tantular 360° tour usable by blind and low-vision visitors by (a) adding audio (gamelan background + per-artifact voiceover), (b) implementing keyboard and screen-reader paths, (c) providing a textual catalog alternative, and (d) retrofitting the existing modal — all without adding dependencies or breaking the single-page, single-stylesheet, no-router architecture.

### Concrete Deliverables
- `src/hooks/useAudioPlayer.ts` (new) — single audio element per consumer, AudioContext lazy resume, ducking support
- `src/hooks/useA11yPrefs.ts` (new) — high contrast + text size + music enabled, localStorage-backed, SSR-safe
- `src/components/SkipLink.tsx` (new) — visually hidden until focus, jumps to `<main id="main">`
- `src/components/LiveAnnouncer.tsx` (new) — polite `aria-live` region, imperative `.announce(text)` API
- `src/components/AccessibilityWidget.tsx` (new) — floating button (bottom right) with popover: contrast toggle, text size (3 levels), music toggle, reset
- `src/components/CatalogSection.tsx` (new) — grouped by category, `<details>` per scene, h3/h4 hierarchy
- `src/components/ArtifactVoiceover.tsx` (new) — minimal `<audio>` player, error state, lazy mount
- `src/data/artifacts.ts` — extend `Artifact` type with optional `description` and `voiceover`
- `src/data/artifacts.json` — add empty `description` and `voiceover` fields to ALL existing entries (user fills content)
- `src/components/TourViewer.tsx` — wire music toggle, keyboard rotation handler, stereo pan
- `src/App.tsx` — mount new components, retrofit `ArtifactModal` (focus mgmt, focus trap, return focus, `aria-describedby`, voiceover player, rich description)
- `src/styles/global.css` — append a11y block (high-contrast tokens, text-scale tokens, focus rings, skip link, catalog, widget, voiceover player, live announcer)
- `index.html` — pre-paint inline script to apply a11y prefs before first paint; verify `lang="id"`
- `docs/audio-assets.md` (new) — uploader guide (naming, format, loop, ducking)

### Definition of Done
- `npm run lint` passes (no `as any`, no `@ts-ignore`)
- `npm run build` passes (strict TS, no unused imports/params)
- All 9 final-wave F1–F4 review agents return APPROVE
- `docs/audio-assets.md` exists and documents expected file paths matching the code
- Code merges with **empty** `public/audio/` (only `.gitkeep`); UI shows "Audio belum tersedia" gracefully
- User can edit `src/data/museums.ts` (`sceneAssets` + `routeHotspots`) to reorder rooms without breaking prev/next or hotspot graph (documented in plan's reorder section, and inline comment in `museums.ts`)

### Must Have
- Audio plays when user toggles ON (gamelan loop) and when user clicks play in modal (voiceover)
- Voiceover ducks gamelan to 30% when both active
- Live announcer announces scene changes, modal open/close, a11y toggle changes — in Bahasa Indonesia
- Skip link appears on Tab, jumps to main content
- High contrast theme passes WCAG AA contrast ratios (4.5:1 normal, 3:1 large)
- Text scale at 125% (x-large) does not break layout (no horizontal scroll, no overflow)
- Keyboard rotation: arrow keys, +/-, Home; pitch clamped ±85°; respects `prefers-reduced-motion`
- All 23 scenes appear in catalog section, grouped by 4 categories
- Modal: focus moves to close button on open, focus trap, return focus to trigger on close
- Music + voiceover files are referenced by `artifacts.json` and a single path convention; missing files render "Audio belum tersedia" without throwing

### Must NOT Have (Guardrails)
- No new npm dependencies (vanilla Web Audio + HTML5 audio + localStorage only)
- No router, no state library, no CSS framework, no CSS-in-JS, no new CSS file
- No React Context for a11y prefs; no `useReducer`; no focus-management libraries
- No service worker, no IndexedDB, no analytics, no telemetry
- No Three.js mutation; only documented PSV public API
- No English in `aria-label` or visible UI; no translation pass
- No `console.log` debug noise that survives lint
- No autoplay of any audio without explicit user gesture
- No PWA / offline support
- No CMS / admin UI / content tool
- No "settings page" or modal for a11y — floating widget + popover only
- No scope creep: no search box in catalog, no lightbox, no auto-tour, no scene-change animations, no English version, no URL hash sync to scene, no per-artifact prev/next inside modal
- No reorder of `sceneAssets` in this plan (user does it themselves)
- No unit tests (project has no test infrastructure)
- No changes to panorama 360° rendering itself (PSV config stays the same)

### Spec Framework Integration
None detected. Project has no OpenSpec / Spec Kit / BMAD directories. No spec-to-task mapping needed.

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — all verification is agent-executed via `npm run lint`, `npm run build`, Playwright for UI, and a manual a11y checklist mapped to F2/F3.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: NONE (project has no test runner; AGENTS.md "No test runner")
- **Framework**: N/A
- **Agent-Executed QA**: ALWAYS — every task has QA Scenarios below; agents run Playwright (UI) and bash (build/lint/curl) to verify

### QA Policy
- **Frontend/UI**: Use Playwright (built-in) — navigate, click, type, tab, screenshot
- **TUI/CLI**: N/A (no TUI in this project)
- **API/Backend**: N/A (no API in this project)
- **Library/Module**: Use `bash` (curl, `node -e` for Web Audio feature detect)
- **Build verification**: `npm run lint && npm run build` MUST PASS at the end of every wave

### Manual A11y Checklist (executed by F2/F3 agents)
1. Tab from URL bar → skip link appears → Enter jumps to main
2. Tab through Header → Hero → each section → MobileTabBar; all focusable items have visible focus ring
3. Tab into TourViewer → arrow keys rotate yaw/pitch → +/- zoom → Home resets
4. Pitch cannot exceed ±85° even when holding arrow-up
5. Click hotspot → focus moves to viewer toolbar / scene header (announce "Berpindah ke: X")
6. Tab into ArtifactModal → focus on close button → Tab cycles within modal → Shift+Tab cycles back → Esc closes → focus returns to trigger
7. Click "Kontras tinggi" toggle → page text becomes pure black on white (or chosen scheme) → announce "Kontras tinggi aktif" → reload page → contrast persists
8. Click "Ukuran teks" three times → text grows 100% → 112.5% → 125% → no horizontal scroll → reload → persists
9. Click music toggle → audio plays (gamelan if file present, else "Audio belum tersedia") → rotate viewer → pan shifts L/R
10. Open artifact modal with voiceover file present → click play → audio plays → gamelan ducks to ~30% → close modal → voiceover stops
11. Toggle high contrast mid-modal → modal inherits high contrast (no flash)
12. Open `http://localhost:5173/` → enable VoiceOver / NVDA (if available) → verify announcements in Bahasa Indonesia
13. Run axe-core via browser extension or `npx @axe-core/cli http://localhost:5173` (if user has it) — capture findings; F2 includes this

### Evidence Locations
- `.omo/evidence/task-{N}-{slug}.png` for screenshots
- `.omo/evidence/task-{N}-{slug}.txt` for terminal output
- `.omo/evidence/final-qa/` for F3 screenshots

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — 7 tasks, all independent, max parallel):
├── 1. useAudioPlayer hook + public/audio scaffolding
├── 2. CSS a11y tokens in global.css (high contrast + text scale + focus rings)
├── 3. useA11yPrefs hook + index.html pre-paint script
├── 4. SkipLink + LiveAnnouncer components + main id
├── 5. Artifact type extension + artifacts.json empty fields
├── 6. Modal a11y retrofit (focus mgmt, trap, return focus, aria-describedby)
└── 7. docs/audio-assets.md uploader guide

Wave 2 (Core features — 5 tasks, all independent after Wave 1):
├── 8. AccessibilityWidget (floating popover with 3 toggles + reset)
├── 9. Music toggle in TourViewer (gamelan + stereo pan + ducking)
├── 10. ArtifactVoiceover + rich description in modal
├── 11. Keyboard rotation handler in TourViewer (arrows, +/-, Home, ±85° clamp)
└── 12. CatalogSection component (grouped by category, <details>, h3/h4)

Wave 3 (Integration + manual a11y audit):
├── 13. Manual a11y audit (Playwright + axe-core CLI + keyboard tests) + fixes
└── 14. Visual polish + accessibility-tree snapshot to evidence/

Wave FINAL (4 parallel reviews):
├── F1. Plan Compliance Audit — oracle
├── F2. Code Quality Review (incl. a11y checklist) — unspecified-high
├── F3. Real Manual QA (Playwright keyboard + VoiceOver announce) — unspecified-high
└── F4. Scope Fidelity Check — deep

Critical Path: 1 → 9 → F1–F4
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 7 (Wave 1)
```

### Dependency Matrix (full)

- **1** (useAudioPlayer): - - 8, 9, 10
- **2** (CSS tokens): - - 7, 8, 9, 10, 11, 12
- **3** (useA11yPrefs): - - 7, 8
- **4** (SkipLink + LiveAnnouncer): - - 6, 8, 9, 10, 11, 12
- **5** (Artifact type + JSON): - - 6, 9, 10, 12
- **6** (Modal retrofit): 4, 5 - 9, 10, F1
- **7** (uploader guide): - - F1
- **8** (A11yWidget): 2, 3, 4 - F1, F2
- **9** (Music toggle): 1, 2, 4, 6 - F1, F3
- **10** (Voiceover in modal): 1, 2, 4, 5, 6 - F1, F3
- **11** (Keyboard rotation): 2, 4 - F1, F3
- **12** (CatalogSection): 2, 4, 5 - F1, F3
- **13** (Manual a11y audit + fixes): 6, 8, 9, 10, 11, 12 - F1, F2, F3
- **14** (Polish + snapshots): 13 - F1, F2, F3

### Agent Dispatch Summary

- **Wave 1**: 7 tasks
  - 1 (useAudioPlayer): `quick`
  - 2 (CSS tokens): `quick`
  - 3 (useA11yPrefs): `quick`
  - 4 (SkipLink + LiveAnnouncer): `quick`
  - 5 (Artifact type + JSON): `quick`
  - 6 (Modal retrofit): `unspecified-high` (focus mgmt is tricky)
  - 7 (uploader guide): `quick` (doc only)
- **Wave 2**: 5 tasks
  - 8 (A11yWidget): `visual-engineering` (UI design matters)
  - 9 (Music toggle + stereo pan): `unspecified-high` (Web Audio + PSV)
  - 10 (Voiceover + rich desc): `quick` (mostly wire-up)
  - 11 (Keyboard rotation): `unspecified-high` (PSV API)
  - 12 (CatalogSection): `visual-engineering` (layout)
- **Wave 3**: 2 tasks
  - 13 (Manual a11y audit + fixes): `unspecified-high`
  - 14 (Polish + snapshots): `quick`
- **Wave FINAL**: 4 parallel reviews
  - F1: `oracle`
  - F2: `unspecified-high`
  - F3: `unspecified-high` (with playwright skill)
  - F4: `deep`

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info + QA Scenarios.
> A task WITHOUT QA Scenarios is INCOMPLETE.
> Task labels use bare numbers: `1.`, `2.`, `3.`
> Final Wave labels use `F1.`, `F2.`, `F3.`, `F4.`

- [x] 1. `useAudioPlayer` hook + `public/audio/` scaffolding

  **What to do**:
  - Create `src/hooks/useAudioPlayer.ts` exporting a hook with signature `{ play(), pause(), stop(), isPlaying, error, duration }`. Internally: single `HTMLAudioElement` (lazy-created on first `.play()`), `AudioContext` lazy-created inside click handler with `resume()`, optional `gain` and `panner` nodes for ducking + stereo pan.
  - Accept options `{ src: string, loop?: boolean, volume?: number, onError?: (e) => void }`. If `src` is empty/null, `play()` resolves immediately with `error: 'no-src'`. Never throws.
  - Use a global `AudioContext` shared across all hook instances (module-level singleton) so only one context is created. Lazily `resume()` it inside `play()` to handle Safari iOS gesture requirement.
  - Create `public/audio/.gitkeep`, `public/audio/ambient/.gitkeep`, `public/audio/voiceover/.gitkeep`.
  - **No README/docs in this task** (covered by Task 7).

  **Must NOT do**:
  - No npm dependency additions
  - No React Context (hook only, localStorage handled in Task 3)
  - No autoplay without user gesture (consumer must call `play()` from a click handler)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: none required (vanilla Web Audio)
  - **Reason**: Single new file, well-scoped, no design decisions.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2–7)
  - **Blocks**: 8, 9, 10
  - **Blocked By**: None

  **References** (CRITICAL):
  - **Pattern References**: `src/App.tsx:45–56` — existing localStorage try/catch pattern to mirror for any error handling; `src/App.tsx:566–577` — `useEffect` cleanup pattern for audio pause-on-unmount.
  - **API/Type References**: Web Audio API — `AudioContext`, `GainNode`, `StereoPannerNode` (all standard).
  - **External References**: MDN `HTMLAudioElement`, `AudioContext.resume()` for Safari gesture requirement.
  - **WHY**: Executor must mirror existing error-handling idiom so the hook is consistent with the rest of the app.

  **Acceptance Criteria**:
  - [ ] `src/hooks/useAudioPlayer.ts` exists and exports the hook
  - [ ] Hook compiles under strict TS (no `any`, no unused params)
  - [ ] Three `.gitkeep` files exist in `public/audio/`, `public/audio/ambient/`, `public/audio/voiceover/`
  - [ ] Hook does not throw when `src` is missing — returns `error: 'no-src'`
  - [ ] `AudioContext.resume()` is called inside `play()` (not at module import)
  - [ ] `npm run lint && npm run build` pass

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Hook returns no error when src is missing
    Tool: Bash (node -e)
    Preconditions: empty `public/audio/`
    Steps:
      1. cd /home/vascosera/Documents/Github/Meseum && npm run build
      2. Verify: build exits 0, no TS errors mentioning useAudioPlayer
    Expected Result: build clean
    Evidence: .omo/evidence/task-1-build-clean.txt
  ```
  ```
  Scenario: AudioContext is created lazily, not at module import
    Tool: Bash (grep)
    Preconditions: src/hooks/useAudioPlayer.ts written
    Steps:
      1. grep -n "new AudioContext\|resume()" src/hooks/useAudioPlayer.ts
      2. Verify: `new AudioContext` appears inside a function body (not module top-level)
      3. Verify: `resume()` is called inside the play() method
    Expected Result: AudioContext creation deferred to user gesture
    Evidence: .omo/evidence/task-1-grep.txt
  ```

  **Commit**: YES (groups with 2, 3, 4, 5, 6, 7)

- [x] 2. CSS a11y foundation tokens in `global.css`

  **What to do**:
  - Append a new `/* ============================================================
       A11y Foundation: high contrast + text scale + focus rings
       ============================================================ */` block to the END of `src/styles/global.css`.
  - Define `:root` data-attribute and class selectors for the three states:
    - `html[data-text-size="lg"] { font-size: 112.5% }`
    - `html[data-text-size="xl"] { font-size: 125% }`
    - `html[data-contrast="high"] { --paper: #000; --ink: #FFF; --ink-soft: #FFF; --shadow-*: none; }` (implementer chooses exact palette but MUST pass 4.5:1 contrast for normal text, 3:1 for large text)
  - Define a global `:focus-visible` rule with high-contrast outline: `outline: 3px solid var(--saffron); outline-offset: 2px`. Override within `[data-contrast="high"]` to use white outline on black.
  - Define `.skip-link` styles (visually hidden until focus).
  - Define `.live-announcer` (visually hidden, but available to screen readers: `position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;`).
  - DO NOT touch existing tokens — only ADD new selectors at the END of the file.

  **Must NOT do**:
  - No new CSS file (project rule: single stylesheet)
  - No `!important` (existing code doesn't use it)
  - No CSS-in-JS

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: none required
  - **Reason**: CSS-only, no logic; tokens appended to existing file.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: 7, 8, 9, 10, 11, 12
  - **Blocked By**: None

  **References**:
  - **Pattern References**: `src/styles/global.css:7–35` — existing `:root` token block to mirror in style (custom-property-only overrides).
  - **External References**: WCAG 2.2 AA contrast guidelines.

  **Acceptance Criteria**:
  - [ ] `global.css` ends with the new A11y Foundation block
  - [ ] High-contrast mode yields ≥4.5:1 contrast for `--ink` on `--paper` (verify with contrast checker in F2)
  - [ ] Text scale at 125% does not break layout in default Hero section (Playwright F3)
  - [ ] `:focus-visible` outline visible on a `<button>` (F2)
  - [ ] `npm run lint && npm run build` pass

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: High contrast tokens apply via data attribute
    Tool: Bash (grep)
    Preconditions: global.css updated
    Steps:
      1. grep -n "data-contrast" src/styles/global.css
      2. Verify: selector exists with override of --paper and --ink
    Expected Result: tokens override
    Evidence: .omo/evidence/task-2-contrast-grep.txt
  ```
  ```
  Scenario: Text scale uses percent (not px) to allow user zoom
    Tool: Bash (grep)
    Preconditions: global.css updated
    Steps:
      1. grep -n "data-text-size" src/styles/global.css
      2. Verify: at least two breakpoints (lg, xl) defined
      3. Verify: uses `font-size: NN%` (allows user zoom)
    Expected Result: text scale defined in percent
    Evidence: .omo/evidence/task-2-text-scale-grep.txt
  ```

  **Commit**: YES (groups with 1, 3, 4, 5, 6, 7)

- [x] 3. `useA11yPrefs` hook + `index.html` pre-paint script

  **What to do**:
  - Create `src/hooks/useA11yPrefs.ts` exporting `useA11yPrefs()` returning `{ contrast: 'default' | 'high', textSize: 'default' | 'lg' | 'xl', musicEnabled: boolean, setContrast, setTextSize, setMusicEnabled, reset }`.
  - State persisted in `localStorage` under key `mpu-tantular-a11y` (single JSON object, not three separate keys).
  - On mount: read from localStorage, set `data-contrast` and `data-text-size` attributes on `<html>` element, return state. Apply in `useLayoutEffect` (not `useEffect`) to avoid paint flash.
  - SSR-safe: try/catch around localStorage reads; on private mode / quota error, return defaults.
  - Add inline script to `index.html` `<head>` (BEFORE the Vite module script tag) that reads localStorage and sets `document.documentElement.dataset.contrast` + `document.documentElement.dataset.textSize` synchronously. This prevents FOUC.
  - Verify `index.html` already has `<html lang="id">` (it does — per AGENTS.md). If not, add it. Document the no-op if already present.

  **Must NOT do**:
  - No React Context (per Metis + decisions)
  - No IndexedDB / service worker
  - No useReducer

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: none
  - **Reason**: Single hook + small inline script, well-scoped.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: 7, 8
  - **Blocked By**: None

  **References**:
  - **Pattern References**: `src/App.tsx:40–65` — existing localStorage init + try/catch pattern; mirror this.
  - **API/Type References**: `useLayoutEffect` (React 19 docs); `HTMLHtmlElement.dataset`.

  **Acceptance Criteria**:
  - [ ] `useA11yPrefs.ts` exists, exports the hook
  - [ ] Single localStorage key `mpu-tantular-a11y` (verified by grep)
  - [ ] `useLayoutEffect` is used (NOT `useEffect`) for apply
  - [ ] `index.html` has pre-paint inline script
  - [ ] Script reads localStorage and sets `data-contrast` + `data-text-size` on `<html>` BEFORE first paint
  - [ ] `npm run lint && npm run build` pass
  - [ ] No regression: existing `mpu-tantular-artefak-visited` localStorage key still works (different key — verified by grep)

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: localStorage key isolated from existing visited key
    Tool: Bash (grep)
    Preconditions: hook written
    Steps:
      1. grep -rn "mpu-tantular-a11y\|mpu-tantular-artefak-visited" src/
      2. Verify: TWO distinct keys, no overlap
    Expected Result: keys separate
    Evidence: .omo/evidence/task-3-keys.txt
  ```
  ```
  Scenario: Pre-paint script runs before module script
    Tool: Bash (grep)
    Preconditions: index.html updated
    Steps:
      1. grep -n "data-contrast\|data-text-size\|mpu-tantular-a11y\|type=\"module\"" index.html
      2. Verify: pre-paint script tag appears BEFORE the Vite module script tag
    Expected Result: pre-paint, no FOUC
    Evidence: .omo/evidence/task-3-index-html.txt
  ```

  **Commit**: YES (groups with 1, 2, 4, 5, 6, 7)

- [x] 4. `SkipLink` + `LiveAnnouncer` components + `<main id="main">`

  **What to do**:
  - Create `src/components/SkipLink.tsx`: a visually hidden `<a href="#main">` that becomes visible on focus. Indonesian label: "Lewati ke konten utama". Styled via `.skip-link` class (CSS from Task 2).
  - Create `src/components/LiveAnnouncer.tsx`: a single `<div role="status" aria-live="polite" aria-atomic="true" className="live-announcer" />` that exposes an imperative `useLiveAnnouncer()` hook returning `announce(text: string)`. Use a ref to set `textContent`; do NOT use React state for the message (would cause re-renders on every announcement). Optionally also use a `useState` for the message to render visibly for debugging during dev.
  - In `src/App.tsx`: add `id="main"` to the existing `<main className="site-shell">`; mount `<SkipLink />` as the first child of `<main>`; mount `<LiveAnnouncer />` somewhere inside `<main>` (visually hidden).
  - When `setActiveMuseum(m)` is called in `App.tsx`, also call `announce("Berpindah ke " + m.highlight)`. When `setActiveArtifact(a)` is called, call `announce("Membuka detail artefak: " + a.name)`. When `setActiveArtifact(null)` is called, call `announce("Menutup detail")`.

  **Must NOT do**:
  - No React Context (hook returns imperative ref)
  - No portals (LiveAnnouncer mounts inline)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: none
  - **Reason**: Two small components, well-scoped, no design decisions.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: 6, 8, 9, 10, 11, 12
  - **Blocked By**: None

  **References**:
  - **Pattern References**: `src/App.tsx:40` — note Indonesian label convention; `src/App.tsx:82` — `<main>` tag to update.
  - **External References**: ARIA `role="status"`, `aria-live="polite"` (mdn).

  **Acceptance Criteria**:
  - [ ] `SkipLink.tsx` and `LiveAnnouncer.tsx` exist
  - [ ] `<main id="main">` is present in `App.tsx`
  - [ ] LiveAnnouncer is mounted inside `<main>`
  - [ ] `setActiveMuseum` triggers `announce("Berpindah ke ...")`
  - [ ] `setActiveArtifact(a)` triggers `announce("Membuka detail ...")`
  - [ ] `setActiveArtifact(null)` triggers `announce("Menutup detail")`
  - [ ] `npm run lint && npm run build` pass

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Main element has id="main"
    Tool: Bash (grep)
    Preconditions: App.tsx updated
    Steps:
      1. grep -n 'id="main"' src/App.tsx
      2. Verify: exactly one match, on the <main> tag
    Expected Result: id present
    Evidence: .omo/evidence/task-4-main-id.txt
  ```
  ```
  Scenario: LiveAnnouncer is mounted and announce() is wired
    Tool: Bash (grep)
    Preconditions: App.tsx updated
    Steps:
      1. grep -n "announce(\|LiveAnnouncer" src/App.tsx
      2. Verify: announce() called in setActiveMuseum, setActiveArtifact, and setActiveArtifact(null) contexts
      3. Verify: <LiveAnnouncer /> mounted in the JSX tree
    Expected Result: 3 call sites + 1 mount
    Evidence: .omo/evidence/task-4-announce-calls.txt
  ```

  **Commit**: YES (groups with 1, 2, 3, 5, 6, 7)

- [x] 5. `Artifact` type extension + `artifacts.json` empty fields

  **What to do**:
  - In `src/data/artifacts.ts`:
    - Extend `Artifact` type with two OPTIONAL fields: `description?: string` (rich text for SR/alt) and `voiceover?: string` (path to audio file, e.g. `/audio/voiceover/ganesha.mp3`).
    - Update the `RawArtifact` type to include these fields (also optional).
    - In the `.map()` that builds `Artifact[]`, propagate these fields from raw → typed.
  - In `src/data/artifacts.json`:
    - For EVERY existing artifact entry, add two empty fields: `"description": ""` and `"voiceover": ""`. Use empty strings, not null, to keep the shape consistent.
    - The empty strings are placeholders; the user will fill them with real descriptions and audio paths.
  - This change is **purely additive** — existing code that reads `Artifact.photos` / `Artifact.cards` is unaffected. Consumers (Tasks 6, 9, 10, 12) will read the new fields.

  **Must NOT do**:
  - Don't make `description` or `voiceover` required (existing data has no values yet; required = build break)
  - Don't change the order of `artifacts.json` (user reorders via a separate path)
  - Don't change `x, y, angle` computation (those are programmatic)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: none
  - **Reason**: Data type + JSON skeleton, no logic, no design.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: 6, 9, 10, 12
  - **Blocked By**: None

  **References**:
  - **API/Type References**: `src/data/artifacts.ts:3–12` — existing `Artifact` type; `src/data/artifacts.ts:31–37` — existing `RawArtifact` type; `src/data/artifacts.ts:46–60` — the `.map()` that builds `Artifact[]`.
  - **WHY**: Executor must add fields in the right place so the existing build still passes.

  **Acceptance Criteria**:
  - [ ] `Artifact` type has `description?: string` and `voiceover?: string`
  - [ ] `RawArtifact` type has the same two fields
  - [ ] `.map()` propagates the fields
  - [ ] Every entry in `artifacts.json` has `"description": ""` and `"voiceover": ""` (grep count = number of entries)
  - [ ] `npm run lint && npm run build` pass (TS allows optional fields with undefined values)

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Every artifact entry has the two new fields
    Tool: Bash (node -e)
    Preconditions: artifacts.json updated
    Steps:
      1. node -e "const c = require('./src/data/artifacts.json'); const withDesc = c.filter(x => 'description' in x).length; const withVoice = c.filter(x => 'voiceover' in x).length; console.log('total=' + c.length + ' desc=' + withDesc + ' voice=' + withVoice);"
      2. Verify: total == desc == voice (all equal)
    Expected Result: counts match
    Evidence: .omo/evidence/task-5-counts.txt
  ```
  ```
  Scenario: Type extension is optional, doesn't break empty values
    Tool: Bash (npm run build)
    Preconditions: artifacts.ts updated
    Steps:
      1. npm run build
      2. Verify: exit 0, no errors about undefined.description or undefined.voiceover
    Expected Result: build clean
    Evidence: .omo/evidence/task-5-build.txt
  ```

  **Commit**: YES (groups with 1, 2, 3, 4, 6, 7)

- [x] 6. Modal a11y retrofit (focus mgmt, trap, return focus, `aria-describedby`, backdrop keyboard)

  **What to do**:
  - In `src/App.tsx` `ArtifactModal` component:
    - Add `useRef` to track the previously-focused element when modal opens. On open, save `document.activeElement`; on close, restore focus to it via `savedElement.focus()`.
    - On open, move focus to the close button (the first focusable element inside the modal). Use a `useRef` on the close button and call `.focus()` in a `useEffect([artifact])`.
    - Implement focus trap: on `Tab` keydown, find the first/last focusable elements inside the modal; if Shift+Tab on first, jump to last; if Tab on last, jump to first. Use raw keydown handler, NO focus-trap library.
    - Add a description element to the modal (using `artifact.description` from Task 5 if present, else a fallback "Artefak dari Museum Mpu Tantular"). Give it `id="artifact-modal-desc"`. Add `aria-describedby="artifact-modal-desc"` to the modal's `<div role="dialog">`.
    - On the backdrop `<div>`, change the click handler to also respond to `onKeyDown` (Enter or Space) to close, and add `tabIndex={-1}` so it's not in tab order, but add keyboard handler. Keep the existing `role="presentation"`. **OR** simpler: make backdrop a `<button>` with `aria-label="Tutup detail artefak"` that visually covers the backdrop area.
    - When modal opens, also call `announce("Membuka detail artefak: " + artifact.name)` (LiveAnnouncer from Task 4).
    - When modal closes, also call `announce("Menutup detail")`.
  - Resolve the existing LSP errors flagged by the project's a11y linter on the backdrop (line 585: "Static Elements should not be interactive") by converting the backdrop from `<div onClick>` to either `<button>` or `<div onClick onKeyDown>` with `role="button"` and `tabIndex={0}`.
  - Also verify the other existing a11y lint findings (the project linter flags `aria-label` on `<div>` elements at App.tsx:157, 194, 339 and TourViewer.tsx:191, 195, 197). For each, either move `aria-label` to a child element that supports it, or convert the parent to a `<section>` / `<aside>` with `aria-labelledby` instead. Document which approach was taken for each.

  **Must NOT do**:
  - No focus-trap-react / focus-trap library
  - No breaking change to the modal's visual design
  - No new dependencies

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: none
  - **Reason**: Focus management is tricky to get right; needs careful state coordination.

  **Parallelization**:
  - **Can Run In Parallel**: YES (only touches ArtifactModal inside App.tsx; other components are unchanged)
  - **Parallel Group**: Wave 1
  - **Blocks**: 9, 10, F1
  - **Blocked By**: 4 (LiveAnnouncer), 5 (description field)

  **References**:
  - **Pattern References**: `src/App.tsx:554–636` — entire `ArtifactModal` to retrofit; `src/App.tsx:566–577` — existing keyboard handler for Escape; `src/App.tsx:43–56` — existing state initialization pattern.
  - **API/Type References**: `useRef`, `useEffect`, `useCallback` (React 19 docs); `Element.focus()` (mdn).
  - **External References**: WAI-ARIA Authoring Practices — Modal Dialog pattern (focus management, focus trap).
  - **WHY**: Executor needs to understand the full existing modal before retrofitting; multiple sub-changes are interdependent.

  **Acceptance Criteria**:
  - [ ] `ArtifactModal` focuses the close button when opened
  - [ ] `Escape` closes the modal (existing behavior preserved)
  - [ ] `Tab` cycles within modal (focus trap works)
  - [ ] On close, focus returns to the element that opened the modal
  - [ ] Modal has `aria-describedby` pointing to a real element with text
  - [ ] Open modal → announce "Membuka detail artefak: X"
  - [ ] Close modal → announce "Menutup detail"
  - [ ] Backdrop closes on click AND on Enter/Space key (fixes existing a11y warning)
  - [ ] `npm run lint && npm run build` pass
  - [ ] The two existing LSP errors on the modal are resolved

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Focus moves into modal on open
    Tool: Bash (grep)
    Preconditions: ArtifactModal updated
    Steps:
      1. grep -n "closeButtonRef\|\.focus()" src/App.tsx
      2. Verify: a useRef for close button + .focus() call inside a useEffect
    Expected Result: focus management present
    Evidence: .omo/evidence/task-6-focus.txt
  ```
  ```
  Scenario: aria-describedby points to a real element
    Tool: Bash (grep)
    Preconditions: ArtifactModal updated
    Steps:
      1. grep -n "aria-describedby\|artifact-modal-desc" src/App.tsx
      2. Verify: both lines present, IDs match
    Expected Result: describedby wired
    Evidence: .omo/evidence/task-6-describedby.txt
  ```
  ```
  Scenario: Backdrop is keyboard-accessible
    Tool: Bash (grep)
    Preconditions: ArtifactModal updated
    Steps:
      1. Read src/App.tsx:585-590
      2. Verify: backdrop has onKeyDown handler (Enter/Space) OR is a <button>
    Expected Result: keyboard-accessible backdrop
    Evidence: .omo/evidence/task-6-backdrop.txt (screenshot or grep output)
  ```

  **Commit**: YES (groups with 1, 2, 3, 4, 5, 7)

- [ ] 7. `docs/audio-assets.md` uploader guide

  **What to do**:
  - Create `docs/audio-assets.md` with:
    - **Section 1: File naming** — `public/audio/ambient/gamelan.mp3` (single file, ~60s loop). Per artifact: `public/audio/voiceover/{artifact-slug}.mp3` where `{artifact-slug}` matches `artifacts.json.slug`.
    - **Section 2: Format** — MP3 only, 64kbps mono recommended, ≤80KB per file, total audio budget ≤2MB.
    - **Section 3: Loop requirements** — gamelan clip must have a clean loop (start/end match) OR user accepts a 1–2s crossfade (the hook will not auto-crossfade; recommend the user pre-render).
    - **Section 4: Voiceover** — per artifact, ~10–30s max, Indonesian language, match the artifact's `description` field semantically.
    - **Section 5: Ducking** — when voiceover plays, gamelan drops to 30% volume automatically. No user action needed.
    - **Section 6: Missing files** — if a file is missing, UI shows "Audio belum tersedia" or "Voiceover belum tersedia". No errors thrown.
    - **Section 7: How to update** — drop the file in the right path, reference it in `artifacts.json` `voiceover` field, no code change needed.
    - **Section 8: Copyright note** — user assumes rights for any uploaded audio.
  - Include a table of all current `artifacts.json` slugs as the expected filename target list.

  **Must NOT do**:
  - Don't include example audio files (only documentation)
  - Don't translate to English

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: none
  - **Reason**: Documentation only, no code.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: F1
  - **Blocked By**: None (but ideally after Task 5 to read slugs)

  **References**:
  - **External References**: `src/data/artifacts.json` (read at plan time to enumerate slugs).
  - **WHY**: Executor must enumerate current slugs to give the user a clear upload target.

  **Acceptance Criteria**:
  - [ ] `docs/audio-assets.md` exists
  - [ ] Documents file paths matching the code (`/audio/ambient/gamelan.mp3`, `/audio/voiceover/{slug}.mp3`)
  - [ ] Documents format (MP3, 64kbps mono, ≤80KB)
  - [ ] Includes table of current artifact slugs (count = current artifact count in `artifacts.json`)
  - [ ] No English content (Bahasa Indonesia + technical terms)

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Doc references correct file paths
    Tool: Bash (grep)
    Preconditions: docs/audio-assets.md written
    Steps:
      1. grep -n "ambient/gamelan\|voiceover/" docs/audio-assets.md
      2. Verify: paths match what the code expects
    Expected Result: paths match
    Evidence: .omo/evidence/task-7-paths.txt
  ```
  ```
  Scenario: Doc enumerates all current artifact slugs
    Tool: Bash (diff)
    Preconditions: artifacts.json + docs/audio-assets.md both exist
    Steps:
      1. node -e "const c = require('./src/data/artifacts.json'); console.log(c.map(x => x.slug).sort().join('\n'))" > /tmp/slugs.txt
      2. grep -oP "voiceover/[a-z0-9-]+\.mp3" docs/audio-assets.md | sed 's|voiceover/||; s|\.mp3||' | sort > /tmp/doc-slugs.txt
      3. diff /tmp/slugs.txt /tmp/doc-slugs.txt
      4. Verify: no diff (or acceptable diffs if doc shows only examples)
    Expected Result: slugs align
    Evidence: .omo/evidence/task-7-slugs.txt
  ```

  **Commit**: YES (groups with 1, 2, 3, 4, 5, 6)

- [ ] 8. `AccessibilityWidget` — floating popover (contrast, text size, music)

  **What to do**:
  - Create `src/components/AccessibilityWidget.tsx` exporting a default component.
  - Structure: a floating button (bottom-right, fixed position) with an a11y icon (use `lucide-react`'s `Accessibility` or `Settings2`). On click, opens a popover with three controls:
    1. **Kontras**: a toggle button "Aktif / Nonaktif". Indonesian label.
    2. **Ukuran teks**: three buttons "Default / Besar / Sangat Besar" (one active at a time).
    3. **Musik latar**: a toggle button "Aktif / Nonaktif". Indonesian label.
    4. **Reset**: a small "Atur ulang" link at the bottom.
  - State via `useA11yPrefs()` from Task 3. Music toggle controls the third state in the hook (`musicEnabled`).
  - Each toggle triggers an `announce()` call to LiveAnnouncer: "Kontras tinggi aktif", "Kontras tinggi nonaktif", "Ukuran teks diperbesar", etc.
  - Popover must be keyboard-accessible: button is `<button>`, popover uses `role="dialog"` (small dialog, not full modal — no focus trap, but Esc closes).
  - Style: append to `global.css` under `.a11y-widget`, `.a11y-widget-button`, `.a11y-widget-popover`. Use existing design tokens (paper, ink, saffron accent).
  - High-contrast override: in `[data-contrast="high"]` scope, the widget button gets a 2px white border so it stays visible against any background.
  - Mount in `src/App.tsx` as a child of `<main>`, after `<LiveAnnouncer />`.

  **Must NOT do**:
  - No "settings page" or full-page modal
  - No localStorage in the widget itself (delegate to useA11yPrefs)
  - No new dependencies

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: none (but consider `frontend-design` for visual polish)
  - **Reason**: UI design matters here — popover placement, contrast across themes, button states, animations on toggle.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: F1, F2
  - **Blocked By**: 2 (CSS), 3 (useA11yPrefs), 4 (LiveAnnouncer)

  **References**:
  - **Pattern References**: `src/App.tsx:107–153` — existing `MobileTabBar` as a reference for a floating UI element with state; `src/styles/global.css:7–35` — design tokens.
  - **API/Type References**: `useA11yPrefs` from Task 3; `useLiveAnnouncer` from Task 4.

  **Acceptance Criteria**:
  - [ ] `AccessibilityWidget.tsx` exists, exports default
  - [ ] Floating button visible bottom-right on all pages (sticky/fixed position)
  - [ ] Popover opens on click AND on Enter/Space
  - [ ] Three controls present (Kontras, Ukuran teks, Musik latar) + Reset
  - [ ] Each toggle persists to localStorage and applies immediately
  - [ ] Each toggle announces its state change via LiveAnnouncer
  - [ ] Esc closes popover
  - [ ] High-contrast theme shows widget with white border
  - [ ] `npm run lint && npm run build` pass

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Widget is mounted and floating
    Tool: Bash (grep)
    Preconditions: App.tsx updated
    Steps:
      1. grep -n "AccessibilityWidget" src/App.tsx
      2. Verify: <AccessibilityWidget /> mounted inside <main>
    Expected Result: mounted
    Evidence: .omo/evidence/task-8-mounted.txt
  ```
  ```
  Scenario: Widget controls wire to useA11yPrefs
    Tool: Bash (grep)
    Preconditions: AccessibilityWidget.tsx written
    Steps:
      1. grep -n "setContrast\|setTextSize\|setMusicEnabled\|reset" src/components/AccessibilityWidget.tsx
      2. Verify: all four setters used
    Expected Result: wired
    Evidence: .omo/evidence/task-8-wired.txt
  ```
  ```
  Scenario: Popover is keyboard accessible
    Tool: Bash (grep)
    Preconditions: AccessibilityWidget.tsx written
    Steps:
      1. grep -n 'role="dialog"\|onKeyDown\|Escape' src/components/AccessibilityWidget.tsx
      2. Verify: dialog role + Escape handler
    Expected Result: keyboard accessible
    Evidence: .omo/evidence/task-8-keyboard.txt
  ```

  **Commit**: YES (groups with 9, 10, 11, 12)

- [ ] 9. Music toggle in `TourViewer` (gamelan + stereo pan + ducking)

  **What to do**:
  - In `src/components/TourViewer.tsx`:
    - Add a music toggle button to the existing `viewer-toolbar` (replacing or augmenting the existing `aria-hidden` Volume2 icon). The toolbar is `aria-label="Alat viewer tur"`. Add the new button as a real `<button>` with `aria-label="Musik latar"`, `aria-pressed` reflecting state, and an icon (use `Volume2` or `VolumeX` from `lucide-react`).
    - Use `useA11yPrefs()` to read `musicEnabled` state; call `setMusicEnabled(true/false)` on toggle.
    - Use `useAudioPlayer({ src: '/audio/ambient/gamelan.mp3', loop: true, volume: 0.5 })` for the music instance.
    - When `musicEnabled` becomes true: `play()`. When false: `pause()`. On unmount or `museum.id` change: `stop()`.
    - Add a Web Audio graph: `AudioContext → GainNode (master) → StereoPannerNode → destination`. On the music's `audio` element, connect `sourceNode → GainNode (music) → StereoPannerNode → master`. The pan value updates as the viewer rotates: read `viewer.getPosition()` (yaw), compute `pan = clamp(yaw / 180, -1, 1)`, set `panner.pan.value = pan`. Subscribe to `viewer.on('position-updated', ...)` already wired at line 142.
    - When voiceover plays (Task 10), duck music: set `gain.gain.value` to 0.15 (30% of 0.5). When voiceover stops, restore to 0.5. Coordinate via a shared context (module-level event emitter, or pass a ref). Simpler: when voiceover starts, call a `duck()` method on the music instance; when voiceover ends, call `unDuck()`. Use a small `audioManager` module-level helper to coordinate.
  - Replace the existing `aria-hidden` `Volume2` icon in the bottom `viewer-controls` div — leave that div as-is for sighted users (it's a cheat sheet of icons), or remove the Volume2 line since the toggle is now in the toolbar.
  - Add `document.visibilitychange` handler: pause music when tab hidden, resume when visible. Cleanup on unmount.

  **Must NOT do**:
  - No mutating PSV's internal Three.js objects
  - No new dependencies
  - No autoplay (toggle is OFF by default, music starts only when user clicks)
  - No useReducer

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: none
  - **Reason**: Web Audio graph + PSV integration + ducking coordination is multi-step.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: F1, F3
  - **Blocked By**: 1 (useAudioPlayer), 2 (CSS), 4 (LiveAnnouncer), 6 (modal retrofit for announce pattern reuse)

  **References**:
  - **Pattern References**: `src/components/TourViewer.tsx:140–143` — existing PSV event subscriptions; `src/components/TourViewer.tsx:191` — existing toolbar.
  - **API/Type References**: `viewer.getPosition()` returns `{ yaw, pitch }`; `viewer.on('position-updated', cb)` is the event (already in use at line 142). Web Audio: `StereoPannerNode.pan` is a `AudioParam` with range [-1, 1].
  - **External References**: MDN `StereoPannerNode`, MDN `AudioContext.createMediaElementSource`.
  - **WHY**: Executor must coordinate with PSV's existing event listeners and not double-subscribe.

  **Acceptance Criteria**:
  - [ ] Music toggle button in `viewer-toolbar`
  - [ ] Toggle state mirrors `musicEnabled` from useA11yPrefs
  - [ ] Music plays on toggle ON, pauses on OFF
  - [ ] Music loops (or restarts on end)
  - [ ] Stereo pan updates as viewer rotates (visible in pan value)
  - [ ] When voiceover plays (Task 10), music ducks to ~30%
  - [ ] On tab hide → music pauses; on tab show → resumes (if user has it enabled)
  - [ ] On `museum.id` change → music continues (it's ambient, scene-independent)
  - [ ] Missing gamelan file → toggle still works, shows "Audio belum tersedia" in console (no throw)
  - [ ] `npm run lint && npm run build` pass

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Music toggle is a real button (not aria-hidden)
    Tool: Bash (grep)
    Preconditions: TourViewer.tsx updated
    Steps:
      1. grep -n "musik latar\|musicEnabled\|Musik latar" src/components/TourViewer.tsx
      2. Verify: button with aria-label and aria-pressed
    Expected Result: real button
    Evidence: .omo/evidence/task-9-button.txt
  ```
  ```
  Scenario: Stereo pan updates on viewer rotation
    Tool: Bash (grep)
    Preconditions: TourViewer.tsx updated
    Steps:
      1. grep -n "StereoPannerNode\|panner.pan\|position-updated" src/components/TourViewer.tsx
      2. Verify: pan node created, pan value updated in the position-updated handler
    Expected Result: pan wired
    Evidence: .omo/evidence/task-9-pan.txt
  ```
  ```
  Scenario: Document visibilitychange pauses music
    Tool: Bash (grep)
    Preconditions: TourViewer.tsx updated
    Steps:
      1. grep -n "visibilitychange" src/components/TourViewer.tsx
      2. Verify: handler registered
    Expected Result: registered
    Evidence: .omo/evidence/task-9-visibility.txt
  ```

  **Commit**: YES (groups with 8, 10, 11, 12)

- [ ] 10. `ArtifactVoiceover` component + rich description in `ArtifactModal`

  **What to do**:
  - Create `src/components/ArtifactVoiceover.tsx`: minimal audio player that accepts `{ src: string | undefined, title: string }` props. Renders a `<button>` "Putar voiceover" / "Jeda voiceover" and a small progress bar. If `src` is empty/missing, render "Voiceover belum tersedia" instead of the button. Uses `useAudioPlayer` from Task 1.
  - In `src/App.tsx` `ArtifactModal`:
    - If `artifact.voiceover` is non-empty, render `<ArtifactVoiceover src={artifact.voiceover} title={artifact.name} />` near the top of the modal body.
    - If `artifact.description` is non-empty, render it as a `<p className="artifact-modal-description">` element (used as the `aria-describedby` target from Task 6).
    - When voiceover starts playing, signal the music instance to duck (coordination with Task 9). Use the same shared `audioManager` helper.
    - On modal close, ensure voiceover stops (cleanup in `useEffect`).
  - **Indo labels**: "Putar voiceover", "Jeda voiceover", "Voiceover belum tersedia", "Deskripsi artefak".

  **Must NOT do**:
  - No autoplay
  - No new dependencies

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: none
  - **Reason**: Mostly wire-up; the rich description text comes from user data (Task 5).

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: F1, F3
  - **Blocked By**: 1 (useAudioPlayer), 2 (CSS), 4 (LiveAnnouncer), 5 (description + voiceover fields), 6 (modal retrofit)

  **References**:
  - **Pattern References**: `src/App.tsx:584–636` — existing `ArtifactModal` to extend.
  - **API/Type References**: `Artifact.description`, `Artifact.voiceover` (Task 5).

  **Acceptance Criteria**:
  - [ ] `ArtifactVoiceover.tsx` exists
  - [ ] When `artifact.voiceover` is empty/missing, shows "Voiceover belum tersedia" text
  - [ ] When present, shows Play/Pause button (Indonesian labels)
  - [ ] Voiceover stops on modal close
  - [ ] Voiceover ducks music to ~30% (if music is playing)
  - [ ] `artifact.description` rendered as a `<p>` and is the `aria-describedby` target
  - [ ] `npm run lint && npm run build` pass

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Voiceover is rendered conditionally
    Tool: Bash (grep)
    Preconditions: App.tsx updated
    Steps:
      1. grep -n "ArtifactVoiceover\|artifact.voiceover" src/App.tsx
      2. Verify: conditional render
    Expected Result: conditional
    Evidence: .omo/evidence/task-10-conditional.txt
  ```
  ```
  Scenario: Description is rendered as describedby target
    Tool: Bash (grep)
    Preconditions: App.tsx updated
    Steps:
      1. grep -n "artifact-modal-description\|artifact.description" src/App.tsx
      2. Verify: <p> with id and artifact.description content
    Expected Result: describedby wired
    Evidence: .omo/evidence/task-10-description.txt
  ```
  ```
  Scenario: Voiceover stops on modal close
    Tool: Bash (grep)
    Preconditions: App.tsx updated
    Steps:
      1. grep -n "voiceover.*stop\|onClose.*voiceover\|useEffect.*cleanup" src/App.tsx
      2. Verify: cleanup stops audio
    Expected Result: cleanup present
    Evidence: .omo/evidence/task-10-cleanup.txt
  ```

  **Commit**: YES (groups with 8, 9, 11, 12)

- [ ] 11. Keyboard rotation in `TourViewer` (arrows, +/-, Home, ±85° clamp)

  **What to do**:
  - In `src/components/TourViewer.tsx`:
    - Add a `useEffect` that registers a `keydown` listener on the `.panorama-stage` div (use `stageRef.current`). Listener only fires when the focus is INSIDE the viewer area (not in the document body); check `e.target` is the stage or its descendants.
    - Map keys:
      - `ArrowLeft` → rotate yaw -10°
      - `ArrowRight` → rotate yaw +10°
      - `ArrowUp` → pitch -10° (look up, towards zenith) — **clarify with viewer's natural direction; test**
      - `ArrowDown` → pitch +10°
      - `+` / `=` → zoom in
      - `-` / `_` → zoom out
      - `Home` → reset to initial yaw/pitch (use the viewer's stored initial position)
    - Use `viewer.animate({ yaw, pitch, zoom, speed })` from PSV. The `speed` field is the animation duration in ms; if `prefers-reduced-motion`, set `speed: 0` (instant) or skip animate entirely and use `viewer.setOption` / direct setter.
    - Read `viewer.getPosition()` to get current yaw/pitch, add delta, clamp pitch to `[-85, 85]` (avoid gimbal flip at ±90), then call `viewer.animate({ yaw: newYaw, pitch: clampedPitch, speed: 100 })`.
    - Add `tabIndex={0}` and `aria-label="Viewer panorama 360 (gunakan tombol panah untuk memutar)"` to the stage div so it's focusable.
    - When the stage div receives focus, set a `data-keyboard-active="true"` attribute (or just rely on `:focus-visible` CSS) so focus is visible.
    - Add a small instructional `<p>` (visually hidden, but in DOM for SR) inside the stage div: "Gunakan tombol panah untuk memutar, +/- untuk zoom, Home untuk reset."

  **Must NOT do**:
  - No breaking changes to the existing mouse/touch interaction
  - No new dependencies
  - No mutating PSV internals (only documented methods)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: none
  - **Reason**: PSV API integration + reduced-motion handling is non-trivial.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: F1, F3
  - **Blocked By**: 2 (CSS for focus), 4 (LiveAnnouncer — for keyboard hint announcement)

  **References**:
  - **Pattern References**: `src/components/TourViewer.tsx:30` — existing `viewerRef`; `src/components/TourViewer.tsx:50–157` — existing viewer init and effect cleanup pattern.
  - **API/Type References**: `@photo-sphere-viewer/core` — `Viewer.animate(options)`, `Viewer.getPosition()`, `Viewer.setOption()`. The `animate` method accepts `{ yaw, pitch, zoom, speed }` where `speed` is animation duration in ms.
  - **External References**: `prefers-reduced-motion` media query (mdn); PSV docs for animate options.
  - **WHY**: Executor needs to verify exact PSV API signature against the installed version.

  **Acceptance Criteria**:
  - [ ] `.panorama-stage` is focusable (`tabIndex={0}`) with `aria-label`
  - [ ] Arrow keys rotate yaw/pitch (each press = 10° delta)
  - [ ] Pitch clamped to ±85° (cannot reach ±90°)
  - [ ] `+` / `-` zoom
  - [ ] `Home` resets to initial position
  - [ ] Respects `prefers-reduced-motion` (instant, no smooth animate)
  - [ ] Visually hidden keyboard hint in DOM for SR
  - [ ] Does not conflict with mouse/touch drag
  - [ ] `npm run lint && npm run build` pass

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Keydown listener registered on stage
    Tool: Bash (grep)
    Preconditions: TourViewer.tsx updated
    Steps:
      1. grep -n "keydown\|onKeyDown\|stageRef.current" src/components/TourViewer.tsx
      2. Verify: addEventListener('keydown', ...) on stageRef
    Expected Result: listener registered
    Evidence: .omo/evidence/task-11-listener.txt
  ```
  ```
  Scenario: Pitch clamp at ±85°
    Tool: Bash (grep)
    Preconditions: TourViewer.tsx updated
    Steps:
      1. grep -n "Math.max\|Math.min\|85" src/components/TourViewer.tsx
      2. Verify: clamp to [-85, 85]
    Expected Result: clamp present
    Evidence: .omo/evidence/task-11-clamp.txt
  ```
  ```
  Scenario: Reduced-motion preference respected
    Tool: Bash (grep)
    Preconditions: TourViewer.tsx updated
    Steps:
      1. grep -n "prefers-reduced-motion\|matchMedia" src/components/TourViewer.tsx
      2. Verify: check + speed=0 or skip
    Expected Result: respect present
    Evidence: .omo/evidence/task-11-reduced-motion.txt
  ```

  **Commit**: YES (groups with 8, 9, 10, 12)

- [ ] 12. `CatalogSection` — text catalog grouped by category, `<details>`, h3/h4

  **What to do**:
  - Create `src/components/CatalogSection.tsx` exporting a default component.
  - Structure:
    - `<section id="katalog" className="catalog-section section-pad">`
    - Heading `<h2>Katalog <span className="brush">Aksesibilitas</span></h2>` and intro `<p>Jelajahi semua koleksi museum dalam bentuk teks. Cocok untuk pembaca layar atau navigasi cepat.</p>`
    - For each of the 4 categories (Gerbang Masuk, Orientasi Rute, Jalur Galeri, Galeri Atas):
      - `<h3 className="catalog-category-title">{category}</h3>`
      - For each scene in that category:
        - `<details className="catalog-scene">` with `<summary className="catalog-scene-summary">` (contains the scene's `highlight`)
        - Inside details: scene `description` paragraph + a `<ul>` of artifacts (each is a `<button>` that calls `onArtifactSelect(artifact)`)
        - Each artifact button: `aria-label={\`Buka detail artefak ${artifact.name}\`}`. If `artifact.voiceover` is present, show a small "▶ Voiceover" indicator. If `artifact.photos[0]`, show a small thumbnail.
  - Component receives `museums`, `artifactsByScene`, and `onArtifactSelect` as props (from App.tsx).
  - Mount in `src/App.tsx` between `TourSection` and `AudienceSection`. Add to `navItems` and `mobileTabs` so it's reachable.
  - Add a "Katalog" entry to the navigation: `navItems.push({ label: 'Katalog', href: '#katalog' })` and `mobileTabs.push({ id: 'katalog', label: 'Katalog', icon: BookOpen })`.
  - Add CSS to `global.css` for `.catalog-section`, `.catalog-category-title`, `.catalog-scene`, `.catalog-scene-summary`, `.catalog-scene-artifacts`, `.catalog-artifact-button`, `.catalog-voiceover-indicator`. Follow existing design tokens (paper, ink, brush).

  **Must NOT do**:
  - No search box
  - No filter UI
  - No lightbox for artifact photos
  - No new dependencies
  - No breaking changes to existing sections

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: none
  - **Reason**: Layout + heading hierarchy + visual grouping matters.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: F1, F3
  - **Blocked By**: 2 (CSS), 4 (LiveAnnouncer), 5 (description/voiceover fields)

  **References**:
  - **Pattern References**: `src/App.tsx:282–451` — existing `TourSection` for the data flow + grouping pattern; `src/App.tsx:26–38` — `navItems` + `mobileTabs` to update.
  - **API/Type References**: `Museum` (museums.ts:1–13), `Artifact` (artifacts.ts:3–12), `artifactsByScene` (artifacts.ts:62–69).
  - **External References**: HTML `<details>` / `<summary>` element (mdn).
  - **WHY**: Executor must mirror the existing category grouping + onClick pattern.

  **Acceptance Criteria**:
  - [ ] `CatalogSection.tsx` exists, exports default
  - [ ] All 23 scenes present in the catalog
  - [ ] All 4 categories present in correct order
  - [ ] Each scene is a `<details>` collapsed by default
  - [ ] Each artifact is a button that opens the modal
  - [ ] Heading hierarchy: h1 (page) → h2 (catalog) → h3 (category) → h4 (scene via summary or h3 depending on render) → h5 or no heading for artifact (button has aria-label)
  - [ ] "Katalog" added to `navItems` and `mobileTabs`
  - [ ] `npm run lint && npm run build` pass
  - [ ] No regression: existing 5 sections still render and work

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: All 23 scenes are present in catalog
    Tool: Bash (node -e)
    Preconditions: CatalogSection.tsx written
    Steps:
      1. grep -c "catalog-scene" src/components/CatalogSection.tsx
      2. node -e "const { museums } = require('./src/data/museums.ts'); console.log(museums.length);" — wait, .ts is not require-able; use:
      3. grep -c "id: \`mpu-" src/data/museums.ts
      4. Verify: counts match (museums.length == 23)
    Expected Result: counts match
    Evidence: .omo/evidence/task-12-count.txt
  ```
  ```
  Scenario: Section is mounted and reachable from nav
    Tool: Bash (grep)
    Preconditions: App.tsx updated
    Steps:
      1. grep -n "id=\"katalog\"\|Katalog" src/App.tsx
      2. Verify: <section id="katalog"> present, navItems has Katalog, mobileTabs has Katalog
    Expected Result: mounted + reachable
    Evidence: .omo/evidence/task-12-nav.txt
  ```
  ```
  Scenario: Heading hierarchy is sequential (no skipped levels)
    Tool: Bash (grep)
    Preconditions: CatalogSection.tsx written
    Steps:
      1. grep -n "<h2\|<h3\|<h4\|<h5" src/components/CatalogSection.tsx
      2. Verify: h2 (section) → h3 (category) → no h5/h6 skip
    Expected Result: sequential
    Evidence: .omo/evidence/task-12-headings.txt
  ```

  **Commit**: YES (groups with 8, 9, 10, 11)

- [ ] 13. Manual a11y audit + fixes (Playwright + axe-core + keyboard tests)

  **What to do**:
  - Start dev server: `npm run dev` (binds 0.0.0.0:5173).
  - Use Playwright (built-in skill) to:
    1. Open `http://localhost:5173/`.
    2. Tab from URL bar → verify skip link appears → Enter → focus moves to `<main>`.
    3. Tab through all sections; capture screenshot of focus ring on each section's first button.
    4. Tab into the TourViewer stage → press Arrow keys → verify viewer rotates → press `+` / `-` → verify zoom → press `Home` → verify reset.
    5. Hold ArrowUp for many presses → verify pitch does not exceed 85° (clamp visible).
    6. Click any scene pill → verify scene changes → verify LiveAnnouncer text changes (use `page.evaluate(() => document.querySelector('.live-announcer').textContent)`).
    7. Click any artifact card → modal opens → focus on close button → Tab cycles within modal → Esc closes → focus returns to trigger.
    8. Toggle high contrast → verify `data-contrast="high"` on `<html>` → verify visual change (screenshot).
    9. Toggle text size to "Sangat Besar" → verify `data-text-size="xl"` on `<html>` → verify Hero section text grows but no horizontal scroll.
    10. Toggle music → verify button aria-pressed → rotate viewer → verify pan shifts (read `panner.pan.value` via `page.evaluate`).
    11. Toggle prefers-reduced-motion in browser → press arrow keys → verify instant rotation, no smooth animate.
    12. Reload page after toggling high contrast + text size → verify both persist.
    13. Open catalog section → expand a `<details>` → click an artifact button → modal opens → click play on voiceover (if file present; else verify "Voiceover belum tersedia" text).
  - Run axe-core via `npx -y @axe-core/cli http://localhost:5173 --exit` (or use Playwright's `@axe-core/playwright` if available). Capture findings. Fix any critical/serious issues found.
  - The project-specific a11y linter (the one that flags `aria-label` on `<div>` and the empty `<title>`) should be run as part of this audit. If it's a separate ESLint rule, run `npm run lint`; if it's a CLI tool, run it via `npm run dev` and the editor. Fix any remaining issues from earlier waves.
  - Document all findings + fixes in `.omo/evidence/task-13-audit.md`.

  **Must NOT do**:
  - No new npm dependencies for axe-core (use `npx -y` for ad-hoc run; or skip axe and rely on Playwright + manual checklist)
  - No fixing things outside the scope of this plan (e.g., don't refactor unrelated code)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `playwright` (required for browser automation)
  - **Reason**: Multi-step browser automation + a11y checks requires domain knowledge.

  **Parallelization**:
  - **Can Run In Parallel**: NO (must run after Wave 2 to verify the integrated system)
  - **Parallel Group**: Wave 3 (sole task in this wave, but Wave 2 must complete first)
  - **Blocks**: F1, F2, F3
  - **Blocked By**: 6, 8, 9, 10, 11, 12

  **References**:
  - **External References**: Playwright docs (built-in skill); axe-core CLI.
  - **WHY**: Executor needs to follow the manual a11y checklist from the Verification Strategy section; this task IS that checklist.

  **Acceptance Criteria**:
  - [ ] Dev server started successfully
  - [ ] All 13 Playwright scenarios in the "What to do" pass
  - [ ] Evidence files in `.omo/evidence/task-13-*.png` and `.omo/evidence/task-13-audit.md`
  - [ ] Any critical/serious axe findings are fixed (or documented as deferred with rationale)
  - [ ] Any remaining project-a11y-lint findings from earlier waves are fixed
  - [ ] No new dependencies added

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: Keyboard Tab order reaches skip link first
    Tool: Playwright (built-in)
    Preconditions: dev server running
    Steps:
      1. open http://localhost:5173/
      2. press Tab once
      3. assert visible text contains "Lewati"
    Expected Result: skip link visible and focusable
    Evidence: .omo/evidence/task-13-skiplink.png
  ```
  ```
  Scenario: Pitch clamp at ±85°
    Tool: Playwright
    Preconditions: dev server running, focus on stage
    Steps:
      1. open http://localhost:5173/#tour-tour
      2. focus .panorama-stage
      3. press ArrowUp 20 times rapidly
      4. evaluate viewer.getPosition().pitch → should be ≤ 85
    Expected Result: pitch ≤ 85
    Evidence: .omo/evidence/task-13-pitch-clamp.png
  ```
  ```
  Scenario: LiveAnnouncer announces scene change
    Tool: Playwright
    Preconditions: dev server running
    Steps:
      1. open http://localhost:5173/#tour-tour
      2. click any scene pill
      3. wait 500ms
      4. evaluate document.querySelector('.live-announcer').textContent
      5. assert text starts with "Berpindah ke"
    Expected Result: announce fired
    Evidence: .omo/evidence/task-13-announce.png
  ```
  ```
  Scenario: High contrast toggles apply to <html>
    Tool: Playwright
    Preconditions: dev server running
    Steps:
      1. open http://localhost:5173/
      2. click the high-contrast toggle in the widget
      3. evaluate document.documentElement.dataset.contrast
      4. assert == "high"
    Expected Result: dataset applied
    Evidence: .omo/evidence/task-13-contrast.png
  ```

  **Commit**: YES (separate from Wave 2 — `chore(a11y): manual a11y audit fixes`)

- [ ] 14. Visual polish + accessibility-tree snapshots to evidence

  **What to do**:
  - After Task 13's fixes, do a final visual pass:
    1. Take a full-page screenshot in default theme (light) → save to `.omo/evidence/final-qa/page-default.png`.
    2. Toggle high contrast → screenshot → save to `.omo/evidence/final-qa/page-high-contrast.png`.
    3. Toggle text size XL → screenshot → save to `.omo/evidence/final-qa/page-xl-text.png`.
    4. Open catalog section → screenshot → save to `.omo/evidence/final-qa/catalog.png`.
    5. Open artifact modal with voiceover (if any file present) → screenshot → save to `.omo/evidence/final-qa/modal.png`.
    6. Open accessibility widget popover → screenshot → save to `.omo/evidence/final-qa/widget.png`.
  - Capture the accessibility tree (using Playwright's `page.accessibility.snapshot()`) for the main page and save to `.omo/evidence/final-qa/a11y-tree.json` for F2 review.
  - Polish any visual regressions: text overflow, button states, focus rings, contrast in popover.

  **Must NOT do**:
  - No scope creep (don't redesign anything)
  - No new dependencies

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `playwright` (for screenshots + a11y tree)
  - **Reason**: Mostly capture + minor polish.

  **Parallelization**:
  - **Can Run In Parallel**: NO (must run after Task 13)
  - **Parallel Group**: Wave 3 (sole task in this wave)
  - **Blocks**: F1, F2, F3
  - **Blocked By**: 13

  **References**:
  - **External References**: Playwright `page.screenshot`, `page.accessibility.snapshot()`.

  **Acceptance Criteria**:
  - [ ] All 6 screenshots saved to `.omo/evidence/final-qa/`
  - [ ] Accessibility tree JSON saved
  - [ ] No visual regressions (compare default theme to pre-work state via diff screenshot)
  - [ ] `npm run lint && npm run build` still pass

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: All final screenshots present
    Tool: Bash (ls)
    Preconditions: task 14 complete
    Steps:
      1. ls .omo/evidence/final-qa/
      2. Verify: 6 .png + 1 a11y-tree.json present
    Expected Result: 7 files
    Evidence: .omo/evidence/task-14-screenshots.txt
  ```

  **Commit**: YES (separate — `chore(a11y): visual polish + final screenshots`)

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read this plan end-to-end. For each "Must Have": verify implementation exists (read file, run `npm run build`, manual check). For each "Must NOT Have": grep codebase for forbidden patterns (`react-router`, `useReducer`, `@ts-ignore`, `as any`, `console.log`, `focus-trap`, etc.) — reject with file:line if found. Check evidence files exist in `.omo/evidence/` for every task that requires Playwright/capture. Compare deliverables against the plan's "Concrete Deliverables" list.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run lint && npm run build` (both MUST pass). Review all changed files for: `as any` / `@ts-ignore`, empty catches, `console.log` in prod, commented-out code, unused imports (strict TS will catch). Run the **Manual A11y Checklist** from the Verification Strategy section above; each item is a sub-check. Check AI slop: excessive comments, over-abstraction, generic names. Verify `npm run build` produces no warnings about `noUnusedLocals` / `noUnusedParameters`.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | A11y [N/N] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ playwright skill)
  Start from clean state: `rm -rf dist && npm run dev`. Open `http://localhost:5173/`. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence (screenshots, terminal output, axe report if `npx @axe-core/cli` is available without install). Test cross-task integration: music + voiceover (ducking), high contrast + modal (cascade), text scale 125% + catalog (no overflow). Test edge cases: missing audio files (must show "Audio belum tersedia", not throw), high contrast toggled mid-modal, pitch at poles (must clamp). Save evidence to `.omo/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (`git log --oneline -20` + `git diff HEAD~N --stat`). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance for every task. Detect cross-task contamination (e.g., Task 8 touching Task 9's files). Flag unaccounted changes (`git status` should show only files this plan authorized). Run `git diff --stat main..HEAD` to confirm no accidental modifications to `src/data/museums.ts` (scene order must be unchanged — user does that).
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | sceneAssets [UNCHANGED] | VERDICT`

> **Do NOT auto-proceed after F1–F4. Wait for user's explicit approval before marking work complete.**
> **Never mark F1–F4 as checked before getting user's okay.** Rejection or user feedback → fix → re-run → present again → wait for okay.

---

## Commit Strategy

Suggested commit messages (one per Wave 1 / Wave 2 / Wave 3 + one per final):

1. `feat(a11y): add audio hook, skip link, live announcer, a11y prefs hook, modal focus management, type extensions, audio uploader guide` (Wave 1)
2. `feat(a11y): add accessibility widget, music toggle with stereo pan, voiceover, keyboard rotation, catalog section` (Wave 2)
3. `chore(a11y): manual a11y audit fixes, visual polish, evidence snapshots` (Wave 3)

Each commit runs `npm run lint && npm run build` as a pre-commit gate.

---

## Success Criteria

### Verification Commands
```bash
npm run lint   # Expected: 0 errors, 0 warnings
npm run build  # Expected: build completes, dist/ produced
```

### Final Checklist
- [ ] All 14 tasks + 4 final-wave tasks completed
- [ ] All "Must Have" present and verified
- [ ] All "Must NOT Have" absent (grep verified)
- [ ] `npm run lint && npm run build` clean
- [ ] Manual a11y checklist 13/13 pass
- [ ] Code mergeable with empty `public/audio/` (only `.gitkeep`)
- [ ] `docs/audio-assets.md` exists with correct file paths
- [ ] `src/data/museums.ts` `sceneAssets` array UNCHANGED (reorder is user's job)
- [ ] All evidence files in `.omo/evidence/` and `.omo/evidence/final-qa/`
- [ ] User approves F1–F4 verdicts

---

## How to Self-Reorder Rooms (Documentation for User)

When the user is ready to fix the room order, they need to touch **two** structures in `src/data/museums.ts`:

### 1. `sceneAssets` array (lines 24–48)
This is the linear order. Reorder the `[id, label, filename, description]` entries; the `prev/next` buttons, the category grouping, the scene pills, and the catalog all derive from this array order.

### 2. `routeHotspots` graph (lines 66–104)
This is the directional graph. The `targetId` field on every hotspot must point to the new position's `id` after reorder. Specifically:
- Each scene's hotspots point to other scene ids (e.g., `mpu-2`, `mpu-3-ke-kanan`).
- The auto-generated "Kembali" hotspot on each scene (line 119) uses `sceneAssets[index - 1][0]`, so it follows the array reorder automatically.
- **The manual hotspots inside `routeHotspots` do NOT auto-update** — they must be re-pointed to match the new physical flow.

### Recommended Workflow
1. Sketch the new route on paper (or in any text tool).
2. Reorder `sceneAssets` first.
3. Re-point each `routeHotspots[*].targetId` to match.
4. Run `npm run lint && npm run build` — both must pass.
5. Open `npm run dev` and walk the route to verify hotspots are physically correct.
6. Commit.

### Why this can't be done by AI without visual input
The reordering is inherently a **spatial / curatorial decision** — which order tells the museum's story best. AI can suggest orderings from filenames (e.g., "ke-kanan" means "to the right"), but the museum's curatorial intent requires human judgment that the user is the right person to make.
