# PROJECT KNOWLEDGE BASE

**Generated:** 2025-01-XX
**Commit:** 7046316
**Branch:** main

## OVERVIEW
Single-museum 360° tour SPA: Vite + React 19 + TypeScript, glassmorphism UI, panoramas via `@photo-sphere-viewer/core` (Three.js). Content: **Museum Mpu Tantular** only (23 scenes). Copy: **Bahasa Indonesia** — keep it that way.

## STRUCTURE
```
museum-mpu-tantular/
├── src/
│   ├── App.tsx              # Monolithic: all sections + modal + nav (832 lines, intentional)
│   ├── main.tsx             # React root mount
│   ├── components/          # Only TourViewer is non-trivial (453 lines)
│   ├── data/                # museums.ts (scene graph), artifacts.ts + .json
│   ├── hooks/               # Accessibility: audio, TTS, a11y prefs, live announcer
│   └── styles/global.css    # Single ~21KB stylesheet, design tokens in CSS vars
├── public/
│   ├── panoramas/           # 23 equirectangular (4096×2048)
│   ├── images/              # Route thumbnails
│   ├── artefek/             # Artifact photos/cards (Indonesian naming)
│   └── audio/               # Background music, voiceovers
└── docs/                    # Design refs, implementation plan, asset contract
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add/edit scene | `src/data/museums.ts` + `public/panoramas/` + `public/images/` | Three files must sync |
| Edit 360° viewer | `src/components/TourViewer.tsx` | Wraps photo-sphere-viewer, imperative hotspot positioning |
| Add artifact | `src/data/artifacts.json` + `public/artefak/` | JSON is raw data, TS transforms it |
| Accessibility features | `src/hooks/` + `src/components/AccessibilityWidget.tsx` | Screen reader, TTS, audio player |
| UI strings/content | `src/data/museums.ts`, `src/App.tsx` | Indonesian only |
| Design tokens | `src/styles/global.css` | CSS custom properties (warm ivory, smoked umber, amber) |

## CODE MAP
| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `App` | Function | `src/App.tsx:56` | Root component, state-driven page switching (no router) |
| `TourViewer` | Function | `src/components/TourViewer.tsx:34` | 360° panorama viewer with hotspot navigation |
| `museums` | Array | `src/data/museums.ts:122` | All 23 scenes with hotspot graph |
| `artifacts` | Array | `src/data/artifacts.ts` | Artifact catalog (from JSON) with scene index |
| `useA11yPrefs` | Hook | `src/hooks/useA11yPrefs.ts` | Accessibility preferences (font size, contrast) |
| `useTextToSpeech` | Hook | `src/hooks/useTextToSpeech.ts` | TTS for artifact descriptions |
| `useAudioPlayer` | Hook | `src/hooks/useAudioPlayer.ts` | Background music + voiceover playback |
| `useLiveAnnouncer` | Hook | `src/hooks/useLiveAnnouncer.ts` | Screen reader announcements |

## CONVENTIONS
- **Strict TS is build-breaking**: `noUnusedLocals`, `noUnusedParameters` fail `tsc -b`. Prefix unused params with `_`.
- **Deps pinned to `"latest"`**: `package-lock.json` is source of truth. Don't bump casually.
- **Indonesian UI**: All strings, aria-labels, feature comments in Bahasa Indonesia.
- **No router**: Single-page, state-driven navigation (`activePage` state variable).
- **Monolithic App.tsx**: All sections in one file by design. Only `TourViewer` extracted.
- **Single stylesheet**: `global.css` only. Match existing CSS custom properties; no CSS framework.

## ANTI-PATTERNS (THIS PROJECT)
- Don't add router, state library, or CSS framework — single-page, single-museum, single-stylesheet by design.
- Don't suppress TS errors with `as any` / `@ts-ignore` — fix the unused symbol or type.
- Don't move tour data out of `src/data/museums.ts` without updating `TourViewer.tsx` and `App.tsx`.
- Don't commit PNGs to repo root — `*.png` gitignored (except `docs/design-references/*.png`).
- Don't translate UI strings to English.

## COMMANDS
```bash
npm run dev      # Vite dev server (0.0.0.0:5173)
npm run build    # tsc -b && vite build (type errors fail build)
npm run lint     # ESLint flat config on **/*.{ts,tsx}
npm run preview  # Vite preview (0.0.0.0:4173)
```
No test runner, no formatter, no CI. Verification = `npm run lint && npm run build`.

## COMMIT CONVENTION
Use `Tested:` / `Not-tested:` trailers to document verification:
```
Tested: npm run build; npm run lint; Playwright smoke verified 23 scenes
Not-tested: Manual visual review of every 360 scene
```

## NOTES
- **Hotspot positioning**: Imperative CSS vars (`--hotspot-left/--hotspot-top`), not React state, for perf.
- **HEIC not supported**: Convert to JPG/WebP first (see `docs/asset-contract.md`).
- **Scene sync**: Panorama + thumbnail + `museums.ts` entry must all exist or scene breaks silently.
- **Accessibility hooks**: See `src/hooks/AGENTS.md` for domain-specific patterns.
