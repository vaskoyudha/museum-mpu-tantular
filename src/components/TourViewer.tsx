import type { Viewer as PhotoSphereViewer } from '@photo-sphere-viewer/core';
import type { Position } from '@photo-sphere-viewer/core';
import { ArrowUp, Check, Maximize2, MousePointer2, Sparkles, Volume2, VolumeX, ZoomIn, ZoomOut } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Museum } from '../data/museums';
import type { Artifact } from '../data/artifacts';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useA11yPrefs } from '../hooks/useA11yPrefs';

type TourViewerProps = {
  museum: Museum;
  museums?: Museum[];
  onSelect?: (museum: Museum) => void;
  artifacts?: Artifact[];
  visitedArtifacts?: Set<string>;
  onArtifactSelect?: (artifact: Artifact) => void;
};

type ResolvedHotspot = {
  label: string;
  targetId: string;
  placement: 'forward' | 'left' | 'right' | 'back' | 'up' | 'exit';
  x: number;
  y: number;
  angle: number;
  target: Museum;
};

const MUSIC_SRC = '/audio/ambient/gamelan.mp3';
const DEG_STEP = 10 * (Math.PI / 180); // 10° dalam radian (PSV pakai radian)
const PITCH_MAX = 85 * (Math.PI / 180);

export function TourViewer({ museum, museums, onSelect, artifacts = [], visitedArtifacts, onArtifactSelect }: TourViewerProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<PhotoSphereViewer | null>(null);
  const hotspotRefs = useRef(new Map<string, HTMLButtonElement>());
  const hotspotAnchorsRef = useRef(new Map<string, Position>());
  const hotspotsRef = useRef<ResolvedHotspot[]>([]);
  const museumIdRef = useRef(museum.id);
  const initialMuseumRef = useRef(museum);
  const frameRef = useRef(0);
  const [viewerReady, setViewerReady] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const sceneMap = useMemo(() => new Map((museums ?? []).map((scene) => [scene.id, scene])), [museums]);
  const hotspots = useMemo<ResolvedHotspot[]>(
    () => (museum.hotspots ?? []).flatMap((hotspot) => {
      const target = sceneMap.get(hotspot.targetId);

      return target ? [{ ...hotspot, target }] : [];
    }),
    [museum.hotspots, sceneMap],
  );
  const getHotspotKey = useCallback((targetId: string, placement: string) => `${museumIdRef.current}-${targetId}-${placement}`, []);

  // ── Musik latar (Tugas 9) ─────────────────────────────────────────
  const { musicEnabled, setMusicEnabled } = useA11yPrefs();
  const music = useAudioPlayer({ src: MUSIC_SRC, loop: true, volume: 0.5 });

  // Mainkan / jeda musik sesuai toggle
  useEffect(() => {
    if (musicEnabled) {
      music.play();
    } else {
      music.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicEnabled]);

  // Jeda saat tab tidak terlihat; lanjutkan saat kembali aktif
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        music.pause();
      } else if (musicEnabled) {
        music.play();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicEnabled]);

  const toggleMusic = useCallback(() => {
    setMusicEnabled(!musicEnabled);
  }, [musicEnabled, setMusicEnabled]);

  // ── Update stereo pan berdasarkan yaw viewer (Tugas 9) ──────────
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);


  // Fungsi update pan dipanggil setiap position-updated
  const updatePan = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer || !pannerRef.current) return;
    const { yaw } = viewer.getPosition();
    // yaw dalam radian; rentang sekitar -π..π; normalisasi ke -1..1
    const pan = Math.max(-1, Math.min(1, yaw / Math.PI));
    pannerRef.current.pan.value = pan;
  }, []);

  // ── Hotspot helpers ───────────────────────────────────────────────
  useEffect(() => {
    hotspotsRef.current = hotspots;
  }, [hotspots]);

  const updateHotspotPositions = useCallback(() => {
    const activeViewer = viewerRef.current;
    if (!activeViewer) return;
    const { width, height } = activeViewer.getSize();
    const padX = 80;
    const padY = 80;

    hotspotsRef.current.forEach((hotspot) => {
      const key = `${museumIdRef.current}-${hotspot.targetId}-${hotspot.placement}`;
      const element = hotspotRefs.current.get(key);
      const anchor = hotspotAnchorsRef.current.get(key);
      if (!element || !anchor) return;
      const point = activeViewer.dataHelper.sphericalCoordsToViewerCoords(anchor);
      const visible = activeViewer.dataHelper.isPointVisible(anchor)
        && point.x >= -padX && point.x <= width + padX
        && point.y >= -padY && point.y <= height + padY;
      element.style.setProperty('--hotspot-left', `${point.x}px`);
      element.style.setProperty('--hotspot-top', `${point.y}px`);
      element.toggleAttribute('data-hidden', !visible);
    });
    // Perbarui pan stereo juga setiap render
    updatePan();
  }, [updatePan]);

  const scheduleHotspotUpdate = useCallback(() => {
    window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(updateHotspotPositions);
  }, [updateHotspotPositions]);

  const recomputeAnchors = useCallback(() => {
    const activeViewer = viewerRef.current;
    if (!activeViewer) return;
    const { width, height } = activeViewer.getSize();

    hotspotAnchorsRef.current.clear();
    hotspotsRef.current.forEach((hotspot) => {
      const key = `${museumIdRef.current}-${hotspot.targetId}-${hotspot.placement}`;
      hotspotAnchorsRef.current.set(
        key,
        activeViewer.dataHelper.viewerCoordsToSphericalCoords({
          x: (hotspot.x / 100) * width,
          y: (hotspot.y / 100) * height,
        }),
      );
    });

    updateHotspotPositions();
  }, [updateHotspotPositions]);

  // ── Inisialisasi PSV ──────────────────────────────────────────────
  useEffect(() => {
    if (!stageRef.current || viewerRef.current) return;
    const initial = initialMuseumRef.current;
    if (!initial.panorama) return;

    let cancelled = false;
    setViewerReady(false);
    setViewerError(null);

    const failTimer = window.setTimeout(() => {
      if (!stageRef.current?.querySelector('canvas')) {
        setViewerError('Panorama tidak dapat ditampilkan. Tambahkan gambar equirectangular JPG/WebP untuk penggunaan produksi.');
      }
    }, 3200);

    void (async () => {
      await import('@photo-sphere-viewer/core/index.css');
      const { Viewer } = await import('@photo-sphere-viewer/core');
      if (cancelled || !stageRef.current) return;

      const viewer = new Viewer({
        container: stageRef.current,
        panorama: initial.panorama,
        caption: initial.name,
        description: initial.description,
        defaultZoomLvl: 42,
        minFov: 35,
        maxFov: 95,
        mousewheelCtrlKey: true,
        touchmoveTwoFingers: false,
        navbar: ['zoom', 'move', 'caption', 'fullscreen'],
        loadingTxt: `Memuat ${initial.name}`,
      });
      viewerRef.current = viewer;

      viewer.addEventListener('ready', () => {
        if (cancelled) return;
        recomputeAnchors();
        setViewerReady(true);
      }, { once: true });
      viewer.addEventListener('render', scheduleHotspotUpdate);
      viewer.addEventListener('position-updated', scheduleHotspotUpdate);
      viewer.addEventListener('zoom-updated', scheduleHotspotUpdate);
      viewer.addEventListener('size-updated', () => {
        recomputeAnchors();
        scheduleHotspotUpdate();
      });
    })();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameRef.current);
      window.clearTimeout(failTimer);
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [recomputeAnchors, scheduleHotspotUpdate]);

  useEffect(() => {
    museumIdRef.current = museum.id;
    const viewer = viewerRef.current;
    if (!viewer || !museum.panorama) return;

    let cancelled = false;
    setViewerReady(false);
    void viewer.setPanorama(museum.panorama, {
      caption: museum.name,
      description: museum.description,
      showLoader: true,
    }).then(() => {
      if (cancelled) return;
      recomputeAnchors();
      setViewerReady(true);
    }).catch(() => {
      if (cancelled) return;
      setViewerError('Panorama tidak dapat dimuat.');
    });

    return () => {
      cancelled = true;
    };
  }, [museum.id, museum.panorama, museum.name, museum.description, recomputeAnchors]);

  useEffect(() => {
    if (!viewerReady) return;
    recomputeAnchors();
  }, [hotspots, viewerReady, recomputeAnchors]);

  // ── Keyboard rotation (Tugas 11) ─────────────────────────────────
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onKeyDown = (e: KeyboardEvent) => {
      const viewer = viewerRef.current;
      if (!viewer) return;
      // Hanya proses saat fokus di dalam stage
      if (!stage.contains(document.activeElement) && document.activeElement !== stage) return;

      const { yaw, pitch } = viewer.getPosition();
      const speed = prefersReduced ? 0 : 150; // ms animasi; 0 = langsung

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          void viewer.animate({ yaw: yaw - DEG_STEP, pitch, speed });
          break;
        case 'ArrowRight':
          e.preventDefault();
          void viewer.animate({ yaw: yaw + DEG_STEP, pitch, speed });
          break;
        case 'ArrowUp':
          e.preventDefault();
          void viewer.animate({ yaw, pitch: Math.min(PITCH_MAX, pitch + DEG_STEP), speed });
          break;
        case 'ArrowDown':
          e.preventDefault();
          void viewer.animate({ yaw, pitch: Math.max(-PITCH_MAX, pitch - DEG_STEP), speed });
          break;
        case '+':
        case '=':
          e.preventDefault();
          viewer.zoom(viewer.getZoomLevel() + 10);
          break;
        case '-':
        case '_':
          e.preventDefault();
          viewer.zoom(viewer.getZoomLevel() - 10);
          break;
        case 'Home':
          e.preventDefault();
          void viewer.animate({ yaw: 0, pitch: 0, speed });
          break;
        default:
          break;
      }
    };

    stage.addEventListener('keydown', onKeyDown);
    return () => stage.removeEventListener('keydown', onKeyDown);
  }, []);

  // Bersihkan Web Audio graph saat unmount
  useEffect(() => {
    const panner = pannerRef.current;
    const gain = gainRef.current;
    const mediaSource = mediaSourceRef.current;
    const audioCtx = audioCtxRef.current;
    return () => {
      panner?.disconnect();
      gain?.disconnect();
      mediaSource?.disconnect();
      audioCtx?.close().catch(() => undefined);
    };
  }, []);

  return (
    <div className="viewer-frame">
      <div className="viewer-toolbar" aria-label="Alat viewer tur">
        <span><MousePointer2 size={16} /> Klik dan geser untuk melihat sekitar</span>
        <span>{viewerReady ? 'Scene 360° aktif' : 'Menyiapkan scene'}</span>
        {/* Tombol musik latar (Tugas 9) */}
        <button
          type="button"
          className={`viewer-music-btn ${music.isPlaying ? 'active' : ''}`}
          onClick={toggleMusic}
          aria-label={musicEnabled ? 'Nonaktifkan musik latar' : 'Aktifkan musik latar'}
          aria-pressed={musicEnabled}
          title="Musik latar"
        >
          {musicEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span className="viewer-music-label">{musicEnabled ? 'Musik Aktif' : 'Musik Nonaktif'}</span>
        </button>
      </div>
      {/* panorama-stage: tabIndex=0 agar bisa difokus keyboard; aria-label menjelaskan kontrol */}
      <div
        ref={stageRef}
        className="panorama-stage"
        tabIndex={0}
        aria-label={`Viewer panorama 360 untuk ${museum.name}. Gunakan tombol panah untuk memutar, +/- untuk zoom, Home untuk reset.`}
      >
        {/* Petunjuk tersembunyi untuk pembaca layar */}
        <p className="sr-only">
          Gunakan tombol panah untuk memutar pandangan, tombol + atau - untuk memperbesar atau memperkecil, dan tombol Home untuk kembali ke posisi awal.
        </p>
        {hotspots.length > 0 && onSelect ? (
          <div className="tour-hotspots" aria-label="Navigasi titik panorama">
            {hotspots.map((hotspot) => {
              const hotspotStyle = {
                '--hotspot-x': `${hotspot.x}%`,
                '--hotspot-y': `${hotspot.y}%`,
                '--hotspot-angle': `${hotspot.angle}deg`,
              } as CSSProperties;

              return (
                <button
                  className={`tour-hotspot hotspot-${hotspot.placement}`}
                  type="button"
                  key={`${museum.id}-${hotspot.targetId}-${hotspot.placement}`}
                  ref={(element) => {
                    const key = getHotspotKey(hotspot.targetId, hotspot.placement);
                    if (element) {
                      hotspotRefs.current.set(key, element);
                    } else {
                      hotspotRefs.current.delete(key);
                    }
                  }}
                  onClick={() => onSelect(hotspot.target)}
                  aria-label={`${hotspot.label}: ${hotspot.target.highlight}`}
                  style={hotspotStyle}
                >
                  <span className="hotspot-surface" aria-hidden="true" />
                  <span className="hotspot-icon"><ArrowUp size={30} strokeWidth={2.6} /></span>
                  <span className="hotspot-label">{hotspot.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
        {artifacts.length > 0 && onArtifactSelect ? (
          <div className="artifact-rail-overlay">
            <div className="artifact-rail-overlay-head">
              <span className="artifact-rail-tag"><Sparkles size={12} /> Artefak Ruangan Ini</span>
              <span className="artifact-rail-count">
                {(visitedArtifacts ? artifacts.filter((a) => visitedArtifacts.has(a.id)).length : 0)}/{artifacts.length}
              </span>
            </div>
            <div className="artifact-rail-track">
              {artifacts.map((artifact) => {
                const visited = visitedArtifacts?.has(artifact.id) ?? false;
                const thumb = artifact.photos[0] ?? artifact.cards[0];
                return (
                  <button
                    key={artifact.id}
                    type="button"
                    className={`artifact-rail-card ${visited ? 'visited' : ''}`}
                    onClick={() => onArtifactSelect(artifact)}
                    aria-label={`Artefak ${artifact.name}${visited ? ' (sudah dilihat)' : ''}`}
                  >
                    <span className="artifact-rail-thumb" aria-hidden="true">
                      {thumb ? <img src={thumb} alt="" loading="lazy" /> : <Sparkles size={18} />}
                      {visited ? (
                        <span className="artifact-rail-check"><Check size={12} strokeWidth={3} /></span>
                      ) : null}
                    </span>
                    <span className="artifact-rail-name">{artifact.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
      {viewerError ? (
        <div className="viewer-empty" role="status">
          <strong>Fallback panorama</strong>
          <p>{viewerError}</p>
        </div>
      ) : null}
      <div className="viewer-controls" aria-hidden="true">
        <span><ZoomIn size={18} /> Perbesar</span>
        <span><ZoomOut size={18} /> Perkecil</span>
        <span><Maximize2 size={18} /> Layar Penuh</span>
        <span>↑↓←→ Putar · +/- Zoom · Home Reset</span>
      </div>
    </div>
  );
}
