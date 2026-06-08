import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Volume2 } from 'lucide-react';

const WELCOMED_KEY = 'mpu-tantular-welcomed';

interface WelcomeModalProps {
  onEnter: () => void;
}

function getInitialShow(): boolean {
  try {
    return !window.localStorage.getItem(WELCOMED_KEY);
  } catch {
    return true;
  }
}

function getPortalTarget(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.body;
}

export default function WelcomeModal({ onEnter }: WelcomeModalProps) {
  const [show, setShow] = useState(getInitialShow);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const enterButtonRef = useRef<HTMLButtonElement | null>(null);
  const portalTarget = getPortalTarget();

  useEffect(() => {
    if (!show) return;

    const enterButton = enterButtonRef.current;
    if (enterButton) {
      enterButton.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!dialogRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
        return;
      }
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [show]);

  const handleEnter = () => {
    try {
      window.localStorage.setItem(WELCOMED_KEY, 'true');
    } catch {
      // Abaikan kegagalan storage
    }
    setShow(false);
    onEnter();
  };

  if (!show || !portalTarget) return null;

  return createPortal(
    <div className="welcome-modal-backdrop" aria-hidden="true">
      <div
        ref={dialogRef}
        className="welcome-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        aria-describedby="welcome-modal-desc"
      >
        <div className="welcome-modal-content">
          <div className="welcome-modal-icon">
            <Volume2 size={32} />
          </div>
          <h2 id="welcome-modal-title" className="welcome-modal-title">
            Selamat Datang
          </h2>
          <p id="welcome-modal-desc" className="welcome-modal-desc">
            Museum Mpu Tantular menyimpan ribuan artefak bersejarah.
            Nikmati tur 360° dan cerita di balik artefak pilihan.
          </p>
          <p className="welcome-modal-hint">
            <Volume2 size={14} /> Musik latar akan mengiringi perjalanan Anda
          </p>
          <button
            ref={enterButtonRef}
            type="button"
            className="welcome-modal-btn"
            onClick={handleEnter}
          >
            Mulai Jelajahi
          </button>
        </div>
      </div>
    </div>,
    portalTarget,
  );
}
