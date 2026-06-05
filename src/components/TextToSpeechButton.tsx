import { Volume2, VolumeX } from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

type TextToSpeechButtonProps = {
  text: string;
  label?: string;
  className?: string;
};

export default function TextToSpeechButton({ text, label = 'Bacakan Deskripsi', className = '' }: TextToSpeechButtonProps) {
  const { isPlaying, isSupported, toggle } = useTextToSpeech();

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      className={`tts-btn ${isPlaying ? 'playing' : ''} ${className}`}
      onClick={() => toggle(text)}
      aria-label={isPlaying ? 'Hentikan bacaan' : 'Bacakan deskripsi ruangan'}
      aria-pressed={isPlaying}
    >
      {isPlaying ? (
        <>
          <VolumeX size={16} strokeWidth={2.4} aria-hidden="true" />
          <span>Hentikan Bacaan</span>
        </>
      ) : (
        <>
          <Volume2 size={16} strokeWidth={2.4} aria-hidden="true" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
