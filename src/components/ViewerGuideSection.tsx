import {
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronDown,
  Circle,
  Compass,
  CornerDownRight,
  Eye,
  Fullscreen,
  Hand,
  Keyboard,
  ListOrdered,
  Maximize2,
  Monitor,
  MousePointer2,
  Move,
  Music,
  Navigation,
  Pin,
  Play,
  ScrollText,
  Search,
  Smartphone,
  Sparkles,
  Volume2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

/* ── Keyboard key visual ── */
function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="vg-kbd">{children}</kbd>;
}

/* ── Collapsible detail group ── */
function GuideBlock({
  id,
  icon: Icon,
  color,
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  id: string;
  icon: React.ComponentType<{ size?: number }>;
  color: 'terracotta' | 'saffron' | 'jade' | 'indigo';
  title: string;
  subtitle: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className={`vg-block vg-block--${color}`} id={id} open={defaultOpen || undefined}>
      <summary className="vg-block-summary">
        <span className={`vg-block-icon vg-block-icon--${color}`}>
          <Icon size={22} />
        </span>
        <span className="vg-block-text">
          <strong>{title}</strong>
          <span className="vg-block-subtitle">{subtitle}</span>
        </span>
        <ChevronDown size={20} className="vg-block-chevron" aria-hidden="true" />
      </summary>
      <div className="vg-block-body">{children}</div>
    </details>
  );
}

/* ── Control row ── */
function ControlRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="vg-control-row">
      <span className="vg-control-icon"><Icon size={18} /></span>
      <div className="vg-control-body">
        <span className="vg-control-label">{label}</span>
        <span className="vg-control-desc">{children}</span>
      </div>
    </div>
  );
}

