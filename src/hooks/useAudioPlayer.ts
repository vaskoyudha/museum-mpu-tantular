// Hook audio untuk memutar musik latar dan voiceover artefak
import { useCallback, useEffect, useRef, useState } from 'react';

// Singleton AudioContext — satu instance untuk seluruh aplikasi, dibuat lazy
// pada interaksi pertama agar autoplay policy browser tidak memblokirnya.
let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (sharedAudioContext) return sharedAudioContext;
  sharedAudioContext = new AudioContext();
  return sharedAudioContext;
}

// Factory node Web Audio — dipanggil di gelombang berikutnya untuk ducking
// (GainNode) dan stereo pan (StereoPannerNode). Belum dipasang di graph
// pada tugas ini; hanya mempersiapkan titik ekstensi.
export function createGainNode(ctx: AudioContext): GainNode {
  return ctx.createGain();
}

export function createPannerNode(ctx: AudioContext): StereoPannerNode {
  return ctx.createStereoPanner();
}

export interface UseAudioPlayerOptions {
  src?: string;
  loop?: boolean;
  volume?: number;
  onError?: (e: unknown) => void;
}

export interface UseAudioPlayerResult {
  play: () => void;
  pause: () => void;
  stop: () => void;
  isPlaying: boolean;
  error: string | null;
  duration: number;
  gain: React.RefObject<GainNode | null>;
  panner: React.RefObject<StereoPannerNode | null>;
}

function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function useAudioPlayer(options: UseAudioPlayerOptions = {}): UseAudioPlayerResult {
  const { src, loop = false, volume = 1, onError } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  // Bersihkan resource saat hook dilepas untuk mencegah memory leak.
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = '';
      }
      audioRef.current = null;
      gainRef.current = null;
      pannerRef.current = null;
    };
  }, []);

  const play = useCallback(() => {
    if (!src) {
      setError('no-src');
      setIsPlaying(false);
      return;
    }
    setError(null);

    // Buat elemen audio secara lazy pada pemutaran pertama.
    if (!audioRef.current) {
      const audio = new Audio(src);
      audio.loop = loop;
      audio.volume = clamp01(volume);
      audio.preload = 'auto';

      audio.addEventListener('error', (e) => {
        setError('media-error');
        setIsPlaying(false);
        if (onError) onError(e);
      });
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration || 0);
      });
      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('ended', () => setIsPlaying(false));

      audioRef.current = audio;
    }

    // resume() wajib dipanggil dari handler gestur pengguna (Safari iOS).
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume();
    }

    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = loop;
    audio.volume = clamp01(volume);
    void audio.play().catch((err: unknown) => {
      setError('play-failed');
      setIsPlaying(false);
      if (onError) onError(err);
    });
  }, [src, loop, volume, onError]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  }, []);

  return {
    play,
    pause,
    stop,
    isPlaying,
    error,
    duration,
    gain: gainRef,
    panner: pannerRef,
  };
}
