import { useCallback, useState, useRef, useEffect } from 'react';

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Selalu didukung jika menggunakan audio berbasis URL
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

    // Batalkan pemutaran sebelumnya
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    // Memecah teks jika terlalu panjang (Google TTS limit ~200 karakter)
    // Walaupun data kita rata-rata <200, ini mencegah API error.
    let playText = text;
    if (playText.length > 200) {
      playText = playText.substring(0, 197) + '...';
    }

    // Menggunakan API TTS Google Translate untuk kompatibilitas stabil di semua OS
    // (Linux / Chrome sering gagal membunyikan window.speechSynthesis secara native)
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=${encodeURIComponent(playText)}`;
    
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = (e) => {
      console.error('TTS audio error:', e);
      setIsPlaying(false);
    };

    try {
      setIsPlaying(true); // Fallback visual segera
      await audio.play();
    } catch (e) {
      console.error('Failed to play TTS audio:', e);
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

  return {
    isPlaying,
    isSupported,
    speak,
    stop,
    toggle,
  };
}

