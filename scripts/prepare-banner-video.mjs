import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const partsDir = path.join(projectRoot, 'public', 'videos', 'parts');
const outputPath = path.join(projectRoot, 'public', 'videos', 'promo-comercio-popular.mp4');

const parts = fs.readdirSync(partsDir)
  .filter((file) => file.endsWith('.b64'))
  .sort();

if (parts.length === 0) {
  throw new Error('Nenhum fragmento do vídeo do banner foi encontrado.');
}

const encodedVideo = parts.map((file) => fs.readFileSync(path.join(partsDir, file), 'utf8').trim()).join('');
const video = Buffer.from(encodedVideo, 'base64');
fs.writeFileSync(outputPath, video);
console.log(`Vídeo do banner preparado: ${video.length} bytes`);
