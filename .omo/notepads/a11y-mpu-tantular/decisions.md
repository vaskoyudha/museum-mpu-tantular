# Decisions — Museum Mpu Tantular a11y plan

## Architecture
- **No router / no state library / no CSS framework / no new dependencies** — confirmed for all 18 tasks
- **Mode Katalog = `<section>` (not view toggle)** — per user interview
- **A11y prefs in localStorage, NOT React Context** — `useA11yPrefs` hook, no global state
- **Single `mpu-tantular-a11y` localStorage key** holds all 3 prefs (contrast, textSize, musicEnabled)
- **Pre-paint inline script in index.html** applies contrast + text-size to `<html>` dataset BEFORE React mounts to prevent flash of unstyled content (FOUC)

## Audio
- **MP3 only, ~80KB/file, ≤2MB total budget** — per Metis analysis
- **Module-level `sharedAudioContext`** singleton (not React context, not prop-drilled)
- **`AudioContext.resume()` inside `play()`** for Safari iOS gesture requirement
- **No autoplay** — both music and voiceover default OFF; user must opt in
- **Ducking via shared `GainNode`** — voiceover will drop music to 30% (Task 9 wiring)

## Modal
- **Focus on close button open** (not on dialog wrapper) — most common pattern
- **Return focus to previously focused element on close** via `useRef` saved at mount
- **Backdrop is a `<button>`** with `aria-label` to ensure screen-reader users have a labeled click target outside the dialog content
- **Backdrop close fires only on direct click** (not bubbling from dialog children)

## A11y / UI
- **High contrast tokens override `--paper`, `--ink`, `--ink-soft`** to pure black/white; shadows nullified (no decorative shadow on text)
- **Text scale uses percent (112.5% / 125%)** to respect user zoom
- **Focus ring 3px saffron outline with 2px offset** (matches existing color palette)
- **`:focus-visible` only** (not `:focus`) — avoids ring on mouse clicks
- **No `<button>` inside `<button>`** in modal — backdrop is a `<button>` and close button is a `<button>` but dialog content sits as sibling div, not nested

## Catalog (Task 12)
- **Native `<details>`/`<summary>`** per scene — no collapse/expand state needed
- **Group by 4 existing categories** (Gerbang Masuk, Orientasi Rute, Jalur Galeri, Galeri Atas) — mirror TourSection
- **Heading hierarchy h2 → h3 (scene) → h4 (artifact)**

## Commit strategy
- 3 implementation commits: Wave 1 (tasks 1-7), Wave 2 (tasks 8-12), Wave 3 (tasks 13-14)
- Final wave F1-F4 reviews do NOT commit
