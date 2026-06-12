export type Museum = {
  id: string;
  name: string;
  city: string;
  province: string;
  description: string;
  category: string;
  highlight: string;
  panorama?: string;
  image: string;
  accent: string;
  hotspots: TourHotspot[];
};

export type TourHotspot = {
  label: string;
  targetId: string;
  placement: 'forward' | 'left' | 'right' | 'back' | 'up' | 'exit';
  x: number;
  y: number;
  angle: number;
};

const sceneAssets = [
  ['1', 'Area 1 · Gerbang Masuk', '01-1.jpg', 'Gerbang merah besar Museum Mpu Tantular. Di depan terdapat papan nama museum, area parkir, dan jalan masuk beraspal. Lanjut ke depan untuk memasuki area museum.'],
  ['2', 'Area 2 · Halaman Depan', '02-2.jpg', 'Halaman terbuka di depan gedung museum. Terdapat arca Dwarapala dan Lingga Yoni di sisi kanan dan kiri. Dua jalur tersedia: ke kanan menuju rute utama, ke kiri menuju sayap barat.'],
  ['3-ke-kanan', 'Area 3 · Sayap Timur', '03-3-ke-kanan.jpg', 'Koridor sisi timur museum dengan pepohonan rindang. Dari sini bisa belok kanan menuju area pamer dalam, atau lurus menuju Area 10.'],
  ['3-ke-kiri', 'Area 3 · Sayap Barat', '04-3-ke-kiri.jpg', 'Koridor sisi barat museum. Jalur ini mengarah lurus menuju Area 4 dan ruang pamer fosil.'],
  ['4', 'Area 4 · Persimpangan Utama', '05-4.jpg', 'Persimpangan koridor dalam museum. Lurus menuju ruang fosil (Area 5), merupakan jalur utama tur.'],
  ['4-ke-kanan', 'Area 4 · Lorong Timur', '06-4-ke-kanan.jpg', 'Lorong sisi timur dengan dua pilihan: lurus menuju ruang transportasi kuno, atau belok ke area aksesibel tunanetra.'],
  ['5', 'Area 5 · Ruang Fosil', '07-5.jpg', 'Ruang pamer utama berisi koleksi fosil prasejarah: fosil Bofidae, fosil kerbau, tengkorak manusia purba, dan batuan purba. Penerangan cukup terang dengan vitrin kaca di sepanjang dinding.'],
  ['5-ke-kanan-terus-lurus', 'Area 5 · Ruang Transportasi Kuno', '08-5-ke-kanan-terus-lurus.jpg', 'Ruang pamer transportasi tradisional berisi cikar dan dokar (kereta kuda). Artefak dipajang di area terbuka dengan pencahayaan alami dari jendela samping.'],
  ['5-masuk-tunanetra', 'Area 5 · Ruang Aksesibel Tunanetra', '09-5-masuk-tunanetra.jpg', 'Ruang khusus aksesibilitas tunanetra. Terdapat display tentang Louis Braille, pesawat telepon kuno, dan lampu gantung bersejarah. Ruangan ini dirancang dengan pencahayaan lembut dan label braille.'],
  ['6-ke-kanan', 'Area 6 · Galeri Arkeologi', '10-6-ke-kanan.jpg', 'Galeri arkeologi dengan koleksi fosil kayu jati, arca Ganesa, dan hiasan Garudeya. Vitrin kaca berjajar di kedua sisi lorong. Bisa belok kiri ke galeri Hindu-Buddha atau lurus ke Area 7.'],
  ['6-ke-kiri', 'Area 6 · Galeri Hindu-Buddha', '11-6-ke-kiri.jpg', 'Ruang pamer artefak Hindu-Buddha berisi Moko, benda terakota peninggalan Majapahit, Pantheon dewa Buddha, sarana upacara, dan koleksi pameran lainnya. Suasana tenang dengan pencahayaan redup.'],
  ['7', 'Area 7 · Ruang Maritim & Senjata', '12-7.jpg', 'Ruang pamer berisi Kerapan Sapi, maket kapal dagang Insulinde, meriam Lela, dan kentongan Thuk-thuk. Area ini luas dengan langit-langit tinggi. Dua arah: keluar ke koridor atau lurus ke area berikutnya.'],
  ['8-keluar', 'Area 8 · Koridor Keluar', '13-8-keluar.jpg', 'Koridor penghubung menuju area luar. Dari sini bisa lanjut ke Area 9 untuk melanjutkan tur.'],
  ['8-lurus', 'Area 8 · Ruang Tekstil & Seni', '14-8-lurus.jpg', 'Ruang pamer tekstil berisi batik pesisiran Jawa Timur, topeng Malang, dan wayang beber. Kain-kain dipajang dalam bingkai kaca sepanjang dinding. Lurus menuju tangga ke lantai atas.'],
  ['9', 'Area 9 · Zona Transisi', '15-9.jpg', 'Area transisi dekat prasasti Kamalgyan. Lorong ini menghubungkan lantai bawah ke jalur naik tangga menuju lantai atas museum.'],
  ['9-lurus-naik-tangga', 'Area 9 · Tangga Naik ke Lantai 2', '16-9-lurus-naik-tangga.jpg', 'Area tangga menuju lantai atas. Di sepanjang tangga terdapat kipas angin tenaga uap, mesin ketik antik, dan sepeda motor Daimler. Zona IPTEK dimulai dari sini.'],
  ['10', 'Area 10 · Galeri Lantai Atas', '17-10.jpg', 'Galeri di lantai atas museum. Area ini lebih terang dengan jendela besar. Lurus menuju ruang koleksi modern, belok kiri menuju tangga ke lantai paling atas.'],
  ['10-ke-kiri', 'Area 10 · Lorong ke Lantai 3', '18-10-ke-kiri.jpg', 'Lorong menuju tangga naik ke area paling atas museum. Lorong sempit dengan penerangan dari lampu dinding.'],
  ['10-lurus', 'Area 10 · Ruang Koleksi Modern', '19-10-lurus.jpg', 'Ruang pamer berisi kapal Maru, mesin ketik, dan sepeda tinggi. Koleksi teknologi dan transportasi era kolonial dipajang dalam vitrin besar.'],
  ['11', 'Area 11 · Galeri Akhir Lantai 2', '20-11.jpg', 'Galeri bagian akhir lantai 2. Dari sini bisa lanjut naik tangga ke lantai paling atas atau menjelajah ruang lurus.'],
  ['11-lurus', 'Area 11 · Ruang Militer', '21-11-lurus.jpg', 'Ruang pamer militer berisi maket kapal pemburu torpedo Lynx. Ruangan ini memiliki pencahayaan dramatis yang menyoroti model kapal.'],
  ['12-naik-tangga', 'Area 12 · Tangga ke Lantai Atas', '22-12-naik-tangga.jpg', 'Area tangga menuju lantai paling atas. Tangga cukup lebar dengan pegangan di kedua sisi.'],
  ['13', 'Area 13 · Ruang Kesenian (Akhir Tur)', '23-13.jpg', 'Ruang kesenian di lantai paling atas — titik terakhir tur. Berisi jaran kencak, reog, dan koleksi kesenian tradisional Jawa Timur lainnya. Ruangan luas dengan langit-langit tinggi.'],
] as const;

