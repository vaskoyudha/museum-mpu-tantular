# Museum Mpu Tantular

Website modern Vite + React + TypeScript untuk tur virtual 360° **Museum Mpu Tantular** di Sidoarjo, Jawa Timur dengan tema glassmorphism.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka URL lokal yang dicetak Vite, biasanya `http://localhost:5173/`.

## Yang sudah dihubungkan

- 23 scene panorama 360° yang sudah dioptimalkan dari:
  `/home/vascosera/Downloads/Foto Mpu Tantular-20260425T001558Z-3-001/Foto Mpu Tantular`
- Panorama web disimpan di `public/panoramas/mpu-tantular/`.
- Thumbnail rute disimpan di `public/images/mpu-tantular/`.
- Metadata scene berada di `src/data/museums.ts`.

## Catatan

File `.HEIC` di folder sumber belum diimpor karena pipeline browser/app membutuhkan format gambar yang kompatibel dengan web. Panorama `.jpg` 8000×4000 diubah menjadi 4096×2048 agar lebih ringan, sambil mempertahankan rasio equirectangular 2:1 untuk viewer 360.
