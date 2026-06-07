import { Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useA11yPrefs } from '../hooks/useA11yPrefs';

export default function BackgroundMusic() {
  const { musicEnabled, setMusicEnabled } = useA11yPrefs();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      if (musicEnabled) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay blocked by browser
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [musicEnabled]);

  const togglePlay = () => {
    setMusicEnabled(!musicEnabled);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/background-music.mp3"
        loop
        preload="auto"
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

