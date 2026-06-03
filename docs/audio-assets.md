# Panduan Upload Aset Audio

Dokumen ini menjelaskan tempat, nama, format, dan perilaku fallback untuk file audio
(musik latar gamelan + voiceover per artefak) yang dipakai tur 360° Museum Mpu Tantular.
Ikuti panduan ini ketika menambahkan atau memperbarui file audio. Tidak ada perubahan
kode TypeScript yang dibutuhkan; cukup letakkan file di lokasi yang benar dan perbarui
satu baris di `src/data/artifacts.json`.

---

## 1. Struktur Direktori

Folder target upload sudah disiapkan (sudah ada `.gitkeep` di setiap folder agar
tetap terlacak Git meski kosong):

```
public/
└── audio/
    ├── ambient/
    │   └── .gitkeep        ← taruh gamelan di sini
    └── voiceover/
        └── .gitkeep        ← taruh voiceover per artefak di sini
```

Vite menyajikan semua isi `public/` di akar situs, sehingga path file yang
ditulis di `artifacts.json` cukup berupa `/audio/...` (tanpa awalan `public/`).

---

## 2. Konvensi Penamaan File

### 2.1 Musik latar (gamelan)

- **Lokasi**: `public/audio/ambient/`
- **Nama file**: `gamelan-loop.mp3` (atau cukup `gamelan.mp3`)
- **Jumlah**: 1 file saja
- **Path publik yang dirujuk kode**: `/audio/ambient/gamelan.mp3`

Pemutar musik di `TourViewer` (akan dipasang di Tugas 9) akan memuat path
`/audio/ambient/gamelan.mp3` ketika pengguna mengaktifkan toggle "Musik latar".

### 2.2 Voiceover per artefak

- **Lokasi**: `public/audio/voiceover/`
- **Nama file**: `voiceover-{slug}.mp3`, di mana `{slug}` sama dengan
  kolom `slug` di `src/data/artifacts.json`.
- **Jumlah**: hingga 37 file (satu per artefak; boleh diunggah sebagian dulu).
- **Path publik**: `/audio/voiceover/{slug}.mp3`

Contoh:

| Slug artefak            | Nama file fisik                    | Path publik                          |
| ----------------------- | ---------------------------------- | ------------------------------------ |
| `arca-dwarapala`        | `public/audio/voiceover/arca-dwarapala.mp3` | `/audio/voiceover/arca-dwarapala.mp3` |
| `ganesa`                | `public/audio/voiceover/ganesa.mp3`         | `/audio/voiceover/ganesa.mp3`         |
| `topeng-malang`         | `public/audio/voiceover/topeng-malang.mp3`  | `/audio/voiceover/topeng-malang.mp3`  |

Slug HARUS cocok persis dengan yang ada di `artifacts.json`; jika tidak, modal
artefak akan tetap membuka (tidak error) tetapi tidak menampilkan tombol voiceover.
Lihat bagian 7 untuk perilaku fallback.

Daftar lengkap 37 slug yang diharapkan ada di bagian 9.

---

## 3. Spesifikasi Format Audio

### 3.1 Format: MP3

- **Hanya MP3** yang dipakai. Alasannya: dukungan universal di semua browser
  evergreen (termasuk Safari iOS), ukuran file kecil, dan tidak butuh codec tambahan.
- Hook `useAudioPlayer` (`src/hooks/useAudioPlayer.ts`) tidak memvalidasi format;
  ia hanya meneruskan `src` ke `new Audio(src)` peramban. MP3 adalah satu-satunya
  format yang konsisten didukung di Safari iOS, Chrome Android, dan Firefox.

### 3.2 Bitrate, kanal, dan sample rate (rekomendasi)

| Parameter       | Musik latar         | Voiceover           | Catatan                                      |
| --------------- | ------------------- | ------------------- | -------------------------------------------- |
| Bitrate         | 64 kbps             | 64 kbps             | Cukup untuk mono speech + ambient.           |
| Kanal           | 1 (mono)            | 1 (mono)            | Stereo tidak terdengar via earphone panorama. |
| Sample rate     | 44,1 kHz            | 44,1 kHz            | Standar CD; tidak perlu lebih tinggi.        |
| Loudness target | -16 LUFS            | -16 LUFS            | Standar streaming; mencegah kejutan keras.   |

