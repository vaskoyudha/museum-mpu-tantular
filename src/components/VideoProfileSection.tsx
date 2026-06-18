import { Film, ExternalLink, MapPin, Calendar, Users } from 'lucide-react';

const VIDEO_SOURCE = 'https://drive.google.com/file/d/1ikE26CQzipjkr2_eCNNUMO0Y5DgTxPq9/preview';
const VIDEO_TYPE: 'youtube' | 'local' | 'gdrive' = 'gdrive';

const videoHighlights = [
  { icon: MapPin, label: 'Sidoarjo', description: 'Lokasi museum di Jawa Timur' },
  { icon: Calendar, label: 'Est. 1974', description: 'Tahun pendirian museum' },
  { icon: Users, label: '23 Ruangan', description: 'Total titik panorama 360°' },
];

export default function VideoProfileSection() {
  const renderVideo = () => {
    if (!VIDEO_SOURCE) {
      return (
        <div className="video-profile-placeholder">
          <span className="video-profile-placeholder-icon">
            <Film size={48} />
          </span>
          <p className="video-profile-placeholder-title">Video Profil Museum</p>
          <p className="video-profile-placeholder-hint">
            Video profil akan ditampilkan di sini. Tambahkan file video ke{' '}
            <code>public/videos/</code> atau masukkan URL YouTube pada{' '}
            <code>VIDEO_SOURCE</code> di komponen ini.
          </p>
        </div>
      );
    }

    if (VIDEO_TYPE === 'youtube' || VIDEO_TYPE === 'gdrive') {
      return (
        <iframe
          className="video-profile-iframe"
          src={VIDEO_SOURCE}
          title="Video Profil Museum Mpu Tantular"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      );
    }

    // Local video
    return (
      <video
        className="video-profile-player"
        src={VIDEO_SOURCE}
        controls
        preload="metadata"
        playsInline
        poster="/images/mpu-tantular/01-1.webp"
      >
        <track kind="captions" label="Bahasa Indonesia" />
        Browser Anda tidak mendukung pemutaran video.
      </video>
    );
  };

  return (
    <section id="video-profil" className="video-profile-section section-pad">
      <div className="video-profile-layout">
        <div className="video-profile-info">
          <div className="section-heading editorial-heading">
            <p className="eyebrow">
              <span /> Video Profil
            </p>
            <h2>
              Mengenal <span className="brush">Museum Mpu Tantular</span>
            </h2>
            <p>
              Saksikan video profil untuk mengenal lebih dekat sejarah, koleksi,
              dan pesona Museum Mpu Tantular di Sidoarjo, Jawa Timur.
            </p>
          </div>
          <div className="video-profile-highlights">
            {videoHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <div className="video-profile-highlight" key={item.label}>
                  <span className="video-profile-highlight-icon">
                    <Icon size={18} />
                  </span>
                  <div>
                    <strong>{item.label}</strong>
                    <span>{item.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {VIDEO_SOURCE && (
            <a
              className="video-profile-external"
              href={
                VIDEO_TYPE === 'youtube'
                  ? VIDEO_SOURCE
                  : VIDEO_TYPE === 'gdrive'
                    ? 'https://drive.google.com/file/d/1ikE26CQzipjkr2_eCNNUMO0Y5DgTxPq9/view'
                    : '#'
              }
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={16} />
              Tonton di platform asli
            </a>
          )}
        </div>

        <div className="video-profile-frame">
          <span className="video-profile-frame-label" aria-hidden="true">
            <Film size={14} /> Video Profil
          </span>
          <div className="video-profile-player-wrapper">
            {renderVideo()}
          </div>
          <span className="video-profile-frame-caption" aria-hidden="true">
            Museum Mpu Tantular · Sidoarjo, Jawa Timur
          </span>
        </div>
      </div>
    </section>
  );
}
