import { useCallback, useRef } from 'react';

export function useLiveAnnouncer() {
  const regionRef = useRef<HTMLDivElement | null>(null);
  const announce = useCallback((text: string) => {
    if (regionRef.current) regionRef.current.textContent = text;
  }, []);
  return { announce, regionRef };
}

export default function LiveAnnouncer() {
  const { regionRef } = useLiveAnnouncer();
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
