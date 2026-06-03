// Komponen pemutar voiceover ringkas untuk modal artefak.
// Menampilkan tombol putar/jeda jika src tersedia; jika tidak, tampilkan teks fallback.
import { Pause, Play } from 'lucide-react';
import { useCallback } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

interface ArtifactVoiceoverProps {
  /** Path publik ke file MP3, misalnya "/audio/voiceover/ganesa.mp3".
   *  Kosongkan string atau undefined untuk menampilkan fallback "belum tersedia". */
  src: string | undefined;
  /** Nama artefak — dipakai untuk label aria tombol. */
  title: string;
  /** Dipanggil saat voiceover mulai diputar (untuk ducking musik). */
  onPlay?: () => void;
  /** Dipanggil saat voiceover dijeda atau selesai (untuk membatalkan ducking). */
  onPause?: () => void;
}

export default function ArtifactVoiceover({ src, title, onPlay, onPause }: ArtifactVoiceoverProps) {
  const hasSrc = !!src;

  const { play, pause, isPlaying, error } = useAudioPlayer({
    src: hasSrc ? src : undefined,
    loop: false,
    volume: 1,
  });

  const handlePlay = useCallback(() => {
    play();
    onPlay?.();
  }, [play, onPlay]);

  const handlePause = useCallback(() => {
    pause();
    onPause?.();
  }, [pause, onPause]);

  // Tidak ada src — tampilkan teks fallback
  if (!hasSrc) {
    return (
      <p className="voiceover-unavailable">Voiceover belum tersedia</p>
    );
  }

  // Ada error media (file 404 atau ditolak browser)
  if (error && error !== 'no-src') {
    return (
      <p className="voiceover-unavailable">Audio belum tersedia</p>
    );
  }

  return (
    <div className="voiceover-player" role="region" aria-label={`Voiceover artefak ${title}`}>
      <button
        type="button"
        className={`voiceover-btn ${isPlaying ? 'playing' : ''}`}
        onClick={isPlaying ? handlePause : handlePlay}
        aria-label={isPlaying ? `Jeda voiceover ${title}` : `Putar voiceover ${title}`}
        aria-pressed={isPlaying}
      >
        {isPlaying ? (
          <>
            <Pause size={16} strokeWidth={2.4} aria-hidden="true" />
            <span>Jeda voiceover</span>
          </>
        ) : (
          <>
            <Play size={16} strokeWidth={2.4} aria-hidden="true" />
            <span>Putar voiceover</span>
          </>
        )}
      </button>
    </div>
  );
}
