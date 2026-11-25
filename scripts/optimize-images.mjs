import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const artifactDir = 'C:/Users/USERR/.gemini/antigravity/brain/c933e8a5-2b70-4862-be7f-6fc2d28f765e';
const outDir = path.resolve('public/illustrations');
fs.mkdirSync(outDir, { recursive: true });

const jobs = [
  {
    src: 'hero_magical_girl_1795594786775.jpg',
    outputs: [
      { name: 'hero-magical-girl.webp', width: 960, quality: 82 },
      { name: 'hero-magical-girl-mobile.webp', width: 560, quality: 80 },
    ],
  },
  {
    src: 'clients_cyber_mage_1795594799816.jpg',
    outputs: [{ name: 'clients-cyber-mage.webp', width: 760, quality: 82 }],
  },
  {
    src: 'academy_library_mage_1795594804190.jpg',
    outputs: [{ name: 'academy-library-mage.webp', width: 760, quality: 82 }],
  },
  {
    src: '404_lost_mage_1795594855641.jpg',
    outputs: [{ name: '404-lost-mage.webp', width: 720, quality: 82 }],
  },
  {
    src: 'og_cover_mage_1795594861320.jpg',
    outputs: [
      { name: 'og-cover.webp', width: 1200, height: 630, quality: 84 },
      { name: 'og-cover.jpg', width: 1200, height: 630, format: 'jpeg', quality: 85 },
    ],
  },
];

for (const job of jobs) {
  const inputPath = path.join(artifactDir, job.src);
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing source illustration: ${inputPath}`);
  }
  for (const out of job.outputs) {
    const outPath = path.join(outDir, out.name);
    let pipeline = sharp(inputPath);
    if (out.height) {
      pipeline = pipeline.resize(out.width, out.height, { fit: 'cover', position: 'center' });
    } else {
      pipeline = pipeline.resize({ width: out.width, withoutEnlargement: true });
    }
    if (out.format === 'jpeg') {
      await pipeline.jpeg({ quality: out.quality, mozjpeg: true }).toFile(outPath);
    } else {
      await pipeline.webp({ quality: out.quality, effort: 5 }).toFile(outPath);
    }
    const stat = fs.statSync(outPath);
    console.log(`Generated ${out.name}: ${(stat.size / 1024).toFixed(1)} KB`);
  }
}

// Also generate PNG favicon/apple-touch-icon from logo.svg for maximum compatibility
await sharp(path.resolve('public/logo.svg'))
  .resize(180, 180)
  .png()
  .toFile(path.resolve('public/apple-touch-icon.png'));
await sharp(path.resolve('public/favicon.svg'))
  .resize(32, 32)
  .png()
  .toFile(path.resolve('public/favicon-32.png'));
console.log('Generated apple-touch-icon.png and favicon-32.png');
