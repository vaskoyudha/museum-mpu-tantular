import { useEffect, useRef } from 'react';
import { setAnnouncerListener } from '../hooks/useLiveAnnouncer';

export default function LiveAnnouncer() {
  const regionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setAnnouncerListener((text: string) => {
      if (regionRef.current) {
        regionRef.current.textContent = text;
      }
    });
    return () => {
      setAnnouncerListener(null);
    };
  }, []);

  return (
    <div
      ref={regionRef}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="live-announcer"
    />
  );
}
