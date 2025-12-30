import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const sizeArg = args.find(a => a.startsWith('--size='));
const chunkSize = sizeArg ? parseInt(sizeArg.split('=')[1], 10) : 30;

const inputPath = path.resolve(__dirname, '../data/items.enriched.json');
const outputDir = path.resolve(__dirname, '../data/items_chunks');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function cleanDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    fs.unlinkSync(path.join(dir, f));
  }
}

function zeroPad(n, width = 3) {
  return String(n).padStart(width, '0');
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error('Arquivo não encontrado:', inputPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, 'utf-8');
  const data = JSON.parse(raw);

  const ids = Object.keys(data).map(Number).sort((a, b) => a - b);
  ensureDir(outputDir);
  cleanDir(outputDir);

  let chunkIndex = 0;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunkIds = ids.slice(i, i + chunkSize);
    const chunkObj = {};
    for (const id of chunkIds) {
      chunkObj[id] = data[id];
    }
    const fileName = `items.chunk-${zeroPad(++chunkIndex)}.json`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(chunkObj, null, 2), 'utf-8');
    console.log(`Gerado: ${fileName} (${chunkIds[0]}..${chunkIds[chunkIds.length - 1]})`);
  }

  console.log(`Chunks criados em: ${outputDir}`);
  console.log(`Tamanho do chunk: ${chunkSize}`);
}

main();