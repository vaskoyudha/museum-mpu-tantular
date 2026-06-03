// Hook preferensi aksesibilitas: kontras, ukuran teks, musik
import { useCallback, useLayoutEffect, useState } from 'react';

export type Contrast = 'default' | 'high';
export type TextSize = 'default' | 'lg' | 'xl';

export interface A11yPrefs {
  contrast: Contrast;
  textSize: TextSize;
  musicEnabled: boolean;
}

export interface UseA11yPrefsReturn {
  contrast: Contrast;
  textSize: TextSize;
  musicEnabled: boolean;
  setContrast: (value: Contrast) => void;
  setTextSize: (value: TextSize) => void;
  setMusicEnabled: (value: boolean) => void;
  reset: () => void;
}

const STORAGE_KEY = 'mpu-tantular-a11y';

const DEFAULTS: A11yPrefs = {
  contrast: 'default',
  textSize: 'default',
  musicEnabled: true,
};

function isContrast(value: unknown): value is Contrast {
  return value === 'default' || value === 'high';
}

function isTextSize(value: unknown): value is TextSize {
  return value === 'default' || value === 'lg' || value === 'xl';
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function readPrefs(): A11yPrefs {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULTS;
    const obj = parsed as Record<string, unknown>;
    return {
      contrast: isContrast(obj.contrast) ? obj.contrast : DEFAULTS.contrast,
      textSize: isTextSize(obj.textSize) ? obj.textSize : DEFAULTS.textSize,
      musicEnabled: isBoolean(obj.musicEnabled)
        ? obj.musicEnabled
        : DEFAULTS.musicEnabled,
    };
  } catch {
    return DEFAULTS;
  }
}

function writePrefs(prefs: A11yPrefs): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Abaikan kegagalan storage (private mode, kuota penuh)
  }
}

function applyDataset(prefs: A11yPrefs): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.contrast = prefs.contrast;
  document.documentElement.dataset.textSize = prefs.textSize;
}

export function useA11yPrefs(): UseA11yPrefsReturn {
  // Hidrasi awal: lazy initializer membaca localStorage sebelum render pertama
  // (sebelum paint) sehingga nilai sudah benar saat useLayoutEffect di bawah
  // pertama kali berjalan.
  const [prefs, setPrefs] = useState<A11yPrefs>(() => readPrefs());

  // Terapkan dataset ke <html> dan sinkronkan ke localStorage pada mount
  // (dengan prefs hasil hidrasi) dan setiap perubahan state.
  useLayoutEffect(() => {
    applyDataset(prefs);
    writePrefs(prefs);
  }, [prefs]);

  const setContrast = useCallback((value: Contrast) => {
    if (!isContrast(value)) return;
    setPrefs((prev) => ({ ...prev, contrast: value }));
  }, []);

  const setTextSize = useCallback((value: TextSize) => {
    if (!isTextSize(value)) return;
    setPrefs((prev) => ({ ...prev, textSize: value }));
  }, []);

  const setMusicEnabled = useCallback((value: boolean) => {
    if (!isBoolean(value)) return;
    setPrefs((prev) => ({ ...prev, musicEnabled: value }));
  }, []);

  const reset = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Abaikan kegagalan storage
      }
    }
    setPrefs(DEFAULTS);
  }, []);

  return {
    contrast: prefs.contrast,
    textSize: prefs.textSize,
    musicEnabled: prefs.musicEnabled,
    setContrast,
    setTextSize,
    setMusicEnabled,
    reset,
  };
}
