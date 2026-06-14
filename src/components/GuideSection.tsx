import {
  Compass,
  Navigation,
  RotateCcw,
  Sparkles,
  Accessibility,
  Music,
  Volume2,
  Type,
  ArrowUpFromLine,
} from 'lucide-react';

const guideSteps = [
  {
    icon: Compass,
    title: 'Mulai Tur 360°',
    description:
      'Tekan tombol "Mulai Tur 360" di beranda atau pilih salah satu titik rute dari panel navigasi untuk memulai perjalanan virtual Anda melalui Museum Mpu Tantular.',
    color: 'terracotta',
  },
  {
    icon: Navigation,
    title: 'Navigasi Antar-Ruangan',
    description:
      'Gunakan tombol panah (hotspot) yang muncul di dalam panorama untuk berpindah antar-ruangan. Setiap hotspot memiliki label yang menunjukkan tujuan berikutnya.',
    color: 'saffron',
  },
  {
    icon: RotateCcw,
    title: 'Jelajahi Panorama 360°',
    description:
      'Geser atau seret panorama ke segala arah untuk melihat sekeliling ruangan dalam sudut pandang 360 derajat penuh. Gunakan kontrol zoom untuk melihat detail lebih dekat.',
    color: 'jade',
  },
  {
    icon: Sparkles,
    title: 'Temukan Artefak',
    description:
      'Klik ikon artefak yang muncul di setiap ruangan untuk melihat foto, kartu informasi, dan mendengarkan narasi suara tentang koleksi museum yang bersejarah.',
    color: 'indigo',
  },
  {
    icon: Accessibility,
    title: 'Fitur Aksesibilitas',
    description:
      'Aktifkan mode kontras tinggi, ubah ukuran teks, atau gunakan fitur text-to-speech untuk mendengarkan deskripsi setiap ruangan. Widget aksesibilitas tersedia di sudut kanan bawah.',
    color: 'terracotta',
  },
];

const quickTips = [
  {
    icon: Music,
    title: 'Musik Latar',
    description: 'Musik latar otomatis diputar untuk mengiringi tur Anda. Atur volume melalui ikon musik di navigasi atas.',
  },
  {
    icon: Volume2,
    title: 'Text-to-Speech',
    description: 'Tekan tombol suara di panel informasi untuk mendengarkan deskripsi ruangan yang sedang Anda kunjungi.',
  },
  {
    icon: Type,
    title: 'Ukuran Teks',
    description: 'Sesuaikan ukuran teks melalui widget aksesibilitas di pojok kanan bawah layar.',
  },
  {
    icon: ArrowUpFromLine,
    title: 'Tautan Loncat',
    description: 'Gunakan tab pada keyboard untuk menemukan tautan loncat yang mempercepat navigasi.',
  },
];

export default function GuideSection() {
  return (
    <section id="panduan" className="guide-section section-pad">
      <div className="section-heading editorial-heading">
        <p className="eyebrow">
          <span /> Panduan Penggunaan
        </p>
        <h2>
          Cara Menjelajah <span className="brush">Museum360</span>
        </h2>
        <p>
          Ikuti langkah-langkah berikut untuk mendapatkan pengalaman terbaik
          saat menjelajahi Museum Mpu Tantular secara virtual.
        </p>
      </div>

      <div className="guide-steps">
        {guideSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <article className={`guide-step guide-step--${step.color}`} key={step.title}>
              <span className="guide-step-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={`guide-step-icon guide-step-icon--${step.color}`}>
                <Icon size={26} />
              </span>
              <div className="guide-step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="guide-tips">
        <div className="guide-tips-header">
          <h3>Tips Cepat</h3>
          <p>Fitur tambahan untuk pengalaman yang lebih nyaman</p>
        </div>
        <div className="guide-tips-grid">
          {quickTips.map((tip) => {
            const Icon = tip.icon;
            return (
              <article className="guide-tip-card" key={tip.title}>
                <span className="guide-tip-icon">
                  <Icon size={20} />
                </span>
                <div>
                  <h4>{tip.title}</h4>
                  <p>{tip.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
