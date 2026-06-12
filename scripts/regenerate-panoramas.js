#!/usr/bin/env node
/**
 * Script untuk regenerate panorama dengan kualitas optimal
 * Gunakan setelah menginstall sharp: npm install --save-dev sharp
 *
 * Penggunaan:
 * 1. Copy file sumber ke folder `source-panoramas/`
 * 2. Jalankan: node scripts/regenerate-panoramas.js
 * 3. File output akan masuk ke `public/panoramas/mpu-tantular/`
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const SOURCE_DIR = join(__dirname, '../source-panoramas');
const OUTPUT_DIR = join(__dirname, '../public/panoramas/mpu-tantular');

const PANORAMA_CONFIG = {
  width: 4096,
  height: 2048,
  quality: 90,
  progressive: true,
  chromaSubsampling: '4:4:4',
};

async function regeneratePanoramas() {
  console.log('🎨 Memulai regenerate panorama...\n');

  try {
    await mkdir(SOURCE_DIR, { recursive: true });
    await mkdir(OUTPUT_DIR, { recursive: true });
  } catch (error) {
    console.error('❌ Gagal membuat direktori:', error.message);
    return;
  }

  let files;
  try {
    files = await readdir(SOURCE_DIR);
  } catch (error) {
    console.error('❌ Gagal membaca direktori source:', error.message);
    return;
  }

  const imageFiles = files.filter(file =>
    ['.jpg', '.jpeg', '.png', '.heic', '.webp'].includes(extname(file).toLowerCase())
  );

  if (imageFiles.length === 0) {
    console.log('⚠️  Tidak ada file gambar ditemukan di source-panoramas/');
    console.log('   Copy file sumber ke folder tersebut, lalu jalankan ulang script ini.\n');
    return;
  }

  console.log(`📁 Ditemukan ${imageFiles.length} file gambar\n`);

  let successCount = 0;
  let failCount = 0;

  for (const file of imageFiles) {
    const inputPath = join(SOURCE_DIR, file);
    const outputFile = basename(file, extname(file)) + '.jpg';
    const outputPath = join(OUTPUT_DIR, outputFile);

    try {
      console.log(`⏳ Memproses: ${file}`);

      await sharp(inputPath)
        .resize(PANORAMA_CONFIG.width, PANORAMA_CONFIG.height, {
          fit: 'fill',
          withoutEnlargement: false,
        })
        .jpeg({
          quality: PANORAMA_CONFIG.quality,
          progressive: PANORAMA_CONFIG.progressive,
          chromaSubsampling: PANORAMA_CONFIG.chromaSubsampling,
        })
        .toFile(outputPath);

      const stats = await sharp(outputPath).stats();
      console.log(`✅ Selesai: ${outputFile} (${(stats.size / 1024).toFixed(0)}KB)\n`);
      successCount++;
    } catch (error) {
      console.error(`❌ Gagal memproses ${file}:`, error.message, '\n');
      failCount++;
    }
  }

  console.log('─'.repeat(60));
  console.log(`\n📊 Ringkasan:`);
  console.log(`   ✅ Berhasil: ${successCount} file`);
  console.log(`   ❌ Gagal: ${failCount} file`);
  console.log(`   📂 Output: ${OUTPUT_DIR}\n`);

  if (successCount > 0) {
    console.log('🎉 Regenerate selesai! Restart dev server untuk melihat hasilnya.\n');
  }
}

regeneratePanoramas().catch(error => {
  console.error('❌ Error tidak terduga:', error);
  process.exit(1);
});
