import { useCallback, useState, useRef, useEffect } from 'react';

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const keepAliveInterval = useRef<number | null>(null);

  // Paksa browser memuat daftar suara sedini mungkin
  useEffect(() => {
    if (isSupported) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
      if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
    };
  }, [isSupported]);

  const speak = useCallback((text: string) => {
    if (!isSupported || !text) return;

    window.speechSynthesis.cancel();
    if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);

    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    // Cari suara Indonesia (id-ID)
    const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
    
    if (idVoice) {
      utterance.voice = idVoice;
      utterance.lang = idVoice.lang;
    } else if (voices.length > 0) {
      // Jika tidak ada suara Indonesia, paksa gunakan suara default OS
      // agar setidaknya tetap ada suara yang keluar (meski logatnya mungkin Inggris).
      utterance.voice = voices[0];
    }
    
    utterance.volume = 1.0;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
    };
    utterance.onerror = (e) => {
      console.error('SpeechSynthesis error:', e);
      setIsPlaying(false);
      if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    
    // Fallback status visual
    setIsPlaying(true);

    // Workaround bug Google Chrome di mana suara berhenti sendiri setelah 15 detik
    keepAliveInterval.current = window.setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(keepAliveInterval.current!);
      } else {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 14000);

  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
    setIsPlaying(false);
  }, [isSupported]);

  const toggle = useCallback((text: string) => {
    if (isPlaying) {
      stop();
    } else {
      speak(text);
    }
  }, [isPlaying, speak, stop]);

  return {
    isPlaying,
    isSupported,
    speak,
    stop,
    toggle,
  };
}