### 3.3 Anggaran ukuran file

- **Per file**: ≤ 80 KB
- **Total audio (musik + semua voiceover)**: ≤ 2 MB

Alasan: tur 360° sudah memuat panorama `4096×2048` (≈ 200–500 KB masing-masing)
dan thumbnail 23 scene. Anggaran 2 MB untuk audio menjaga total unduhan
halaman tetap di bawah ≈ 25 MB (target koneksi 3G yang masih layak).

### 3.4 Contoh perintah `ffmpeg` (opsional)

Mengonversi file mentah ke MP3 64 kbps mono:

```bash
# Musik latar
ffmpeg -i sumber-gamelan.wav \
  -codec:a libmp3lame -b:a 64k -ac 1 -ar 44100 \
  public/audio/ambient/gamelan.mp3

# Voiceover
ffmpeg -i rekaman-voiceover.wav \
  -codec:a libmp3lame -b:a 64k -ac 1 -ar 44100 \
  public/audio/voiceover/arca-dwarapala.mp3
```

Memangkas ke 60 detik untuk loop (lihat bagian 4):

```bash
ffmpeg -i gamelan-panjang.mp3 -t 60 -c copy gamelan-loop.mp3
```

Menormalkan loudness ke -16 LUFS (butuh `ffmpeg-normalize`):

```bash
ffmpeg-normalize public/audio/ambient/gamelan.mp3 -t -16 -l 9 -c:a libmp3lame -b:a 64k -ar 44100 -ac 1
```

---

## 4. Strategi Loop untuk Musik Latar

Hook `useAudioPlayer` mengatur loop memakai atribut `loop` bawaan HTMLAudioElement
(yaitu **potong keras di akhir → mulai ulang dari awal**). Tidak ada crossfade
otomatis di kode.

Konsekuensinya, file gamelan **harus dibuat seamless** (sampel terakhir ≈ sampel
pertama). Dua cara yang disarankan:

1. **Loop jahitan bersih (seamless loop)** — rekam/trim klip 30–60 detik di mana
   awal dan akhir identik (fase, loudness, dan pitch). Ini adalah cara termudah
   dan paling aman.

2. **Crossfade 1–2 detik yang sudah di-render** — jika Anda memiliki klip yang
   tidak bisa dibuat seamless, buat crossfade di editor audio (Audacity, Adobe
   Audition, Logic Pro, dll.) sehingga 1–2 detik terakhir di-fade-out sementara
   1–2 detik pertama di-fade-in, lalu render hasilnya sebagai satu file MP3.
   Hook tidak akan menambahkan crossfade tambahan.

Ukuran file musik ≤ 80 KB pada 64 kbps mono ≈ ~10 detik. Durasi 30–60 detik
cukup untuk satu "putaran" terasa; untuk durasi lebih panjang, naikkan bitrate
(80 kbps = ~8 detik per 10 KB).

---

## 5. Template Skrip Voiceover

Voiceover adalah pelafalan singkat per artefak yang memutari otomatis di modal
detail. Format yang diharapkan:

- **Bahasa**: Bahasa Indonesia.
- **Panjang**: 1–2 kalimat, ~10–15 detik waktu baca (± 25–40 kata).
- **Nada**: netral, informatif, museum-sejati. Tidak perlu efek dramatisasi.
- **Konten**: sesuai dengan kolom `description` artefak (yang juga akan Anda
  isi di `artifacts.json`). Bacakan ulang dalam bentuk yang lebih luwes; tidak
  harus persis sama.
- **Penutup**: tidak perlu menyebut "Ini adalah deskripsi..." — langsung
  paparkan nama dan konteksnya.

### Contoh skrip

```
Arca Dwarapala adalah patung penjaga dari masa Kerajaan Majapahit. 
Biasanya ditempatkan di depan pintu masuk candi sebagai pelindung 
spiritual bagi pengunjung.
```

```
Lingga Yoni melambangkan kesuburan dan penciptaan dalam tradisi 
Hindu-Budha. Bentuknya yang lonjong di atas landasan bulat 
mewakili Dewa Siwa dan energi feminine bumi.
```

