import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const overwrite = args.includes('--overwrite');

const chunksDir = path.resolve(__dirname, '../data/items_chunks');
const inputPath = path.resolve(__dirname, '../data/items.enriched.json');
const mergedPath = overwrite
  ? inputPath
  : path.resolve(__dirname, '../data/items.enriched.merged.json');

function main() {
  if (!fs.existsSync(chunksDir)) {
    console.error('Diretório de chunks não encontrado:', chunksDir);
    process.exit(1);
  }

  const files = fs.readdirSync(chunksDir)
    .filter(f => /^items\.chunk-\d+\.json$/.test(f))
    .sort();

  if (files.length === 0) {
    console.error('Nenhum chunk encontrado em:', chunksDir);
    process.exit(1);
  }

  const merged = {};
  for (const f of files) {
    const raw = fs.readFileSync(path.join(chunksDir, f), 'utf-8');
    const obj = JSON.parse(raw);
    for (const [k, v] of Object.entries(obj)) {
      merged[k] = v;
    }
  }

  // Se existir original, garante que chaves faltantes não sumam
  if (fs.existsSync(inputPath)) {
    const original = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
    for (const [k, v] of Object.entries(original)) {
      if (!(k in merged)) merged[k] = v;
    }
  }

  const sorted = Object.keys(merged).map(Number).sort((a, b) => a - b)
    .reduce((acc, id) => { acc[id] = merged[id]; return acc; }, {});

  fs.writeFileSync(mergedPath, JSON.stringify(sorted, null, 2), 'utf-8');

  console.log(`Arquivo mesclado salvo em: ${mergedPath}`);
  if (overwrite) console.log('Aviso: sobrescreveu items.enriched.json');
}

main();