import type { Viewer as PhotoSphereViewer } from '@photo-sphere-viewer/core';
import type { Position } from '@photo-sphere-viewer/core';
import { ArrowUp, Check, Maximize2, MousePointer2, Sparkles, Volume2, ZoomIn, ZoomOut } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Museum } from '../data/museums';
import type { Artifact } from '../data/artifacts';

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
  }, []);

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

  return (
    <div className="viewer-frame">
      <div className="viewer-toolbar" aria-label="Alat viewer tur">
        <span><MousePointer2 size={16} /> Klik dan geser untuk melihat sekitar</span>
        <span>{viewerReady ? 'Scene 360° aktif' : 'Menyiapkan scene'}</span>
      </div>
      <div ref={stageRef} className="panorama-stage" aria-label={`Viewer panorama 360 untuk ${museum.name}`}>
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
        <span><Volume2 size={18} /> Audio / Panduan</span>
      </div>
    </div>
  );
}