```
Fosil kerbau purba ini ditemukan di sekitar Sidoarjo dan berusia 
lebih dari seratus ribu tahun. Fosil ini menjadi bukti bahwa 
wilayah ini pernah menjadi habitat megafauna Nusantara.
```

### Praktik baik

- Rekam di ruang senyap (kamar tidur dengan selimut sebagai peredam cukup).
- Pakai mikrofon apa pun (headset USB, mikrofon laptop, atau bahkan
  ponsel dengan aplikasi perekam) — yang penting jelas dan tanpa dengung.
- Simpan master sebagai WAV/FLAC, lalu ekspor ke MP3 sesuai bagian 3.

---

## 6. Cara Memasang (Tanpa Ubah Kode .ts/.tsx)

Ada **dua langkah** untuk mengaktifkan voiceover sebuah artefak. Tidak perlu
mengubah file `.ts`/`.tsx`.

### Langkah 1 — Taruh file MP3

Letakkan file di `public/audio/voiceover/{slug}.mp3` dengan nama persis sama
dengan slug artefak.

### Langkah 2 — Isi path di `src/data/artifacts.json`

Buka `src/data/artifacts.json`, cari entri artefak yang sesuai, dan isi
kolom `voiceover` (sekarang kosong `""`) dengan path publik:

```json
{
  "sceneId": "mpu-6-ke-kanan",
  "slug": "ganesa",
  "name": "Ganesa",
  "photos": ["ganesa-photo.jpg"],
  "cards": ["ganesa-card.jpg"],
  "description": "Patung Ganesa dewa pengetahuan dengan kepala gajah.",
  "voiceover": "/audio/voiceover/ganesa.mp3"
}
```

Kolom `description` boleh Anda isi juga (untuk teks kaya yang ditampilkan
di modal dan dipakai screen reader). Kosongkan jika belum siap.

> **Tidak perlu restart dev server** untuk perubahan di `public/`. Vite
> menyajikan file statis langsung dari disk. Namun perubahan di
> `artifacts.json` baru生效 setelah `npm run dev` me-reload modul —
> jika sudah berjalan, refresh halaman (`Ctrl+R`).

### Mengaktifkan musik latar

Untuk musik latar, tidak ada yang perlu diedit di JSON. Musik otomatis
aktif ketika pengguna menekan tombol "Musik latar" di bilah alat viewer
(Task 9). Cukup unggah `public/audio/ambient/gamelan.mp3`.

---

## 7. Perilaku "Audio belum tersedia" (Fallback)

Dirancang agar aplikasi **tidak pernah crash** meskipun file audio hilang atau
belum diunggah. Hook `useAudioPlayer` mengembalikan kode error, bukan melemparkan
pengecualian:

| Skenario                              | Yang terjadi                                                       |
| ------------------------------------- | ------------------------------------------------------------------ |
| `src` kosong / tidak diisi di JSON    | Hook langsung `setError('no-src')`; tidak ada pemutaran, tidak ada throw. |
| File 404 / tidak ditemukan di server  | Event `error` pada `<audio>` → `setError('media-error')`.          |
| `audio.play()` ditolak peramban       | Promise reject → `setError('play-failed')` (mis. Safari iOS tanpa gestur). |
| `AudioContext` ditangguhkan (Safari)  | `ctx.resume()` dipanggil otomatis di dalam `play()`.                |

**Di UI:**

- **Voiceover artefak**: komponen `ArtifactVoiceover` membaca `artifact.voiceover`.
  Jika string kosong, tombol "Putar voiceover" tidak ditampilkan sama sekali.
  Artefak tetap bisa dibuka di modal (hanya menampilkan foto + deskripsi).