export default function ViewerGuideSection() {
  return (
    <section className="vg-section section-pad" id="panduan-viewer">
      <div className="section-heading editorial-heading">
        <p className="eyebrow">
          <span /> Panduan Viewer 360°
        </p>
        <h2>
          Cara Menggunakan <span className="brush">Panorama 360°</span>
        </h2>
        <p>
          Panduan lengkap untuk menjelajahi 23 ruangan Museum Mpu Tantular
          dalam tampilan panorama 360 derajat — mulai dari kontrol dasar
          hingga fitur aksesibilitas.
        </p>
      </div>

      {/* ── Ringkasan Visual ── */}
      <div className="vg-overview">
        <div className="vg-overview-card">
          <Compass size={28} />
          <strong>Putar Pandangan</strong>
          <span>Seret, sentuh, atau gunakan keyboard</span>
        </div>
        <div className="vg-overview-card">
          <Search size={28} />
          <strong>Perbesar / Perkecil</strong>
          <span>Zoom untuk melihat detail artefak</span>
        </div>
        <div className="vg-overview-card">
          <Navigation size={28} />
          <strong>Pindah Ruangan</strong>
          <span>Hotspot, panel samping, atau navigasi berurutan</span>
        </div>
        <div className="vg-overview-card">
          <Sparkles size={28} />
          <strong>Jelajahi Artefak</strong>
          <span>Foto, kartu info, dan narasi suara</span>
        </div>
      </div>

      {/* ── 1. Kontrol Panorama ── */}
      <GuideBlock
        id="vg-panorama"
        icon={Move}
        color="terracotta"
        title="Kontrol Panorama"
        subtitle="Cara memutar dan memperbesar tampilan 360°"
        defaultOpen
      >
        <div className="vg-subsection">
          <h4 className="vg-subtitle"><MousePointer2 size={16} /> Mouse (Desktop)</h4>
          <ControlRow icon={Hand} label="Memutar pandangan">
            Klik kiri dan tahan, lalu seret ke segala arah — kiri, kanan, atas, bawah — untuk melihat sekeliling ruangan secara 360°.
          </ControlRow>
          <ControlRow icon={ZoomIn} label="Memperbesar (zoom in)">
            Tahan tombol <Kbd>Ctrl</Kbd> lalu gulirkan roda mouse ke atas. Anda juga bisa menggunakan tombol <Kbd>+</Kbd> atau <Kbd>=</Kbd> pada keyboard.
          </ControlRow>
          <ControlRow icon={ZoomOut} label="Memperkecil (zoom out)">
            Tahan tombol <Kbd>Ctrl</Kbd> lalu gulirkan roda mouse ke bawah. Atau tekan tombol <Kbd>-</Kbd> pada keyboard.
          </ControlRow>
          <p className="vg-note">
            Catatan: Gulir tanpa Ctrl digunakan untuk menggulir halaman, bukan zoom panorama. Ini agar Anda tidak tidak sengaja mengubah zoom saat membaca.
          </p>
        </div>

        <div className="vg-subsection">
          <h4 className="vg-subtitle"><Smartphone size={16} /> Layar Sentuh (Mobile / Tablet)</h4>
          <ControlRow icon={Hand} label="Memutar pandangan">
            Sentuh dan geser dengan satu jari ke arah mana pun untuk memutar tampilan panorama.
          </ControlRow>
          <ControlRow icon={Pin} label="Memperbesar / memperkecil">
            Gunakan gerakan cubit dua jari (pinch) — lebarkan untuk zoom in, rapatkan untuk zoom out.
          </ControlRow>
        </div>

        <div className="vg-subsection">
          <h4 className="vg-subtitle"><Keyboard size={16} /> Keyboard (Desktop)</h4>
          <div className="vg-keyboard-visual">
            <div className="vg-keyboard-row">
              <span className="vg-kbd-space" />
              <Kbd>W</Kbd>
              <span className="vg-kbd-label">Atas</span>
              <span className="vg-kbd-space" />
            </div>
            <div className="vg-keyboard-row">
              <Kbd>A</Kbd>
              <span className="vg-kbd-label">Kiri</span>
              <Kbd>S</Kbd>
              <span className="vg-kbd-label">Bawah</span>
              <Kbd>D</Kbd>
              <span className="vg-kbd-label">Kanan</span>
            </div>
          </div>
          <p className="vg-note">
            Anda juga bisa menggunakan tombol panah <Kbd>←</Kbd> <Kbd>↑</Kbd> <Kbd>↓</Kbd> <Kbd>→</Kbd> dengan fungsi yang sama.
            Tahan tombol untuk memutar secara halus dan berkelanjutan.
          </p>
          <div className="vg-keyboard-extras">
            <div className="vg-keyboard-extra">
              <Kbd>+</Kbd> <Kbd>-</Kbd>
              <span>Zoom in / Zoom out</span>
            </div>
            <div className="vg-keyboard-extra">
              <Kbd>Home</Kbd>
              <span>Reset ke posisi awal</span>
            </div>
          </div>
        </div>

        <div className="vg-subsection">
          <h4 className="vg-subtitle"><Fullscreen size={16} /> Tombol Navbar Bawaan</h4>
          <p>
            Di bagian bawah viewer terdapat toolbar dengan empat tombol:
          </p>
          <div className="vg-navbar-items">
            <span className="vg-navbar-item"><ZoomIn size={16} /> <strong>Zoom</strong> — Perbesar/perkecil</span>
            <span className="vg-navbar-item"><Move size={16} /> <strong>Move</strong> — Petunjuk geser</span>
            <span className="vg-navbar-item"><ScrollText size={16} /> <strong>Caption</strong> — Nama ruangan</span>
            <span className="vg-navbar-item"><Maximize2 size={16} /> <strong>Fullscreen</strong> — Layar penuh</span>
          </div>
        </div>
      </GuideBlock>

      {/* ── 2. Navigasi Hotspot ── */}
      <GuideBlock
        id="vg-hotspot"
        icon={ArrowUpRight}
        color="saffron"
        title="Navigasi Hotspot"
        subtitle="Tombol panah interaktif di dalam panorama"
      >
        <p className="vg-intro">
          Saat Anda berada di dalam panorama 360°, Anda akan melihat <strong>tombol panah melayang</strong> (hotspot) yang berfungsi untuk berpindah ke ruangan lain. Setiap hotspot memiliki label nama ruangan tujuan.
        </p>

        <div className="vg-hotspot-types">
          <div className="vg-hotspot-type">
            <span className="vg-hotspot-arrow" style={{ '--hs-rotate': '0deg' } as React.CSSProperties}>
              <ArrowUp size={24} strokeWidth={2.6} />
            </span>
            <div>
              <strong>Maju (Forward)</strong>
              <span>Panah mengarah ke atas — berpindah ke ruangan di depan Anda.</span>
            </div>
          </div>
          <div className="vg-hotspot-type">
            <span className="vg-hotspot-arrow" style={{ '--hs-rotate': '-90deg' } as React.CSSProperties}>
              <ArrowUp size={24} strokeWidth={2.6} />
            </span>
            <div>
              <strong>Kiri (Left)</strong>
              <span>Panah mengarah ke kiri — berpindah ke ruangan di sisi kiri.</span>
            </div>
          </div>
          <div className="vg-hotspot-type">
            <span className="vg-hotspot-arrow" style={{ '--hs-rotate': '90deg' } as React.CSSProperties}>
              <ArrowUp size={24} strokeWidth={2.6} />
            </span>
            <div>
              <strong>Kanan (Right)</strong>
              <span>Panah mengarah ke kanan — berpindah ke ruangan di sisi kanan.</span>
            </div>
          </div>
          <div className="vg-hotspot-type">
            <span className="vg-hotspot-arrow" style={{ '--hs-rotate': '180deg' } as React.CSSProperties}>
              <ArrowUp size={24} strokeWidth={2.6} />
            </span>
            <div>
              <strong>Kembali (Back)</strong>
              <span>Panah mengarah ke bawah — kembali ke ruangan sebelumnya.</span>
            </div>
          </div>
          <div className="vg-hotspot-type">
            <span className="vg-hotspot-arrow" style={{ '--hs-rotate': '-45deg' } as React.CSSProperties}>
              <ArrowUp size={24} strokeWidth={2.6} />
            </span>
            <div>
              <strong>Atas / Keluar</strong>
              <span>Untuk naik ke lantai atas atau keluar dari area tertentu.</span>
            </div>
          </div>
        </div>

        <div className="vg-tip-card">
          <Eye size={18} />
          <div>
            <strong>Hotspot mengikuti pandangan Anda</strong>
            <span>Posisi hotspot akan bergerak secara 3D mengikuti arah pandangan Anda. Jika hotspot tidak terlihat, coba putar pandangan ke arah lain.</span>
          </div>
        </div>
      </GuideBlock>

      {/* ── 3. Navigasi Scene ── */}
      <GuideBlock
        id="vg-scene"
        icon={ListOrdered}
        color="jade"
        title="Navigasi Antar-Scene"
        subtitle="4 cara berpindah antar-ruangan museum"
      >
        <div className="vg-scene-methods">
          <div className="vg-scene-method">
            <span className="vg-scene-num">1</span>
            <div>
              <strong>Hotspot di Panorama</strong>
              <p>Klik tombol panah (hotspot) yang muncul di dalam tampilan panorama. Ini cara paling natural — seperti berjalan langsung ke ruangan sebelah.</p>
            </div>
          </div>

          <div className="vg-scene-method">
            <span className="vg-scene-num">2</span>
            <div>
              <strong>Panel Samping (Sidebar)</strong>
              <p>Di sisi kiri layar terdapat daftar 23 scene yang dikelompokkan dalam 4 kategori:</p>
              <ul className="vg-scene-categories">
                <li><span className="vg-cat-dot vg-cat-dot--jade" /> <strong>Gerbang Masuk</strong> — Titik awal tur</li>
                <li><span className="vg-cat-dot vg-cat-dot--indigo" /> <strong>Orientasi Rute</strong> — Area penghubung (4 ruangan)</li>
                <li><span className="vg-cat-dot vg-cat-dot--terracotta" /> <strong>Jalur Galeri</strong> — Ruang pameran utama (10 ruangan)</li>
                <li><span className="vg-cat-dot vg-cat-dot--saffron" /> <strong>Galeri Atas</strong> — Lantai atas museum (7 ruangan)</li>
              </ul>
              <p>Klik langsung nama ruangan untuk melompat ke sana.</p>
            </div>
          </div>

          <div className="vg-scene-method">
            <span className="vg-scene-num">3</span>
            <div>
              <strong>Tautan Rute (&ldquo;Jalan ke&rdquo;)</strong>
              <p>Di panel samping, bagian &ldquo;Jalan ke&rdquo; menampilkan semua ruangan yang terhubung dari posisi Anda saat ini, lengkap dengan gambar thumbnail. Klik untuk berpindah.</p>
            </div>
          </div>

          <div className="vg-scene-method">
            <span className="vg-scene-num">4</span>
            <div>
              <strong>Tombol Sebelumnya / Berikutnya</strong>
              <p>Di bagian bawah panel samping terdapat tombol navigasi berurutan untuk menjelajahi scene satu per satu dari awal hingga akhir.</p>
            </div>
          </div>
        </div>
      </GuideBlock>

      {/* ── 4. Artefak ── */}
      <GuideBlock
        id="vg-artefak"
        icon={Sparkles}
        color="indigo"
        title="Menemukan Artefak"
        subtitle="Jelajahi koleksi museum di setiap ruangan"
      >
        <div className="vg-subsection">
          <h4 className="vg-subtitle"><Sparkles size={16} /> Rail Artefak di Panorama</h4>
          <p>
            Di bagian bawah panorama terdapat <strong>strip artefak</strong> yang menampilkan semua koleksi yang ada di ruangan tersebut. Setiap kartu menampilkan thumbnail foto dan nama artefak.
          </p>
          <ControlRow icon={Eye} label="Melihat artefak">
            Klik kartu artefak untuk membuka modal detail yang berisi foto-foto, kartu informasi lengkap, dan narasi suara (jika tersedia).
          </ControlRow>
          <ControlRow icon={Check} label="Status dikunjungi">
            Artefak yang sudah Anda buka ditandai dengan ikon centang (✓) pada thumbnail. Status ini tersimpan otomatis di browser Anda.
          </ControlRow>
          <ControlRow icon={Circle} label="Penghitung artefak">
            Di pojok kiri atas strip, Anda dapat melihat berapa artefak yang sudah dilihat dari total artefak di ruangan tersebut (misal: 3/5).
          </ControlRow>
        </div>

        <div className="vg-subsection">
          <h4 className="vg-subtitle"><Play size={16} /> Narasi Suara (Voiceover)</h4>
          <p>
            Beberapa artefak memiliki narasi suara yang menjelaskan sejarah dan makna artefak tersebut.
            Tombol play/pause tersedia di dalam modal artefak. Saat narasi diputar, musik latar akan otomatis mengecil (ducking) agar Anda bisa mendengar dengan jelas.
          </p>
        </div>
      </GuideBlock>

      {/* ── 5. Fitur Audio ── */}
      <GuideBlock
        id="vg-audio"
        icon={Volume2}
        color="terracotta"
        title="Fitur Audio"
        subtitle="Musik latar, text-to-speech, dan narasi"
      >
        <div className="vg-subsection">
          <h4 className="vg-subtitle"><Music size={16} /> Musik Latar</h4>
          <p>
            Musik latar otomatis diputar untuk memberikan suasana saat Anda menjelajahi museum. Anda bisa mengontrol musik melalui <strong>3 tempat</strong>:
          </p>
          <ul className="vg-list">
            <li><strong>Toolbar viewer</strong> — Tombol ikon speaker di kanan atas panorama (label: &ldquo;Musik Aktif&rdquo; / &ldquo;Musik Nonaktif&rdquo;).</li>
            <li><strong>Header situs</strong> — Ikon musik di navigasi atas halaman.</li>
            <li><strong>Widget aksesibilitas</strong> — Toggle musik di widget sudut kanan bawah.</li>
          </ul>
          <p className="vg-note">
            Musik akan otomatis berhenti saat Anda memutar narasi suara artefak atau text-to-speech, lalu dilanjutkan kembali setelah selesai. Fitur ini disebut <strong>audio ducking</strong>.
          </p>
        </div>

        <div className="vg-subsection">
          <h4 className="vg-subtitle"><Volume2 size={16} /> Text-to-Speech (TTS)</h4>
          <p>
            Di panel informasi setiap ruangan, terdapat tombol <strong>Text-to-Speech</strong> yang akan membacakan deskripsi ruangan secara otomatis dalam bahasa Indonesia.
            Tekan tombol yang sama untuk menghentikan pembacaan.
          </p>
        </div>

        <div className="vg-subsection">
          <h4 className="vg-subtitle"><Volume2 size={16} /> Efek Stereo Pan</h4>
          <p>
            Musik latar memiliki efek stereo yang mengikuti arah pandangan Anda — saat menoleh ke kiri, suara sedikit lebih kuat di speaker kiri, dan sebaliknya. Ini menciptakan pengalaman audio yang lebih imersif.
          </p>
        </div>
      </GuideBlock>

      {/* ── 6. Layar Penuh ── */}
      <GuideBlock
        id="vg-fullscreen"
        icon={Maximize2}
        color="saffron"
        title="Mode Layar Penuh"
        subtitle="Nikmati panorama dalam tampilan penuh"
      >
        <p className="vg-intro">
          Mode layar penuh memberikan pengalaman paling imersif untuk menjelajahi panorama 360°.
        </p>
        <div className="vg-fs-methods">
          <div className="vg-fs-method">
            <Monitor size={22} />
            <div>
              <strong>Otomatis saat memilih scene</strong>
              <span>Saat Anda memilih scene dari panel samping, viewer akan otomatis meminta izin layar penuh.</span>
            </div>
          </div>
          <div className="vg-fs-method">
            <Maximize2 size={22} />
            <div>
              <strong>Tombol Fullscreen di navbar</strong>
              <span>Klik ikon layar penuh di toolbar bawah viewer untuk masuk/keluar mode layar penuh.</span>
            </div>
          </div>
          <div className="vg-fs-method">
            <Kbd>Esc</Kbd>
            <div>
              <strong>Keluar layar penuh</strong>
              <span>Tekan tombol <Kbd>Esc</Kbd> atau klik tombol keluar di pojok kanan atas browser.</span>
            </div>
          </div>
        </div>
      </GuideBlock>

      {/* ── 7. Aksesibilitas ── */}
      <GuideBlock
        id="vg-a11y"
        icon={Sparkles}
        color="jade"
        title="Fitur Aksesibilitas"
        subtitle="Desain inklusif untuk semua pengguna"
      >
        <div className="vg-subsection">
          <h4 className="vg-subtitle"><Sparkles size={16} /> Widget Aksesibilitas</h4>
          <p>
            Di <strong>sudut kanan bawah</strong> layar terdapat tombol aksesibilitas (ikon gerigi). Klik untuk membuka panel dengan opsi:
          </p>
          <ul className="vg-list">
            <li><strong>Mode Tunanetra</strong> — Memperbesar semua teks ke ukuran ekstra besar dan mengaktifkan pengumuman suara untuk setiap aksi.</li>
            <li><strong>Ukuran Teks</strong> — Siklus 3 tingkat: Default → Besar → Ekstra Besar. Berlaku untuk seluruh teks di situs.</li>
            <li><strong>Musik</strong> — Toggle cepat on/off musik latar.</li>
            <li><strong>Reset</strong> — Kembalikan semua pengaturan aksesibilitas ke default.</li>
          </ul>
          <p className="vg-note">
            Pengaturan aksesibilitas tersimpan di browser Anda dan akan otomatis diterapkan saat kunjungan berikutnya.
          </p>
        </div>

        <div className="vg-subsection">
          <h4 className="vg-subtitle"><Keyboard size={16} /> Navigasi Keyboard Lengkap</h4>
          <div className="vg-a11y-keys">
            <div className="vg-a11y-key">
              <Kbd>Tab</Kbd>
              <span>Berpindah antar-elemen interaktif</span>
            </div>
            <div className="vg-a11y-key">
              <Kbd>Enter</Kbd> <Kbd>Space</Kbd>
              <span>Mengaktifkan tombol atau tautan</span>
            </div>
            <div className="vg-a11y-key">
              <Kbd>Esc</Kbd>
              <span>Menutup modal atau popover</span>
            </div>
            <div className="vg-a11y-key">
              <Kbd>←</Kbd><Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>→</Kbd>
              <span>Memutar panorama (juga <Kbd>W</Kbd><Kbd>A</Kbd><Kbd>S</Kbd><Kbd>D</Kbd>)</span>
            </div>
            <div className="vg-a11y-key">
              <Kbd>+</Kbd> <Kbd>-</Kbd>
              <span>Zoom in / zoom out panorama</span>
            </div>
            <div className="vg-a11y-key">
              <Kbd>Home</Kbd>
              <span>Reset pandangan ke posisi awal</span>
            </div>
          </div>
        </div>

        <div className="vg-subsection">
          <h4 className="vg-subtitle"><ScrollText size={16} /> Katalog Teks Aksesibel</h4>
          <p>
            Di halaman Katalog tersedia versi teks lengkap dari semua 23 scene beserta artefaknya, ditampilkan dalam elemen <code>&lt;details&gt;</code> yang dapat dioperasikan dengan keyboard. Cocok untuk pengguna pembaca layar atau koneksi lambat.
          </p>
        </div>

        <div className="vg-subsection">
          <h4 className="vg-subtitle"><CornerDownRight size={16} /> Tautan Loncat (Skip Link)</h4>
          <p>
            Tekan <Kbd>Tab</Kbd> saat halaman pertama kali dimuat untuk menemukan tautan &ldquo;Lewati ke konten utama&rdquo; yang memungkinkan Anda melewati navigasi dan langsung ke konten.
          </p>
        </div>
      </GuideBlock>

      {/* ── Referensi Cepat Keyboard ── */}
      <div className="vg-ref">
        <div className="vg-ref-header">
          <Keyboard size={22} />
          <h3>Referensi Cepat Keyboard</h3>
          <p>Semua pintasan keyboard yang tersedia di viewer 360°</p>
        </div>
        <div className="vg-ref-grid">
          <div className="vg-ref-group">
            <h5>Rotasi Pandangan</h5>
            <div className="vg-ref-row">
              <span><Kbd>←</Kbd> atau <Kbd>A</Kbd></span>
              <span>Putar ke kiri</span>
            </div>
            <div className="vg-ref-row">
              <span><Kbd>→</Kbd> atau <Kbd>D</Kbd></span>
              <span>Putar ke kanan</span>
            </div>
            <div className="vg-ref-row">
              <span><Kbd>↑</Kbd> atau <Kbd>W</Kbd></span>
              <span>Putar ke atas</span>
            </div>
            <div className="vg-ref-row">
              <span><Kbd>↓</Kbd> atau <Kbd>S</Kbd></span>
              <span>Putar ke bawah</span>
            </div>
          </div>
          <div className="vg-ref-group">
            <h5>Zoom</h5>
            <div className="vg-ref-row">
              <span><Kbd>+</Kbd> atau <Kbd>=</Kbd></span>
              <span>Perbesar (zoom in)</span>
            </div>
            <div className="vg-ref-row">
              <span><Kbd>-</Kbd> atau <Kbd>_</Kbd></span>
              <span>Perkecil (zoom out)</span>
            </div>
          </div>
          <div className="vg-ref-group">
            <h5>Lainnya</h5>
            <div className="vg-ref-row">
              <span><Kbd>Home</Kbd></span>
              <span>Reset ke posisi awal</span>
            </div>
            <div className="vg-ref-row">
              <span><Kbd>Esc</Kbd></span>
              <span>Tutup modal / keluar layar penuh</span>
            </div>
            <div className="vg-ref-row">
              <span><Kbd>Tab</Kbd></span>
              <span>Berpindah elemen interaktif</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="vg-faq">
        <h3 className="vg-faq-title">Pertanyaan Umum</h3>

        <details className="vg-faq-item">
          <summary>Panorama tidak muncul atau hanya menampilkan warna gelap?</summary>
          <p>Pastikan koneksi internet Anda stabil karena gambar panorama berukuran besar perlu diunduh. Jika masih bermasalah, coba muat ulang halaman atau gunakan browser lain (Chrome, Firefox, atau Edge terbaru).</p>
        </details>

        <details className="vg-faq-item">
          <summary>Musik latar tidak terdengar?</summary>
          <p>Browser modern memerlukan interaksi pengguna terlebih dahulu (klik, sentuh, atau tekan tombol) sebelum memutar audio. Klik tombol &ldquo;Mulai Jelajahi&rdquo; atau ikon musik di toolbar viewer untuk mengaktifkan suara.</p>
        </details>

        <details className="vg-faq-item">
          <summary>Bagaimana cara berpindah ruangan?</summary>
          <p>Ada 4 cara: (1) Klik tombol panah (hotspot) di dalam panorama, (2) Klik nama ruangan di panel samping, (3) Klik tautan &ldquo;Jalan ke&rdquo; di panel info, atau (4) Gunakan tombol Sebelumnya/Berikutnya di bawah panel samping.</p>
        </details>

        <details className="vg-faq-item">
          <summary>Tampilan terlalu kecil di HP?</summary>
          <p>Aktifkan mode layar penuh melalui tombol fullscreen di toolbar viewer, atau putar perangkat ke mode lanskap (landscape) untuk tampilan yang lebih luas.</p>
        </details>

        <details className="vg-faq-item">
          <summary>Bagaimana cara mendengar narasi artefak?</summary>
          <p>Klik kartu artefak di strip bawah panorama untuk membuka detail. Jika tersedia, tombol play narasi akan muncul di dalam modal. Narasi akan memutar audio penjelasan tentang artefak tersebut.</p>
        </details>

        <details className="vg-faq-item">
          <summary>Keyboard shortcut tidak berfungsi?</summary>
          <p>Pastikan area panorama sedang dalam fokus (klik sekali di area panorama). Shortcut tidak berfungsi saat kursor berada di kolom pencarian atau input teks.</p>
        </details>
      </div>
    </section>
  );
}