type HotspotInput = Omit<TourHotspot, 'x' | 'y' | 'angle'> & Partial<Pick<TourHotspot, 'x' | 'y' | 'angle'>>;

const hotspotDefaults: Record<TourHotspot['placement'], Pick<TourHotspot, 'x' | 'y' | 'angle'>> = {
  forward: { x: 50, y: 58, angle: 0 },
  left: { x: 31, y: 58, angle: -62 },
  right: { x: 69, y: 58, angle: 62 },
  back: { x: 17, y: 65, angle: 180 },
  up: { x: 52, y: 48, angle: 0 },
  exit: { x: 74, y: 60, angle: 138 },
};

const hotspot = (input: HotspotInput): TourHotspot => ({
  ...hotspotDefaults[input.placement],
  ...input,
});

const routeHotspots: Record<string, TourHotspot[]> = {
  'mpu-1': [hotspot({ label: 'Menuju Titik 2', targetId: 'mpu-2', placement: 'forward', x: 51, y: 60 })],
  'mpu-2': [
    hotspot({ label: 'Menuju Titik 3 (Kanan)', targetId: 'mpu-3-ke-kanan', placement: 'right', x: 75, y: 55, angle: 72 }),
    hotspot({ label: 'Menuju Titik 3 (Kiri)', targetId: 'mpu-3-ke-kiri', placement: 'left', x: 25, y: 55, angle: -72 }),
  ],
  'mpu-3-ke-kanan': [
    hotspot({ label: 'Menuju Titik 4 (Kanan)', targetId: 'mpu-4-ke-kanan', placement: 'right', x: 70, y: 55 }),
    hotspot({ label: 'Menuju Titik 10', targetId: 'mpu-10', placement: 'forward', x: 56, y: 58 }),
  ],
  'mpu-3-ke-kiri': [hotspot({ label: 'Menuju Titik 4', targetId: 'mpu-4', placement: 'forward', x: 46, y: 58 })],
  'mpu-4': [
    hotspot({ label: 'Menuju Titik 5', targetId: 'mpu-5', placement: 'forward', x: 49, y: 58 }),
  ],
  'mpu-4-ke-kanan': [
    hotspot({ label: 'Menuju Titik 5 (Tunanetra)', targetId: 'mpu-5-masuk-tunanetra', placement: 'forward', x: 44, y: 55 }),
    hotspot({ label: 'Menuju Titik 5 (Lurus)', targetId: 'mpu-5-ke-kanan-terus-lurus', placement: 'forward', x: 65, y: 58 }),
  ],
  'mpu-5': [
    hotspot({ label: 'Menuju Titik 6 (Kanan)', targetId: 'mpu-6-ke-kanan', placement: 'forward', x: 50, y: 58 }),
  ],
  'mpu-5-ke-kanan-terus-lurus': [],
  'mpu-5-masuk-tunanetra': [],
  'mpu-6-ke-kanan': [
    hotspot({ label: 'Menuju Titik 6 (Kiri)', targetId: 'mpu-6-ke-kiri', placement: 'left', x: 30, y: 58 }),
    hotspot({ label: 'Menuju Titik 7', targetId: 'mpu-7', placement: 'forward', x: 55, y: 58 }),
  ],
  'mpu-6-ke-kiri': [],
  'mpu-7': [
    hotspot({ label: 'Menuju Titik 8 (Keluar)', targetId: 'mpu-8-keluar', placement: 'right', x: 76, y: 58 }),
    hotspot({ label: 'Menuju Titik 8 (Lurus)', targetId: 'mpu-8-lurus', placement: 'forward', x: 49, y: 55 }),
  ],
  'mpu-8-keluar': [hotspot({ label: 'Menuju Titik 9', targetId: 'mpu-9', placement: 'forward', x: 52, y: 58 })],
  'mpu-8-lurus': [hotspot({ label: 'Menuju Titik 9 (Naik Tangga)', targetId: 'mpu-9-lurus-naik-tangga', placement: 'forward', x: 48, y: 58 })],
  'mpu-9': [hotspot({ label: 'Menuju Titik 10', targetId: 'mpu-10', placement: 'forward', x: 50, y: 58 })],
  'mpu-9-lurus-naik-tangga': [
    hotspot({ label: 'Menuju Titik 10 (Lurus)', targetId: 'mpu-10-lurus', placement: 'forward', x: 50, y: 55 }),
    hotspot({ label: 'Menuju Titik 10 (Kiri)', targetId: 'mpu-10-ke-kiri', placement: 'left', x: 30, y: 58 }),
  ],
  'mpu-10': [
    hotspot({ label: 'Menuju Titik 11', targetId: 'mpu-11', placement: 'forward', x: 51, y: 58 }),
  ],
  'mpu-10-ke-kiri': [hotspot({ label: 'Menuju Titik 12 (Naik Tangga)', targetId: 'mpu-12-naik-tangga', placement: 'exit', x: 75, y: 58 })],
  'mpu-10-lurus': [hotspot({ label: 'Menuju Titik 11 (Lurus)', targetId: 'mpu-11-lurus', placement: 'forward', x: 51, y: 58 })],
  'mpu-11': [hotspot({ label: 'Menuju Titik 12 (Naik Tangga)', targetId: 'mpu-12-naik-tangga', placement: 'forward', x: 50, y: 58 })],
  'mpu-11-lurus': [],
  'mpu-12-naik-tangga': [hotspot({ label: 'Menuju Titik 13 (Akhir)', targetId: 'mpu-13', placement: 'forward', x: 50, y: 58 })],
};
const reverseHotspots = new Map<string, string[]>();
for (const [sourceId, hotspots] of Object.entries(routeHotspots)) {
  for (const h of hotspots) {
    if (!reverseHotspots.has(h.targetId)) reverseHotspots.set(h.targetId, []);
    reverseHotspots.get(h.targetId)!.push(sourceId);
  }
}

