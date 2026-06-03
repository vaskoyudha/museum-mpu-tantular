// Widget aksesibilitas mengambang — tombol bawah-kanan membuka popover kecil
// berisi kontrol: kontras, ukuran teks, musik latar, dan reset.
import { Settings2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useA11yPrefs } from '../hooks/useA11yPrefs';
import { useLiveAnnouncer } from './LiveAnnouncer';

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const { contrast, textSize, musicEnabled, setContrast, setTextSize, setMusicEnabled, reset } = useA11yPrefs();
  const { announce } = useLiveAnnouncer();

  // Tutup popover saat Escape ditekan
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Tutup popover saat klik di luar
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener('pointerdown', onPointer);
    return () => window.removeEventListener('pointerdown', onPointer);
  }, [open]);

  const toggleContrast = useCallback(() => {
    const next = contrast === 'default' ? 'high' : 'default';
    setContrast(next);
    announce(next === 'high' ? 'Kontras tinggi aktif' : 'Kontras tinggi nonaktif');
  }, [contrast, setContrast, announce]);

  const cycleTextSize = useCallback(() => {
    const sizes = ['default', 'lg', 'xl'] as const;
    const idx = sizes.indexOf(textSize);
    const next = sizes[(idx + 1) % sizes.length];
    setTextSize(next);
    const labels = { default: 'Ukuran teks normal', lg: 'Ukuran teks besar', xl: 'Ukuran teks sangat besar' };
    announce(labels[next]);
  }, [textSize, setTextSize, announce]);

  const toggleMusic = useCallback(() => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    announce(next ? 'Musik latar aktif' : 'Musik latar nonaktif');
  }, [musicEnabled, setMusicEnabled, announce]);

  const handleReset = useCallback(() => {
    reset();
    announce('Pengaturan aksesibilitas telah direset');
  }, [reset, announce]);

  const textSizeLabel = { default: 'Normal', lg: 'Besar', xl: 'Sangat Besar' }[textSize];

  return (
    <div className="a11y-widget">
      <button
        ref={triggerRef}
        type="button"
        className="a11y-widget-button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Buka pengaturan aksesibilitas"
        title="Aksesibilitas"
      >
        <Settings2 size={20} strokeWidth={2.2} />
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="a11y-widget-popover"
          role="dialog"
          aria-label="Pengaturan aksesibilitas"
          aria-modal="false"
        >
          <div className="a11y-widget-popover-head">
            <span className="a11y-widget-popover-title">Aksesibilitas</span>
            <button
              type="button"
              className="a11y-widget-close"
              onClick={() => { setOpen(false); triggerRef.current?.focus(); }}
              aria-label="Tutup pengaturan aksesibilitas"
            >
              <X size={16} />
            </button>
          </div>

          <div className="a11y-widget-controls">
            {/* Kontras */}
            <div className="a11y-widget-row">
              <span className="a11y-widget-label">Kontras</span>
              <button
                type="button"
                className={`a11y-toggle-btn ${contrast === 'high' ? 'active' : ''}`}
                onClick={toggleContrast}
                aria-pressed={contrast === 'high'}
                aria-label={contrast === 'high' ? 'Nonaktifkan kontras tinggi' : 'Aktifkan kontras tinggi'}
              >
                {contrast === 'high' ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>

            {/* Ukuran teks */}
            <div className="a11y-widget-row">
              <span className="a11y-widget-label">Ukuran Teks</span>
              <button
                type="button"
                className={`a11y-toggle-btn ${textSize !== 'default' ? 'active' : ''}`}
                onClick={cycleTextSize}
                aria-label={`Ukuran teks saat ini: ${textSizeLabel}. Klik untuk mengganti.`}
              >
                {textSizeLabel}
              </button>
            </div>

            {/* Musik latar */}
            <div className="a11y-widget-row">
              <span className="a11y-widget-label">Musik Latar</span>
              <button
                type="button"
                className={`a11y-toggle-btn ${musicEnabled ? 'active' : ''}`}
                onClick={toggleMusic}
                aria-pressed={musicEnabled}
                aria-label={musicEnabled ? 'Nonaktifkan musik latar' : 'Aktifkan musik latar'}
              >
                {musicEnabled ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>
          </div>

          <button
            type="button"
            className="a11y-reset-btn"
            onClick={handleReset}
            aria-label="Reset semua pengaturan aksesibilitas ke default"
          >
            Atur Ulang
          </button>
        </div>
      )}
    </div>
  );
}
