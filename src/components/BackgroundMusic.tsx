import { Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      
      // Auto-play attempt
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Autoplay blocked by browser
          setIsPlaying(false);
        });
      }
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setIsPlaying(true);
          }).catch(() => {});
        }
      }
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/background-music.m4a"
        loop
        preload="auto"
      />
      <button
        className="icon-button"
        type="button"
        aria-label={isPlaying ? "Matikan musik latar" : "Putar musik latar"}
        onClick={togglePlay}
        title={isPlaying ? "Matikan musik latar" : "Putar musik latar"}
      >
        {isPlaying ? <Volume2 size={22} /> : <VolumeX size={22} />}
      </button>
    </>
  );
}