export const museums: Museum[] = sceneAssets.map(([id, highlight, file, description], index) => {
  const currentId = `mpu-${id}`;
  const backSources = reverseHotspots.get(currentId) ?? [];

  return {
    id: currentId,
    name: 'Museum Mpu Tantular',
    city: 'Sidoarjo',
    province: 'Jawa Timur',
    category: index === 0 ? 'Gerbang Masuk' : index < 6 ? 'Orientasi Rute' : index < 16 ? 'Jalur Galeri' : 'Galeri Atas',
    description,
    highlight,
    panorama: `/panoramas/mpu-tantular/${file}`,
    image: `/images/mpu-tantular/${file}`,
    accent: ['bronze', 'sand', 'stone', 'forest'][index % 4],
    hotspots: [
      ...(routeHotspots[currentId] ?? []),
      ...backSources.map((sourceId, i) => {
        const sourceAsset = sceneAssets.find(a => `mpu-${a[0]}` === sourceId);
        const sourceName = sourceAsset ? sourceAsset[1].replace(/^Area\s+\d+(?:[a-z-]*)?\s*·\s*/i, '') : 'Sebelumnya';
        return hotspot({
          label: `Kembali ke ${sourceName}`,
          targetId: sourceId,
          placement: 'back',
          // Geser sedikit posisi X jika ada lebih dari 1 tombol kembali agar tidak tertumpuk
          x: 50 + (i * 15),
          y: 80
        });
      }),
    ],
  };
});

