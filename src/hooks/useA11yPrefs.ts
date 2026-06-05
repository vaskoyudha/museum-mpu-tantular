// Hook preferensi aksesibilitas: ukuran teks, musik, mode tunanetra
import { useCallback, useLayoutEffect, useState } from 'react';

export type TextSize = 'default' | 'lg' | 'xl';

export interface A11yPrefs {
  textSize: TextSize;
  musicEnabled: boolean;
  screenReaderMode: boolean;
}

export interface UseA11yPrefsReturn {
  textSize: TextSize;
  musicEnabled: boolean;
  screenReaderMode: boolean;
  setTextSize: (value: TextSize) => void;
  setMusicEnabled: (value: boolean) => void;
  setScreenReaderMode: (value: boolean) => void;
  reset: () => void;
}

const STORAGE_KEY = 'mpu-tantular-a11y';

const DEFAULTS: A11yPrefs = {
  textSize: 'default',
  musicEnabled: true,
  screenReaderMode: false,
};

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
      textSize: isTextSize(obj.textSize) ? obj.textSize : DEFAULTS.textSize,
      musicEnabled: isBoolean(obj.musicEnabled)
        ? obj.musicEnabled
        : DEFAULTS.musicEnabled,
      screenReaderMode: isBoolean(obj.screenReaderMode)
        ? obj.screenReaderMode
        : DEFAULTS.screenReaderMode,
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
  document.documentElement.dataset.textSize = prefs.textSize;
  document.documentElement.dataset.screenReaderMode = prefs.screenReaderMode ? 'true' : 'false';
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

  const setTextSize = useCallback((value: TextSize) => {
    if (!isTextSize(value)) return;
    setPrefs((prev) => ({ ...prev, textSize: value }));
  }, []);

  const setMusicEnabled = useCallback((value: boolean) => {
    if (!isBoolean(value)) return;
    setPrefs((prev) => ({ ...prev, musicEnabled: value }));
  }, []);

  const setScreenReaderMode = useCallback((value: boolean) => {
    if (!isBoolean(value)) return;
    setPrefs((prev) => {
      // Saat Mode Tunanetra diaktifkan, otomatis set teks XL
      if (value) {
        return { ...prev, screenReaderMode: true, textSize: 'xl' };
      }
      return { ...prev, screenReaderMode: false };
    });
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
    textSize: prefs.textSize,
    musicEnabled: prefs.musicEnabled,
    screenReaderMode: prefs.screenReaderMode,
    setTextSize,
    setMusicEnabled,
    setScreenReaderMode,
    reset,
  };
}
