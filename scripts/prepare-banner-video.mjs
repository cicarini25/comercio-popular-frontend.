import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const partsRoot = path.join(projectRoot, 'public', 'videos');
const partsDir = path.join(partsRoot, 'design-parts');
const legacyPartsDir = path.join(partsRoot, 'parts');
const outputPath = path.join(partsRoot, 'promo-comercio-popular.mp4');

const parts = fs.readdirSync(partsDir)
  .filter((file) => file.endsWith('.b64'))
  .sort();

if (parts.length === 0) {
  throw new Error('Nenhum fragmento do vídeo do banner foi encontrado.');
}

const encodedVideo = parts.map((file) => fs.readFileSync(path.join(partsDir, file), 'utf8').trim()).join('');
const video = Buffer.from(encodedVideo, 'base64');
fs.writeFileSync(outputPath, video);
fs.rmSync(partsDir, { recursive: true, force: true });
fs.rmSync(legacyPartsDir, { recursive: true, force: true });
console.log(`Vídeo do banner preparado: ${video.length} bytes`);