export const museumProfile = {
  name: 'Museum Mpu Tantular',
  location: 'Sidoarjo, Jawa Timur',
  summary: 'Rute 360° terfokus melalui Museum Mpu Tantular menggunakan foto panorama yang disediakan dalam aset proyek.',
  sceneCount: museums.length,
};

export const audienceBenefits = [
  { title: 'Pelajar', copy: 'Belajar sejarah Jawa Timur melalui rute visual dan konteks ruang.' },
  { title: 'Wisatawan', copy: 'Melihat pratinjau Museum Mpu Tantular sebelum berkunjung ke Sidoarjo.' },
  { title: 'Pendidik', copy: 'Menggunakan scene 360 sebagai bahan pembelajaran dan diskusi kelas.' },
  { title: 'Pencinta Budaya', copy: 'Menyusuri rute museum dan memperhatikan detail warisan budaya dengan tempo sendiri.' },
];

export const galleryItems = [
  { title: 'Gerbang Masuk', copy: 'Mulai dari area luar gerbang Museum Mpu Tantular.', image: museums[0].image },
  { title: 'Pilihan Rute', copy: 'Ikuti arah kiri, kanan, lurus, dan tangga dari scene yang tersedia.', image: museums[3].image },
  { title: 'Akses Tunanetra', copy: 'Salah satu titik rute menandai area akses tunanetra.', image: museums[8].image },
  { title: 'Area Atas', copy: 'Lanjutkan perjalanan melalui titik akhir dan transisi tangga.', image: museums[21].image },
];
