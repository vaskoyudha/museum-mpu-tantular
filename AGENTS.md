# AGENTS.md

Single-museum 360° tour SPA: Vite + React 19 + TypeScript, glassmorphism UI, panoramas rendered via `@photo-sphere-viewer/core` (Three.js under the hood). Content is **Museum Mpu Tantular** only (23 scenes); copy is **Bahasa Indonesia** — keep it that way unless told otherwise.

## Commands

- `npm run dev` — Vite dev server, binds `0.0.0.0:5173`
- `npm run build` — runs `tsc -b && vite build`. The TS step is **part of the build**; type errors fail the build before bundling. Always run `npm run build` (not just `vite build`) when verifying changes.
- `npm run lint` — ESLint flat config (`eslint.config.js`), targets `**/*.{ts,tsx}`, ignores `dist`.
- `npm run preview` — Vite preview, binds `0.0.0.0:4173`.

No test runner, no formatter, no CI, no pre-commit hooks. Verification = `npm run lint && npm run build`.

## Strict TS gotchas

`tsconfig.app.json` has `strict`, `noUnusedLocals`, `noUnusedParameters`, `noEmit`. Unused imports / params are **build-breaking**, not warnings. Prefix unused params with `_` or remove them.

`package.json` pins every dep to `"latest"` — `package-lock.json` is the source of truth. Don't bump versions casually; reproduce installs from the lockfile.

## Architecture (small, flat)

- `src/main.tsx` → mounts `<App />`, imports `styles/global.css`.
- `src/App.tsx` → all sections in one file (Header, Hero, FeaturedMuseum, TourSection, AudienceSection, GalleryKunjungiSection). No router.
- `src/components/TourViewer.tsx` → only non-trivial component. Wraps `@photo-sphere-viewer/core` `Viewer`, projects hotspot anchors into screen space each frame using `viewer.dataHelper.sphericalCoordsToViewerCoords` and `isPointVisible`. Hotspots are positioned imperatively via CSS vars (`--hotspot-left/--hotspot-top`), not React state, for perf.
- `src/data/museums.ts` → static content + scene graph. **All tour data lives here.**
- `src/styles/global.css` → single ~21 KB stylesheet, design system in CSS custom properties (warm ivory, smoked umber, amber accents). Match the existing tokens; don't introduce a CSS framework.

## Adding / editing tour scenes

Three things must stay in sync or scenes will silently break:

1. Drop equirectangular panorama (2:1 ratio, recommended `4096x2048` `.jpg`/`.webp`) in `public/panoramas/mpu-tantular/`.
2. Drop matching thumbnail in `public/images/mpu-tantular/` (same filename).
3. Edit `src/data/museums.ts`:
   - Append `[id, label, filename, description]` to `sceneAssets`.
   - Add an entry to `routeHotspots` keyed `mpu-<id>` with hotspots whose `targetId` matches another scene's `mpu-<id>`.

Hotspots use the `hotspot()` helper with placement defaults (`forward`/`left`/`right`/`back`/`up`/`exit`); override `x`/`y` (percent of viewer) and `angle` (degrees, 0 = forward) when the default doesn't sit right on the rendered panorama. Background source format is HEIC; HEIC is **not** imported — convert to JPG/WebP first (see `docs/asset-contract.md`).

## Repo conventions

- **Language**: UI strings, `aria-label`s, comments in feature code are Indonesian. Don't translate to English.
- **Image assets at repo root** (`meseum-*.png`, `tour-*.png`) are screenshots used during design iteration. They are gitignored by `*.png` (with `!docs/design-references/*.png` carve-out). Don't commit new PNGs to the root.
- `.omx/` is orchestration tool state (`logs/`, `state/`, `metrics.json` are gitignored). Leave it alone.
- `docs/implementation-plan.md`, `docs/design-analysis.md`, `docs/asset-contract.md` describe the original build plan and the panorama pipeline — read before large refactors.

## Don'ts

- Don't add a router, state library, or CSS framework — single-page, single-museum, single stylesheet by design.
- Don't suppress strict-TS errors with `as any` / `@ts-ignore`; fix the unused symbol or type.
- Don't move tour data out of `src/data/museums.ts` without updating `TourViewer.tsx` and `App.tsx` — they import it directly.