- **Musik latar**: toggle di bilah alat tetap bisa diklik. Jika file hilang,
  tidak ada audio yang keluar, tidak ada crash. (Pengumuman "Audio belum
  tersedia" pada konsol dibiarkan; tidak ada toast UI di versi ini.)

**Implikasi praktis untuk pengunggah sebagian:**

- Jika Anda hanya mengunggah 5 dari 37 voiceover, 32 modal artefak lain tetap
  terbuka normal — tanpa voiceover, tanpa crash. Pengunjung hanya melihat foto
  dan deskripsi.
- Jika Anda hanya mengunggah musik latar, voiceover masih bisa berfungsi saat
  diunggah; keduanya independen.
- Tidak ada validasi build yang akan gagal karena file audio hilang. Aplikasi
  tetap lulus `npm run build` dengan folder `public/audio/` kosong.

---

## 8. Catatan Teknis (Untuk yang Ingin Tahu)

### 8.1 Inisialisasi `AudioContext` yang lambat

`useAudioPlayer` membuat `AudioContext` pertama kali `play()` dipanggil
(di dalam pemicu klik pengguna), bukan saat modul diimpor. Ini untuk
memenuhi kebijakan autoplay Safari iOS yang mewatkan `AudioContext.resume()`
dipanggil dari handler gestur. Akibatnya: pengguna harus menekan tombol
"Musik latar" sekali sebelum audio apa pun keluar.

### 8.2 Skrip pre-paint di `index.html`

`index.html` berisi skrip inline kecil (sebelum `<script type="module">`)
yang membaca `localStorage` untuk prefrensi a11y (kontras tinggi dan
ukuran teks) dan menerapkannya ke `<html>` **sebelum cat pertama**. Tujuannya
bukan audio — melainkan mencegah *flash of unstyled content* (FOUC) ketika
pengguna telah memilih kontras tinggi di sesi sebelumnya. (Lihat Tugas 3.)

### 8.3 Ducking (pengecilan volume otomatis)

Saat voiceover mulai diputar, musik latar akan diturunkan volumenya menjadi
sekitar 30% (dari 50% ke 15%) lewat `GainNode` bersama. Saat voiceover
berhenti, musik kembali ke 50%. Koordinasi ini dipasang di Tugas 9 dan
memanfaatkan ref `gain` yang sudah diekspor `useAudioPlayer`.

### 8.4 Stereo pan

Musik latar juga akan di-panning ke kiri/kanan mengikuti arah hadap
pengunjung di viewer 360° (`viewer.getPosition().yaw`). Ini dipasang di
Tugas 9 bersamaan dengan tombol musik.

### 8.5 Visibilitas tab

Musik akan dijeda saat tab tidak terlihat (`document.visibilitychange`)
dan dilanjutkan saat tab kembali aktif — asalkan toggle "Musik latar"
tetap aktif. (Tugas 9.)

### 8.6 Tidak ada autoplay

Baik musik maupun voiceover **tidak pernah** diputar otomatis. Selalu
memerlukan klik/ketuk eksplisit dari pengguna. Ini sesuai dengan
kebijakan browser dan preferensi a11y (banyak pengguna dengan sensitivitas
sensorik memilih untuk mematikan audio).

---

## 9. Daftar Lengkap 37 Slug Artefak

Berikut 37 slug yang dipakai di `src/data/artifacts.json` (sudah diverifikasi
dari kode). File voiceover yang cocok mengikuti konvensi
`public/audio/voiceover/{slug}.mp3`.

| Slug                            | Scene ID                       | Nama Artefak                |
| ------------------------------- | ------------------------------ | --------------------------- |
| arca-dwarapala                  | mpu-2                          | Arca Dwarapala              |
| lingga-yoni                     | mpu-2                          | Lingga Yoni                 |
| fosil-bofidae                   | mpu-5                          | Fosil Bofidae               |
| fosil-kerbau                    | mpu-5                          | Fosil Kerbau                |
| tengkorak-manusia-purba         | mpu-5                          | Tengkorak Manusia Purba     |
| batuan                          | mpu-5                          | Batuan Purba                |
| cikar                           | mpu-5-ke-kanan-terus-lurus     | Cikar                       |
| dokar                           | mpu-5-ke-kanan-terus-lurus     | Dokar                       |
| lampu-gantung                   | mpu-5-masuk-tunanetra          | Lampu Gantung               |
| louis-braille                   | mpu-5-masuk-tunanetra          | Louis Braille               |
| pesawat-telepon                 | mpu-5-masuk-tunanetra          | Pesawat Telepon             |
| fosil-kayu-jati                 | mpu-6-ke-kanan                 | Fosil Kayu Jati             |
| ganesa                          | mpu-6-ke-kanan                 | Ganesa                      |
| hiasan-garudeya                 | mpu-6-ke-kanan                 | Hiasan Garudeya             |
| moko                            | mpu-6-ke-kiri                  | Moko                        |
| benda-terakota-majapahit        | mpu-6-ke-kiri                  | Benda Terakota Majapahit    |
| patheon-dewa-budha              | mpu-6-ke-kiri                  | Patheon Dewa Agama Budha    |
| sarana-upacara-hindu-budha      | mpu-6-ke-kiri                  | Sarana Upacara Hindu-Budha  |
| kerapan-sapi                    | mpu-7                          | Kerapan Sapi                |
| maket-kapal-insulinde           | mpu-7                          | Maket Kapal Dagang Insulinde|
| meriam-lela                     | mpu-7                          | Meriam Lela                 |
| thuk-thuk-kentongan             | mpu-7                          | Thuk-Thuk (Kentongan)       |
| batik-pesisiran                 | mpu-8-lurus                    | Batik Pesisiran Jawa Timur  |
| topeng-malang                   | mpu-8-lurus                    | Topeng Malang               |
| wayang-beber                    | mpu-8-lurus                    | Wayang Beber                |
| prasasti-kamalgyan              | mpu-9                          | Prasasti Kamalgyan          |
| kipas-angin-uap                 | mpu-9-lurus-naik-tangga        | Kipas Angin Tenaga Uap      |
| mesin-ketik-9                   | mpu-9-lurus-naik-tangga        | Mesin Ketik (Lantai Atas)   |
| sepeda-motor-daimler            | mpu-9-lurus-naik-tangga        | Sepeda Motor Daimler        |
| kapal-maru                      | mpu-10-lurus                   | Kapal Maru                  |
| mesin-ketik-10                  | mpu-10-lurus                   | Mesin Ketik                 |
| sepeda-tinggi                   | mpu-10-lurus                   | Sepeda Tinggi               |
| maket-torpedo-lynx              | mpu-11-lurus                   | Maket Kapal Pemburu Torpedo Lynx |
| wayang                          | mpu-12-naik-tangga             | Wayang                      |
| wayang-kulit-bangkalan          | mpu-12-naik-tangga             | Wayang Kulit Bangkalan      |
| jaran-kepang                    | mpu-13                         | Jaran Kepang                |
| reog                            | mpu-13                         | Reog                        |

Jika Anda menambahkan artefak baru ke `artifacts.json`, tambahkan slug ke
tabel ini juga agar dokumentasi tetap akurat.

---

## 10. Penafian Hak Cipta

Pemilik proyek bertanggung jawab penuh atas hak cipta dan lisensi setiap
file audio yang diunggah. Pastikan:

- Musik gamelan: gunakan rekaman domain publik, lisensi Creative Commons,
  atau rekaman milik sendiri.
- Voiceover: rekaman sendiri, atau teks dan pelafalan yang berada di
  bawah domain publik / CC0.

Repositori ini tidak menyertakan file audio apa pun secara default (folder
`public/audio/` hanya berisi `.gitkeep` kosong). Tidak ada pelacakan
aset audio yang disertakan oleh aplikasi.

---

## Lampiran: Pemeriksaan Cepat

Sebelum menjalankan `npm run dev` setelah menambahkan audio:

```bash
# 1. Pastikan folder public/audio tidak kosong secara tidak sengaja
ls public/audio/ambient/ public/audio/voiceover/

# 2. Pastikan semua path di artifacts.json cocok dengan file
#    (ganti node -e di bawah untuk memverifikasi)
node -e "
  const c = require('./src/data/artifacts.json');
  const fs = require('fs');
  c.forEach(a => {
    if (a.voiceover) {
      const ok = fs.existsSync('./public' + a.voiceover);
      console.log(ok ? '\u2713' : '\u2717', a.slug, '\u2192', a.voiceover);
    }
  });
"

# 3. Pastikan build masih bersih
npm run lint && npm run build
```

Jika verifikasi 1 dan 2 lolos dan build masih hijau, audio siap dipakai
di tur 360° Museum Mpu Tantular.
