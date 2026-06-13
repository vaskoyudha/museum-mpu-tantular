import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  Clock3,
  Compass,
  GraduationCap,
  HelpCircle,
  Home,
  Landmark,
  MapPin,
  Menu,
  MonitorSmartphone,
  Sparkles,
  Ticket,
  UsersRound,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { audienceBenefits, galleryItems, museumProfile, museums, type Museum } from './data/museums';
import { artifactsByScene, totalArtifacts, type Artifact } from './data/artifacts';
import { TourViewer } from './components/TourViewer';
import SkipLink from './components/SkipLink';
import LiveAnnouncer from './components/LiveAnnouncer';
import { useLiveAnnouncer } from './hooks/useLiveAnnouncer';
import AccessibilityWidget from './components/AccessibilityWidget';
import CatalogSection from './components/CatalogSection';
import ArtifactVoiceover from './components/ArtifactVoiceover';
import TextToSpeechButton from './components/TextToSpeechButton';
import { useA11yPrefs } from './hooks/useA11yPrefs';
import BackgroundMusic from './components/BackgroundMusic';
import WelcomeModal from './components/WelcomeModal';
import GuideSection from './components/GuideSection';
import VideoProfileSection from './components/VideoProfileSection';

type AppPage = 'home' | 'museum' | 'tour' | 'stories' | 'visit' | 'katalog' | 'panduan';

const navPageItems: { label: string; page: AppPage }[] = [
  { label: 'Museum', page: 'museum' },
  { label: 'Tur 360', page: 'tour' },
  { label: 'Cerita', page: 'stories' },
  { label: 'Kunjungi', page: 'visit' },
  { label: 'Katalog', page: 'katalog' },
  { label: 'Panduan', page: 'panduan' },
];

const mobilePageTabs: { id: AppPage; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Beranda', icon: Home },
  { id: 'tour', label: 'Tur 360', icon: Compass },
  { id: 'katalog', label: 'Katalog', icon: BookOpen },
  { id: 'visit', label: 'Kunjungi', icon: MapPin },
  { id: 'panduan', label: 'Panduan', icon: HelpCircle },
];

const VISITED_STORAGE_KEY = 'mpu-tantular-artefak-visited';

