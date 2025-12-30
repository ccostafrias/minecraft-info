import fs from 'fs/promises'
import path from 'path'

const API_URL = 'http://localhost:3000/api/itemsRaw'

async function exportItems() {
  try {
    const res = await fetch(API_URL)

    if (!res.ok) {
      throw new Error(`Erro na requisição: ${res.status}`)
    }

    const { items } = await res.json()

    for (const item in items) {
      items[item].description = ''
      items[item].category = ''
      items[item].tags = []
    }

    // garante que a pasta exista
    const outputDir = path.resolve('data')
    await fs.mkdir(outputDir, { recursive: true })

    const outputPath = path.join(outputDir, 'items.json')

    await fs.writeFile(
      outputPath,
      JSON.stringify(items, null, 2),
      'utf-8'
    )

    console.log(`✔ Items salvos em ${outputPath}`)
  } catch (err) {
    console.error('❌ Erro ao exportar items:', err)
  }
}

exportItems()
