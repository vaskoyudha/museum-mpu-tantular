# Issues — Museum Mpu Tantular a11y plan

## Open issues (none currently blocking)

## Resolved
- **Subagent parallel-write conflict on `src/App.tsx`**: Tasks 4 + 6 both edited the file simultaneously. Verified post-hoc: Task 4's `announce()` calls in `handleSelectMuseum`, `handleArtifactSelect`, `handleArtifactClose` (lines 79-93) coexist correctly with Task 6's modal focus-trap, return-focus, and backdrop button. No overwrites.
- **Lint warning on `LiveAnnouncer.tsx`**: `react-refresh/only-export-components` warning when a file exports both a hook (`useLiveAnnouncer`) and a component (`LiveAnnouncer`). Non-blocking. Could split into 2 files later if desired but not required.

## Known accepted (pre-existing, not from this plan)
- Bundle size warning: 588.85 KB main chunk exceeds 500 KB threshold (pre-existing — not from this plan)
- `useA11yPrefs` reads `localStorage` during lazy `useState` initializer; in SSR contexts this would break but the project is SPA-only (Vite + React 19, no SSR)
- 6 ARIA lint findings exist in write-hook (does NOT affect `npm run lint`); 2 of them are in `App.tsx` and addressed by Task 6; remaining 3 are in `TourViewer.tsx` (deferred to Wave 2 Tasks 9-11)
