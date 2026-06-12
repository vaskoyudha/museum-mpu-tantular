import { Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useA11yPrefs } from '../hooks/useA11yPrefs';

const MUSIC_SRC = '/audio/background-music.mp3';

interface BackgroundMusicProps {
  isVoiceoverPlaying?: boolean;
}

export default function BackgroundMusic({ isVoiceoverPlaying = false }: BackgroundMusicProps) {
  const { musicEnabled, setMusicEnabled } = useA11yPrefs();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const wasPlayingBeforeDuck = useRef(false);

  // Browsers block audio autoplay without a user gesture.
  // Listen for the first interaction (click / key / touch) and set a flag
  // so the play/pause effect below can start audio on that gesture.
  useEffect(() => {
    if (hasInteracted) return;

    const onFirstInteraction = () => {
      setHasInteracted(true);
      document.removeEventListener('click', onFirstInteraction);
      document.removeEventListener('keydown', onFirstInteraction);
      document.removeEventListener('touchstart', onFirstInteraction);
    };

    document.addEventListener('click', onFirstInteraction);
    document.addEventListener('keydown', onFirstInteraction);
    document.addEventListener('touchstart', onFirstInteraction);

    return () => {
      document.removeEventListener('click', onFirstInteraction);
      document.removeEventListener('keydown', onFirstInteraction);
      document.removeEventListener('touchstart', onFirstInteraction);
    };
  }, [hasInteracted]);

  useEffect(() => {
    if (!hasInteracted || !audioRef.current) return;

    audioRef.current.volume = 0.5;

    if (isVoiceoverPlaying) {
      wasPlayingBeforeDuck.current = musicEnabled && !audioRef.current.paused;
      audioRef.current.pause();
      return;
    }

    if (musicEnabled) {
      void audioRef.current.play().catch((err) => {
        console.warn('Background music play failed:', err);
      });
    } else if (wasPlayingBeforeDuck.current) {
      wasPlayingBeforeDuck.current = false;
    } else {
      audioRef.current.pause();
    }
  }, [musicEnabled, hasInteracted, isVoiceoverPlaying]);

  const togglePlay = useCallback(() => {
    setMusicEnabled(!musicEnabled);
  }, [musicEnabled, setMusicEnabled]);

  return (
    <>
      <audio
        ref={audioRef}
        src={MUSIC_SRC}
        loop
        preload="auto"
        playsInline
      />
      <button
        className="icon-button"
        type="button"
        aria-label={musicEnabled ? "Matikan musik latar" : "Putar musik latar"}
        onClick={togglePlay}
        title={musicEnabled ? "Matikan musik latar" : "Putar musik latar"}
      >
        {musicEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
      </button>
    </>
  );
}
