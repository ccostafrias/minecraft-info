import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const tagsToRemove = ['window', 'fish']
const tagsToAdd = { 
  'wax': [ 'wax' ],
  'stone': [ 'deepslate', 'granite', 'diorite' ]
};

const inputPath = path.resolve(__dirname, '../data/items.json');
const outputPath = path.resolve(__dirname, '../data/items.cleaned.json');

const args = process.argv.slice(2);
const hasRemoveArg = !!args.find(a => a.startsWith('--remove'));
const hasAddArg = !!args.find(a => a.startsWith('--add'));

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error('Arquivo não encontrado:', inputPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, 'utf-8');
  const data = JSON.parse(raw);

  const tagsCount = {}

  for (const id in data) {
    if (data[id].tags) {
      for (const tag of data[id].tags) {
        if (!tagsCount[tag]) {
          tagsCount[tag] = 0;
        }
        tagsCount[tag]++;
      }
    }
  }

  const sortedTags = Object.entries(tagsCount).sort((a, b) => b[1] - a[1]);
  console.log('Less common tags: \n');

  for (let i = 0; i < 20; i++) {
    const [tag, count] = sortedTags[sortedTags.length - 20 + i];
    console.log(`${tag} (${count})`);
  }
  
  if (hasRemoveArg || hasAddArg) {
    for (const id in data) {
      if (hasRemoveArg && data[id].tags) {
        data[id].tags = data[id].tags.filter(tag => {
          if (tagsToRemove.includes(tag)) {
            return false;
          }
  
          if (tagsCount[tag] <= 3) {
            return false;
          }
  
          // if (data[id].category === tag) {
          //   return false;
          // }
          
          return true;
        });
      }

      if (hasAddArg) {
        for (const tag in tagsToAdd) {
          for (const suffix of tagsToAdd[tag]) {
            if (data[id].name.includes(suffix) && !data[id].tags.includes(tag)) {
              data[id].tags.push(tag);

          }
        }
      }
    }
  }

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\nArquivo salvo em: ${outputPath}\n`);
  }
}

main();