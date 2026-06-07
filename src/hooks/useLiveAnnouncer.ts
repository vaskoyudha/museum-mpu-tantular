import { useCallback } from 'react';

type AnnouncerFn = (text: string) => void;

let announcerListener: AnnouncerFn | null = null;

export function setAnnouncerListener(listener: AnnouncerFn | null) {
  announcerListener = listener;
}

export function useLiveAnnouncer() {
  const announce = useCallback((text: string) => {
    if (announcerListener) {
      announcerListener(text);
    }
  }, []);

  return { announce };
}
