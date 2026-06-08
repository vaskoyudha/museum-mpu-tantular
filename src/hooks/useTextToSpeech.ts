import { useCallback, useState, useRef, useEffect } from 'react';

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Selalu didukung — menggunakan proxy TTS lokal berbasis audio HTML5
  const isSupported = true;

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text) return;

    // Hentikan audio sebelumnya
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    // Batasi panjang teks (Google TTS limit ~200 karakter per request)
    const playText = text.length > 200 ? text.substring(0, 197) + '...' : text;

    // Gunakan proxy lokal /api/tts untuk menghindari CORS
    // (proxy di vite.config.ts mem-forward ke Google Translate TTS dengan User-Agent yang benar)
    const proxyUrl = `/api/tts?q=${encodeURIComponent(playText)}`;

    const audio = new Audio(proxyUrl);
    audioRef.current = audio;

    audio.onplay   = () => setIsPlaying(true);
    audio.onended  = () => setIsPlaying(false);
    audio.onerror  = () => setIsPlaying(false);

    try {
      setIsPlaying(true);
      await audio.play();
    } catch {
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      setIsPlaying(false);
    }
  }, []);

  const toggle = useCallback(
    (text: string) => {
      if (isPlaying) {
        stop();
      } else {
        void speak(text);
      }
    },
    [isPlaying, speak, stop],
  );

  return { isPlaying, isSupported, speak, stop, toggle };
}
