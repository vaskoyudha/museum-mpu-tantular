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
  ['1', 'Area 1 · Titik 1', '01-1.jpg', 'Titik kedatangan di luar gerbang merah Museum Mpu Tantular.'],
  ['2', 'Area 2 · Titik 2', '02-2.jpg', 'Area transisi terbuka yang memperkenalkan rute museum.'],
  ['3-ke-kanan', 'Area 3 · Titik 3 Ke Kanan', '03-3-ke-kanan.jpg', 'Rute sisi kanan dari area awal museum.'],
  ['3-ke-kiri', 'Area 3 · Titik 3 Ke Kiri', '04-3-ke-kiri.jpg', 'Rute sisi kiri dari area awal museum.'],
  ['4', 'Area 4 · Titik 4', '05-4.jpg', 'Jalur penghubung menuju ruang-ruang pamer.'],
  ['4-ke-kanan', 'Area 4 · Titik 4 Ke Kanan', '06-4-ke-kanan.jpg', 'Cabang rute untuk bergerak lebih jauh ke dalam museum.'],
  ['5', 'Area 5 · Titik 5', '07-5.jpg', 'Titik rute interior sebagai pusat lanjutan tur.'],
  ['5-ke-kanan-terus-lurus', 'Area 5 · Titik 5 Lurus', '08-5-ke-kanan-terus-lurus.jpg', 'Arah lanjutan untuk menyusuri rute museum.'],
  ['5-masuk-tunanetra', 'Area 5 · Titik 5 Masuk Tunanetra', '09-5-masuk-tunanetra.jpg', 'Area aksesibel yang terhubung dengan pengalaman museum.'],
  ['6-ke-kanan', 'Area 6 · Titik 6 Ke Kanan', '10-6-ke-kanan.jpg', 'Rute kanan dari titik scene keenam.'],
  ['6-ke-kiri', 'Area 6 · Titik 7 Ke Kiri', '11-6-ke-kiri.jpg', 'Rute kiri dari titik scene keenam.'],
  ['7', 'Area 7 · Titik 7 Lurus', '12-7.jpg', 'Jalur lanjutan di dalam rute koleksi museum.'],
  ['8-keluar', 'Area 8 · Titik 8 Keluar', '13-8-keluar.jpg', 'Arah keluar untuk membantu orientasi rute.'],
  ['8-lurus', 'Area 8 · Titik 8 Lurus', '14-8-lurus.jpg', 'Rute maju menuju ruang museum berikutnya.'],
  ['9', 'Area 9 · Titik 9', '15-9.jpg', 'Titik rute dekat transisi menuju area atas.'],
  ['9-lurus-naik-tangga', 'Area 9 · Titik 9 Lurus Naik Tangga', '16-9-lurus-naik-tangga.jpg', 'Scene arah tangga untuk melanjutkan tur ke atas.'],
  ['10', 'Area 10 · Titik 10', '17-10.jpg', 'Titik galeri dalam rute Museum Mpu Tantular.'],
  ['10-ke-kiri', 'Area 10 · Titik 10 Ke Kiri', '18-10-ke-kiri.jpg', 'Cabang kiri dari scene kesepuluh.'],
  ['10-lurus', 'Area 10 · Titik 10 Lurus', '19-10-lurus.jpg', 'Lanjutan rute dari scene kesepuluh.'],
  ['11', 'Area 11 · Titik 11', '20-11.jpg', 'Scene rute pameran pada bagian akhir urutan.'],
  ['11-lurus', 'Area 11 · Titik 11 Lurus', '21-11-lurus.jpg', 'Rute maju dari scene kesebelas.'],
  ['12-naik-tangga', 'Area 12 · Titik 12 Naik Tangga', '22-12-naik-tangga.jpg', 'Scene tangga menuju area akhir.'],
  ['13', 'Area 13 · Titik 13', '23-13.jpg', 'Titik terakhir dari kumpulan panorama Mpu Tantular yang tersedia.'],
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
