import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesDir = path.resolve(__dirname, '../public/images');

const imageFiles = [
  'anandwan_warora.jpg',
  'ballarpur_industrial.jpg',
  'chandrapur_collectorate.jpg',
  'chandrapur_fort.jpg',
  'mahakali_temple.jpg',
  'tadoba_reserve.jpg',
];

async function run() {
  console.log('Optimizing images in:', imagesDir);

  for (const file of imageFiles) {
    const fullPath = path.join(imagesDir, file);
    if (!fs.existsSync(fullPath)) continue;

    const originalStats = fs.statSync(fullPath);
    const originalSize = originalStats.size;

    // Read buffer first to avoid file lock
    const inputBuffer = fs.readFileSync(fullPath);

    // Optimize JPEG in place with max width 1280 and 80% quality
    const optimizedJpgBuffer = await sharp(inputBuffer)
      .resize({ width: 1280, withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toBuffer();

    fs.writeFileSync(fullPath, optimizedJpgBuffer);
    const newStats = fs.statSync(fullPath);

    // Also write high-efficiency .webp version
    const webpPath = fullPath.replace(/\.jpg$/, '.webp');
    await sharp(inputBuffer)
      .resize({ width: 1280, withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toFile(webpPath);

    const webpStats = fs.statSync(webpPath);

    const jpgSavings = Math.round((1 - newStats.size / originalSize) * 100);
    const webpSavings = Math.round((1 - webpStats.size / originalSize) * 100);

    console.log(`[OPTIMIZED] ${file}:`);
    console.log(`  Raw: ${(originalSize / 1024).toFixed(1)} KB`);
    console.log(`  JPEG: ${(newStats.size / 1024).toFixed(1)} KB (${jpgSavings}% smaller)`);
    console.log(`  WebP: ${(webpStats.size / 1024).toFixed(1)} KB (${webpSavings}% smaller)`);
  }

  // Optimize chandrapur_district_map.png if present
  const mapPath = path.join(imagesDir, 'chandrapur_district_map.png');
  if (fs.existsSync(mapPath)) {
    const origSize = fs.statSync(mapPath).size;
    const inputBuf = fs.readFileSync(mapPath);
    const optPngBuf = await sharp(inputBuf)
      .resize({ width: 1000, withoutEnlargement: true })
      .png({ quality: 80, compressionLevel: 9 })
      .toBuffer();
    fs.writeFileSync(mapPath, optPngBuf);
    console.log(`[OPTIMIZED] chandrapur_district_map.png: ${(origSize/1024).toFixed(1)} KB -> ${(optPngBuf.length/1024).toFixed(1)} KB`);
  }

  console.log('Image optimization finished successfully.');
}

run().catch((err) => {
  console.error('Optimization error:', err);
  process.exit(1);
});
