import { promises as fs, stat } from 'fs'
import path from 'path'
import { getAllRecipes, getItemById, getRawRecipes } from '../services/items.service'
import type { Id, ItemName, ItemCount, Graph, GraphEdge, GraphNode } from '@shared/types'

const onlyItemName = (itemId: number): ItemName => {
  const item = getItemById(itemId)
  return {
    id: itemId || -1,
    name: item?.name || 'unknown',
    displayName: item?.displayName || 'Unknown Item'
  }
}

async function main() {
  try {
    const stats = {
      mostUsedItems: [] as ItemCount[],
      itemsWithMostRecipes: [] as ItemCount[],
      graph: {
        nodes: [] as GraphNode[],
        edges: [] as GraphEdge[]
      }
    }

    const recipes = getAllRecipes()
    const rawRecipes = getRawRecipes()

    const dictionaryMostUsed: Record<number, ItemCount> = {}

    const graph = {} as Graph
    const tempGraph: Record<string, Set<Id>> = {}

    // Most used items in recipes
    for (const recipe of recipes) {
      let itemSet = new Set<Id>()
      const recipeId = recipe.result.id
      const recipeItem = getItemById(Number(recipeId))
      const recipeName = recipeItem.name

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const itemId = recipe.inShape[i][j].id
          if (itemId !== -1) {
            itemSet.add(itemId)
          }
        }
      }

      for (const itemId of itemSet) {
        if (!dictionaryMostUsed[itemId]) {
          const item = getItemById(itemId)

          if (!item) continue
          dictionaryMostUsed[itemId] = { item: onlyItemName(itemId), count: 0 }
        }
        dictionaryMostUsed[itemId].count++

        if (!tempGraph[recipeName]) {
          tempGraph[recipeName] = new Set<Id>()
        }
        const itemName = getItemById(Number(itemId))!.name
        tempGraph[recipeName].add(itemId)
      }

      graph[recipeName] = Array.from(tempGraph[recipeName]).map((id: number) => onlyItemName(id))
    }
    stats.mostUsedItems = Object.values(dictionaryMostUsed).sort((a, b) => b.count - a.count)

    // Normalize sizes to avoid huge bubbles: sqrt-scaled between minSize and maxSize
    const counts = stats.mostUsedItems.map(i => i.count)
    const minCount = counts.length ? Math.min(...counts) : 0
    const maxCount = counts.length ? Math.max(...counts) : 0
    const minSize = 20
    const maxSize = 80

    const sizeFor = (name: string): number => {
      const count = stats.mostUsedItems.find(itemCount => itemCount.item.name === name)?.count
      if (!count || maxCount === minCount) return Math.round((minSize + maxSize) / 2)
      const norm = (count - minCount) / (maxCount - minCount)
      const scaled = Math.sqrt(Math.max(0, Math.min(1, norm)))
      return Math.round(minSize + scaled * (maxSize - minSize))
    }

    // Graph nodes and edges
    for (const from in graph) {
      stats.graph.nodes.push({
        id: from,
        image: `./items/${from}.png`,
        size: sizeFor(from),
      })
      for (const toItem of graph[from]) {
        stats.graph.edges.push({ from, to: toItem.name })
      }
    }

    // Items with most recipes
    for (const rawRecipe in rawRecipes) {
      stats.itemsWithMostRecipes.push({
        item: onlyItemName(Number(rawRecipe)),
        count: rawRecipes[rawRecipe].length
      })

    }
    stats.itemsWithMostRecipes.sort((a, b) => b.count - a.count)


    const outputDir = path.resolve('src/data')
    await fs.mkdir(outputDir, { recursive: true })

    const outputPath = path.join(outputDir, 'stats.json')

    await fs.writeFile(
      outputPath,
      JSON.stringify(stats, null, 2),
      'utf-8'
    )
  } catch (error) {
    console.error('Erro ao escrever estatísticas:', error)
    process.exitCode = 1
  }
}

main()