function App() {
  const { announce } = useLiveAnnouncer();
  const [activePage, setActivePage] = useState<AppPage>('home');
  const [activeMuseum, setActiveMuseum] = useState<Museum>(museums[0]);
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const [isVoiceoverPlaying, setIsVoiceoverPlaying] = useState(false);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const isAnyAudioPlaying = isVoiceoverPlaying || isTTSPlaying;
  const [visitedArtifacts, setVisitedArtifacts] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = window.localStorage.getItem(VISITED_STORAGE_KEY);
      if (!raw) return new Set();
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed.filter((v): v is string => typeof v === 'string'));
      return new Set();
    } catch {
      return new Set();
    }
  });
  const { screenReaderMode } = useA11yPrefs();
  const primaryMuseum = useMemo(() => museums.slice(0, 4), []);

  useEffect(() => {
    try {
      window.localStorage.setItem(VISITED_STORAGE_KEY, JSON.stringify([...visitedArtifacts]));
    } catch {
      // ignore storage failures (private mode, quota)
    }
  }, [visitedArtifacts]);

  const markVisited = useCallback((id: string) => {
    setVisitedArtifacts((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleSelectMuseum = useCallback((m: Museum) => {
    setActiveMuseum(m);
    announce(screenReaderMode ? `Berpindah ke ${m.highlight}. ${m.description}` : `Berpindah ke ${m.highlight}`);
    setTimeout(() => {
      const viewer = document.getElementById('tour-tour');
      if (viewer) {
        viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, [announce, screenReaderMode]);

  const handleNavigate = useCallback((page: AppPage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const pageLabels: Record<AppPage, string> = {
      home: 'Beranda',
      museum: 'Halaman Museum',
      tour: 'Tur 360°',
      stories: 'Cerita',
      visit: 'Kunjungi',
      katalog: 'Katalog Aksesibilitas',
      panduan: 'Panduan Penggunaan',
    };
    announce('Membuka ' + pageLabels[page]);
  }, [announce]);

  const handleArtifactSelect = useCallback((artifact: Artifact) => {
    setActiveArtifact(artifact);
    markVisited(artifact.id);
    announce("Membuka detail artefak: " + artifact.name);
  }, [announce, markVisited]);

  const handleArtifactClose = useCallback(() => {
    setActiveArtifact(null);
    announce("Menutup detail");
  }, [announce]);

  const handleWelcomeEnter = useCallback(() => {
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, []);

  return (
    <main id="main" className="site-shell">
      <SkipLink />
      <LiveAnnouncer />
      <WelcomeModal onEnter={handleWelcomeEnter} />
      <Header activePage={activePage} onNavigate={handleNavigate} isVoiceoverPlaying={isAnyAudioPlaying} />

      {/* ── Beranda (Home) — semua section berurutan ── */}
      {activePage === 'home' && (
        <div className="page-view" key="home">
          <Hero />
          <FeaturedMuseum museums={primaryMuseum} activeId={activeMuseum.id} onSelect={handleSelectMuseum} />
          <TourSection
            activeMuseum={activeMuseum}
            museums={museums}
            onSelect={handleSelectMuseum}
            visitedArtifacts={visitedArtifacts}
            onArtifactSelect={handleArtifactSelect}
            isVoiceoverPlaying={isVoiceoverPlaying}
            onTTSPlay={() => setIsTTSPlaying(true)}
            onTTSPause={() => setIsTTSPlaying(false)}
          />
          <CatalogSection
            museums={museums}
            artifactsByScene={artifactsByScene}
            onArtifactSelect={handleArtifactSelect}
          />
          <AudienceSection />
          <VideoProfileSection />
          <GuideSection />
          <GalleryKunjungiSection />
        </div>
      )}

      {/* ── Halaman Museum ── */}
      {activePage === 'museum' && (
        <div className="page-view page-view--full" key="museum">
          <PageHeader title="Rute Museum Mpu Tantular" subtitle="Semua 23 titik panorama" onBack={() => handleNavigate('home')} />
          <FeaturedMuseum museums={primaryMuseum} activeId={activeMuseum.id} onSelect={handleSelectMuseum} />
        </div>
      )}

      {/* ── Halaman Tur 360 ── */}
      {activePage === 'tour' && (
        <div className="page-view page-view--full" key="tour">
          <PageHeader title="Tur 360°" subtitle="Jelajahi Museum Mpu Tantular secara virtual" onBack={() => handleNavigate('home')} />
          <TourSection
            activeMuseum={activeMuseum}
            museums={museums}
            onSelect={handleSelectMuseum}
            visitedArtifacts={visitedArtifacts}
            onArtifactSelect={handleArtifactSelect}
            isVoiceoverPlaying={isVoiceoverPlaying}
            onTTSPlay={() => setIsTTSPlaying(true)}
            onTTSPause={() => setIsTTSPlaying(false)}
          />
        </div>
      )}

      {/* ── Halaman Cerita ── */}
      {activePage === 'stories' && (
        <div className="page-view page-view--full" key="stories">
          <PageHeader title="Cerita Museum" subtitle="Dibangun dari foto asli Museum Mpu Tantular" onBack={() => handleNavigate('home')} />
          <AudienceSection />
        </div>
      )}

      {/* ── Halaman Kunjungi ── */}
      {activePage === 'visit' && (
        <div className="page-view page-view--full" key="visit">
          <PageHeader title="Rencanakan Kunjungan" subtitle="Galeri warisan & informasi kunjungan" onBack={() => handleNavigate('home')} />
          <GalleryKunjungiSection />
        </div>
      )}

      {/* ── Halaman Katalog ── */}
      {activePage === 'katalog' && (
        <div className="page-view page-view--full" key="katalog">
          <PageHeader title="Katalog Aksesibilitas" subtitle="Semua koleksi dalam format teks" onBack={() => handleNavigate('home')} />
          <CatalogSection
            museums={museums}
            artifactsByScene={artifactsByScene}
            onArtifactSelect={handleArtifactSelect}
          />
        </div>
      )}

      {/* ── Halaman Panduan ── */}
      {activePage === 'panduan' && (
        <div className="page-view page-view--full" key="panduan">
          <PageHeader title="Panduan Penggunaan" subtitle="Cara menjelajah Museum360 Nusantara" onBack={() => handleNavigate('home')} />
          <VideoProfileSection />
          <GuideSection />
        </div>
      )}

      <AccessibilityWidget />
      <MobileTabBar activePage={activePage} onNavigate={handleNavigate} />
      {activeArtifact ? (
        <ArtifactModal
          artifact={activeArtifact}
          visited={visitedArtifacts.has(activeArtifact.id)}
          onClose={handleArtifactClose}
          onVoiceoverPlay={() => setIsVoiceoverPlaying(true)}
          onVoiceoverPause={() => setIsVoiceoverPlaying(false)}
        />
      ) : null}
    </main>
  );
}

function MobileTabBar({ activePage, onNavigate }: { activePage: AppPage; onNavigate: (page: AppPage) => void }) {
  return (
    <nav className="mobile-tabbar" aria-label="Navigasi seluler">
      {mobilePageTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === activePage;
        return (
          <button
            key={tab.id}
            type="button"
            className={`mobile-tab ${isActive ? 'is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onNavigate(tab.id)}
          >
            <span className="mobile-tab-icon" aria-hidden="true">
              <Icon size={22} strokeWidth={2.2} />
            </span>
            <span className="mobile-tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function Header({ activePage, onNavigate, isVoiceoverPlaying }: { activePage: AppPage; onNavigate: (page: AppPage) => void; isVoiceoverPlaying?: boolean }) {
  return (
    <header className="glass-nav" aria-label="Navigasi utama">
      <button
        className="brand-mark"
        type="button"
        aria-label="Kembali ke beranda Museum360 Nusantara"
        onClick={() => onNavigate('home')}
      >
        <span className="brand-symbol">✦</span>
        <span><strong>Museum360</strong> Nusantara</span>
      </button>
      <nav className="nav-links" aria-label="Bagian situs">
        {navPageItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`nav-page-btn ${activePage === item.page ? 'is-active' : ''}`}
            aria-current={activePage === item.page ? 'page' : undefined}
            onClick={() => onNavigate(item.page)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BackgroundMusic isVoiceoverPlaying={isVoiceoverPlaying} />
        <button className="icon-button" type="button" aria-label="Buka menu">
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
}

function PageHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return (
    <div className="page-header-banner">
      <button type="button" className="page-header-back" onClick={onBack} aria-label="Kembali ke beranda">
        <ArrowRight size={18} className="flip" />
        <span>Beranda</span>
      </button>
      <div className="page-header-text">
        <h1 className="page-header-title">{title}</h1>
        <p className="page-header-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}

function Hero() {
  const heroFront = museums[6];
  const heroMid = museums[15];
  const heroBack = museums[0];

  return (
    <section id="top" className="hero-section section-pad">
      <div className="hero-atmosphere" aria-hidden="true" />
      <span className="hero-sticker s-asterisk" aria-hidden="true">✺</span>
      <div className="hero-grid">
        <div className="hero-card reveal-card">
          <p className="eyebrow"><span /> Pameran Bermain · Tur 360°</p>
          <h1>
            Jelajahi Museum <span className="brush">Mpu Tantular</span> dalam 360°
          </h1>
          <p className="hero-copy">Susuri 23 titik panorama asli Museum Mpu Tantular di Sidoarjo — mulai dari gerbang masuk, percabangan rute, ruang pamer, hingga area tangga.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#tour-tour"><Compass size={20} /> Mulai Tur 360</a>
            <a className="button button-ghost" href="#museums"><Landmark size={20} /> Jelajahi Museum</a>
          </div>
          {/* a11y: <section> accepts aria-label natively (div does not) */}
          <section className="hero-proof" aria-label="Sorotan Museum360">
            <span><Compass size={22} /> 23 titik<br /><small>Rute Mpu Tantular</small></span>
            <span><Sparkles size={22} /> Panorama asli<br /><small>8000×4000 px</small></span>
            <span><MapPin size={22} /> Sidoarjo<br /><small>Jawa Timur</small></span>
          </section>
        </div>

        <aside className="hero-visual" aria-label="Cuplikan panorama">
          <span className="hero-stamp" aria-hidden="true">
            <span>Pameran</span>
            <strong>Mpu Tantular</strong>
            <span>Est. 1974</span>
          </span>
          <span className="hero-live-badge" aria-hidden="true">
            <span className="live-dot" /> Live 360°
          </span>

          <figure className="polaroid polaroid-back" aria-hidden="true">
            <span className="polaroid-photo" style={{ backgroundImage: `url(${heroBack.image})` }} />
            <figcaption>Gerbang Masuk</figcaption>
          </figure>

          <figure className="polaroid polaroid-mid" aria-hidden="true">
            <span className="polaroid-photo" style={{ backgroundImage: `url(${heroMid.image})` }} />
            <figcaption>Tangga Lantai 2</figcaption>
          </figure>

          <figure className="polaroid polaroid-front">
            <span className="polaroid-tape" aria-hidden="true" />
            <span className="polaroid-photo" style={{ backgroundImage: `url(${heroFront.image})` }}>
              <span className="polaroid-corner" aria-hidden="true">
                <Compass size={14} strokeWidth={2.6} />
              </span>
            </span>
            <figcaption>
              <strong>Ruang Pamer Utama</strong>
              <small>Titik 5 dari 23</small>
            </figcaption>
          </figure>

          <span className="hero-arrow" aria-hidden="true">
            <svg viewBox="0 0 80 80" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M8 60 C 24 30, 50 18, 70 22" />
              <path d="M62 14 L 70 22 L 62 30" />
            </svg>
          </span>
        </aside>
      </div>
    </section>
  );
}

function FeaturedMuseum({ museums: featured, activeId, onSelect }: { museums: Museum[]; activeId: string; onSelect: (museum: Museum) => void }) {
  return (
    <section id="museums" className="museum-section section-pad">
      <div className="section-heading editorial-heading">
        <p className="eyebrow"><span /> Rute 360 Museum Mpu Tantular</p>
        <h2>Jelajahi <span className="brush">Seluruh Rute</span> Museum</h2>
        <p>Setiap kartu menggunakan gambar panorama asli 8000×4000 yang kamu sediakan untuk Museum Mpu Tantular.</p>
        <a className="text-link" href="#tour-tour">Buka titik rute <ArrowRight size={18} /></a>
      </div>
      <div className="museum-grid">
        {featured.map((museum, index) => (
          <button
            type="button"
            className={`museum-card ${museum.id === activeId ? 'active' : ''}`}
            key={museum.id}
            onClick={() => onSelect(museum)}
          >
            <span
              className={`museum-thumb ${museum.accent}`}
              aria-hidden="true"
              style={{ backgroundImage: `linear-gradient(180deg, rgba(42, 27, 18, 0.05), rgba(42, 27, 18, 0.55)), url(${museum.image})` }}
            >
              <span className="card-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="tag-pill"><Landmark size={14} /> {museum.category}</span>
            </span>
            <div className="museum-card-body">
              <h3>{museum.highlight}</h3>
              <p className="location"><MapPin size={15} /> {museum.city}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function TourSection({ activeMuseum, museums: scenes, onSelect, visitedArtifacts, onArtifactSelect, isVoiceoverPlaying, onTTSPlay, onTTSPause }: { activeMuseum: Museum; museums: Museum[]; onSelect: (museum: Museum) => void; visitedArtifacts: Set<string>; onArtifactSelect: (artifact: Artifact) => void; isVoiceoverPlaying: boolean; onTTSPlay?: () => void; onTTSPause?: () => void }) {
  const activeIndex = scenes.findIndex((s) => s.id === activeMuseum.id);
  const total = scenes.length;
  const prevScene = activeIndex > 0 ? scenes[activeIndex - 1] : null;
  const nextScene = activeIndex < total - 1 ? scenes[activeIndex + 1] : null;
  const sceneById = useMemo(() => new Map(scenes.map((s) => [s.id, s])), [scenes]);
  const forwardHotspots = activeMuseum.hotspots.filter((h) => h.label !== 'Kembali');
  const sceneArtifacts = artifactsByScene[activeMuseum.id] ?? [];
  const sceneVisitedCount = sceneArtifacts.filter((a) => visitedArtifacts.has(a.id)).length;
  const visitedCount = visitedArtifacts.size;
  const categoryOrder = ['Gerbang Masuk', 'Orientasi Rute', 'Jalur Galeri', 'Galeri Atas'] as const;
  const categorySlug: Record<string, string> = {
    'Gerbang Masuk': 'cat-gerbang',
    'Orientasi Rute': 'cat-orientasi',
    'Jalur Galeri': 'cat-galeri',
    'Galeri Atas': 'cat-galeri-atas',
  };
  const grouped = scenes.reduce<Record<string, Museum[]>>((acc, scene) => {
    const list = acc[scene.category] ?? [];
    list.push(scene);
    acc[scene.category] = list;
    return acc;
  }, {});
  const stripPrefix = (label: string) => label.replace(/^Area\s+\d+(?:[a-z-]*)?\s*·\s*/i, '');

  const handleSelectWithFullscreen = useCallback((scene: Museum) => {
    onSelect(scene);
    const stage = document.querySelector('.panorama-stage') as HTMLElement | null;
    if (stage && !document.fullscreenElement) {
      stage.requestFullscreen().catch(() => {});
    }
  }, [onSelect]);

  return (
    <section id="tour-tour" className="tour-section section-pad">
      <div className="tour-copy">
        <p className="eyebrow"><span /> Museum Mpu Tantular Tur 360</p>
        <h2 className="tour-headline">Masuk ke <span className="brush">Pameran</span></h2>
        <p className="tour-copy-text">Pilih titik rute, lalu geser viewer 360° untuk melihat panorama museum yang sebenarnya.</p>
        <div className="scene-groups">
          {categoryOrder.map((cat) => {
            const list = grouped[cat] ?? [];
            if (list.length === 0) return null;
            return (
              <div className="scene-group" key={cat}>
                <p className={`scene-group-title ${categorySlug[cat]}`}>
                  <span className="cat-dot" aria-hidden="true" />
                  <span>{cat}</span>
                  <span className="cat-count">{list.length}</span>
                </p>
                <div className="scene-pills">
                  {list.map((scene) => {
                    const idx = scenes.findIndex((s) => s.id === scene.id);
                    const isActive = scene.id === activeMuseum.id;
                    const sceneArtifactCount = artifactsByScene[scene.id]?.length ?? 0;
                    return (
                      <button
                        type="button"
                        key={scene.id}
                        className={`scene-pill ${categorySlug[cat]} ${isActive ? 'active' : ''}`}
                        onClick={() => handleSelectWithFullscreen(scene)}
                      >
                        <span className="pill-num">{String(idx + 1).padStart(2, '0')}</span>
                        <span className="pill-label">{stripPrefix(scene.highlight)}</span>
                        {sceneArtifactCount > 0 ? (
                          // a11y: role="img" memberi labelable name pada span agar aria-label valid
                          <span className="pill-artifact-badge" role="img" aria-label={`${sceneArtifactCount} artefak di scene ini`}>
                            <Sparkles size={10} strokeWidth={2.6} aria-hidden="true" />
                            {sceneArtifactCount}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TourViewer
        museum={activeMuseum}
        museums={scenes}
        onSelect={handleSelectWithFullscreen}
        artifacts={sceneArtifacts}
        visitedArtifacts={visitedArtifacts}
        onArtifactSelect={onArtifactSelect}
        isVoiceoverPlaying={isVoiceoverPlaying}
      />

      <aside className="current-scene">
        <div className="scene-progress">
          <p className="eyebrow small">Progres Tur</p>
          <p className="progress-text">
            <strong>Titik {activeIndex + 1}</strong> <span>dari {total}</span>
          </p>
          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${((activeIndex + 1) / total) * 100}%` }} />
          </div>
        </div>

        <div className="artifact-progress">
          <span className="round-icon artifact-round"><Sparkles size={16} /></span>
          <div className="artifact-progress-text">
            <p className="micro-label">Artefak Ditemukan</p>
            <p className="artifact-count">
              <strong>{visitedCount}</strong> <span>/ {totalArtifacts} total</span>
            </p>
            {sceneArtifacts.length > 0 ? (
              <p className="artifact-room">Di ruangan ini: <strong>{sceneVisitedCount}/{sceneArtifacts.length}</strong></p>
            ) : (
              <p className="artifact-room muted">Tidak ada artefak di ruangan ini</p>
            )}
          </div>
        </div>

        <div className="scene-header">
          <span className="round-icon"><Landmark size={20} /></span>
          <div>
            <p className="eyebrow small">Titik Saat Ini</p>
            <h3>{activeMuseum.highlight}</h3>
            <p className="scene-meta"><MapPin size={14} /> {activeMuseum.city}, {activeMuseum.province}</p>
            <div className="scene-tts-wrapper">
              <TextToSpeechButton text={`${activeMuseum.highlight}. ${activeMuseum.description}`} onPlay={onTTSPlay} onPause={onTTSPause} />
            </div>
          </div>
        </div>

        {forwardHotspots.length > 0 && (
          <div className="scene-routes">
            <p className="micro-label">Jalan ke</p>
            <ul>
              {forwardHotspots.map((h) => {
                const target = sceneById.get(h.targetId);
                if (!target) return null;
                return (
                  <li key={`${h.targetId}-${h.label}`}>
                    <button type="button" className="route-link" onClick={() => handleSelectWithFullscreen(target)}>
                      <span className="route-thumb" style={{ backgroundImage: `url(${target.image})` }} aria-hidden="true" />
                      <span className="route-text">
                        <span className="route-label">{h.label}</span>
                        <span className="route-target">{stripPrefix(target.highlight)}</span>
                      </span>
                      <ArrowRight size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="scene-nav">
          <button
            type="button"
            className="nav-step"
            disabled={!prevScene}
            onClick={() => prevScene && handleSelectWithFullscreen(prevScene)}
          >
            <ArrowRight size={16} className="flip" />
            <span>
              <small>Sebelumnya</small>
              {prevScene ? stripPrefix(prevScene.highlight) : 'Awal rute'}
            </span>
          </button>
          <button
            type="button"
            className="nav-step nav-next"
            disabled={!nextScene}
            onClick={() => nextScene && handleSelectWithFullscreen(nextScene)}
          >
            <span>
              <small>Berikutnya</small>
              {nextScene ? stripPrefix(nextScene.highlight) : 'Akhir rute'}
            </span>
            <ArrowRight size={16} />
          </button>
        </div>
      </aside>
    </section>
  );
}

function AudienceSection() {
  const icons = [GraduationCap, Ticket, BookOpen, UsersRound];

  return (
    <section id="stories" className="audience-section section-pad">
      <div className="rhythm-line" aria-hidden="true"><span>Jelajahi</span><span>Temukan</span><span>Terhubung</span></div>
      <div className="section-heading audience-heading">
        <p className="eyebrow"><span /> Museum Mpu Tantular | Kunjungan Digital</p>
        <h2>Dibangun dari <span className="brush">Foto Asli</span> Museum</h2>
        <p>Website ini sekarang menjadikan scene 360 asli Mpu Tantular sebagai pusat pengalaman, dibungkus dalam pameran bermain yang ramah dijelajah.</p>
      </div>
      <div className="benefit-grid">
        {audienceBenefits.map((benefit, index) => {
          const Icon = icons[index];
          return (
            <article className="benefit-card" key={benefit.title}>
              <span className="round-icon"><Icon size={28} /></span>
              <div>
                <h3>{benefit.title}</h3>
                <p>{benefit.copy}</p>
              </div>
            </article>
          );
        })}
      </div>
      <div className="metrics-strip">
        <strong>{museumProfile.sceneCount}<span>Titik Panorama</span></strong>
        <strong>360°<span>Sudut Pandang</span></strong>
        <strong><MonitorSmartphone size={48} /><span>Semua Perangkat</span></strong>
      </div>
    </section>
  );
}

function GalleryKunjungiSection() {
  const icons = [Sparkles, Building2, BookOpen, MapPin];

  return (
    <section id="visit" className="gallery-visit section-pad">
      <div className="gallery-panel">
        <div className="section-heading compact">
          <p className="eyebrow"><span /> Galeri Warisan</p>
          <h2>Polaroid <span className="brush">Rute Museum</span></h2>
          <p>Ringkasan visual berbasis galeri dari frame pilihan dalam kumpulan panorama Museum Mpu Tantular.</p>
        </div>
        <div className="gallery-grid">
          {galleryItems.map((item, index) => {
            const Icon = icons[index];
            return (
              <article
                className={`gallery-card gallery-${index + 1}`}
                key={item.title}
                style={{ backgroundImage: `linear-gradient(180deg, rgba(42, 27, 18, 0.04), rgba(42, 27, 18, 0.32)), url(${item.image})` }}
              >
                <div className="gallery-overlay">
                  <Icon size={22} />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </div>
                  <ArrowRight size={20} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <aside className="visit-card">
        <span className="round-icon"><CalendarDays size={24} /></span>
        <h2>Rencanakan <span className="brush">Kunjungan</span></h2>
        <p>Pratinjau rute dibuat dari foto yang kamu berikan; pastikan jam buka dan tiket melalui sumber resmi museum sebelum produksi.</p>
        <div className="visit-grid">
          <InfoTile icon={Clock3} title="Jam Buka" text="Cek jam operasional terbaru melalui kanal resmi Museum Mpu Tantular." />
          <InfoTile icon={MapPin} title="Lokasi" text="Sidoarjo, Jawa Timur — tambahkan tautan peta resmi sebelum produksi." />
          <InfoTile icon={Ticket} title="Durasi" text="23 titik panorama untuk rute virtual." />
          <InfoTile icon={BookOpen} title="Fokus Koleksi" text="Scene rute, ruang pamer, akses, dan transisi tangga." />
        </div>
      </aside>
      <div className="final-cta">
        <p>Mulai dari rute 360°, lalu lanjutkan kunjungan langsung ke Museum Mpu Tantular.</p>
        <a className="button button-primary" href="#tour-tour"><Compass size={19} /> Mulai Tur</a>
        <a className="button button-ghost" href="#museums"><BookOpen size={19} /> Lihat Panduan Museum</a>
      </div>
      <footer className="footer-line">
        <strong>Museum360 Nusantara</strong>
        <span>Rute 360 Museum Mpu Tantular didukung oleh aset panorama milikmu.</span>
      </footer>
    </section>
  );
}

function InfoTile({ icon: Icon, title, text }: { icon: typeof Clock3; title: string; text: string }) {
  return (
    <article className="info-tile">
      <Icon size={22} />
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function ArtifactModal({ artifact, visited, onClose, onVoiceoverPlay, onVoiceoverPause }: { artifact: Artifact; visited: boolean; onClose: () => void; onVoiceoverPlay?: () => void; onVoiceoverPause?: () => void }) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const updateTarget = () => {
      setPortalTarget((document.fullscreenElement as HTMLElement) ?? document.body);
    };
    updateTarget();
    document.addEventListener('fullscreenchange', updateTarget);
    return () => document.removeEventListener('fullscreenchange', updateTarget);
  }, []);

  // a11y: simpan fokus sebelumnya lalu pindahkan ke tombol tutup; kembalikan saat ditutup
  useEffect(() => {
    if (!portalTarget) return;
    previouslyFocusedRef.current = (document.activeElement as HTMLElement | null) ?? null;
    const frame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });
    return () => {
      window.cancelAnimationFrame(frame);
      const target = previouslyFocusedRef.current;
      if (target && typeof target.focus === 'function') {
        target.focus();
      }
    };
  }, [portalTarget]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // a11y: focus trap — Tab/Shift+Tab berputar dalam dialog
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = (document.activeElement as HTMLElement | null) ?? null;
      // Jika fokus keluar dari dialog, kembalikan ke elemen pertama
      if (!dialogRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
        return;
      }
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const hasPhotos = artifact.photos.length > 0;
  const hasCards = artifact.cards.length > 0;
  const description = artifact.description || 'Artefak dari Museum Mpu Tantular';

  if (!portalTarget) return null;

  return createPortal(
    <button
      type="button"
      className="artifact-modal-backdrop"
      onClick={(e) => {
        // Tutup hanya saat klik langsung pada backdrop, bukan anak dialognya
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label="Tutup detail artefak"
    >
      <div
        ref={dialogRef}
        className="artifact-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="artifact-modal-title"
        aria-describedby="artifact-modal-desc"
      >
        <span className="artifact-sheet-handle" aria-hidden="true" />
        <header className="artifact-modal-head">
          <div>
            <p className="eyebrow small"><Sparkles size={12} /> Artefak Museum Mpu Tantular</p>
            <h3 id="artifact-modal-title">{artifact.name}</h3>
            <p id="artifact-modal-desc" className="artifact-modal-description">{description}</p>
            {visited ? (
              <p className="artifact-status visited"><Check size={14} /> Sudah dilihat</p>
            ) : (
              <p className="artifact-status">Baru ditemukan</p>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="artifact-close"
            onClick={onClose}
            aria-label="Tutup detail artefak"
          >
            <X size={22} />
          </button>
        </header>
        <div className="artifact-modal-body">
          {/* Voiceover (Tugas 10) */}
          <ArtifactVoiceover
            src={artifact.voiceover || undefined}
            title={artifact.name}
            onPlay={onVoiceoverPlay}
            onPause={onVoiceoverPause}
          />
          {hasPhotos && (
            <section className="artifact-pane">
              <p className="micro-label">Artefak</p>
              <div className="artifact-photo-grid">
                {artifact.photos.map((src, i) => (
                  <a key={src} href={src} target="_blank" rel="noreferrer" className="artifact-photo">
                    <img src={src} alt={`${artifact.name} foto ${i + 1}`} loading="lazy" />
                  </a>
                ))}
              </div>
            </section>
          )}
          {hasCards && (
            <section className="artifact-pane">
              <p className="micro-label">Kartu Pengertian</p>
              <div className="artifact-photo-grid">
                {artifact.cards.map((src, i) => (
                  <a key={src} href={src} target="_blank" rel="noreferrer" className="artifact-photo card">
                    <img src={src} alt={`Pengertian ${artifact.name} ${i + 1}`} loading="lazy" />
                  </a>
                ))}
              </div>
              <p className="artifact-hint">Klik gambar untuk membuka ukuran penuh dan membaca deskripsi.</p>
            </section>
          )}
          {!hasPhotos && !hasCards && (
            <p className="artifact-empty">Belum ada gambar untuk artefak ini.</p>
          )}
        </div>
      </div>
    </button>,
    portalTarget,
  );
}

export default App;
