import fs from 'fs'
import path from 'path'
import type { ItemCount, MinecraftItem, Recipe, StatsInterface } from '@shared/types'

interface Items {
  [id: string]: MinecraftItem
}

const itemsPath = path.resolve('src/data/items.json')
const recipesPath = path.resolve('src/data/recipes.json')
const statsPath = path.resolve('src/data/stats.json')

const rawItems = fs.readFileSync(itemsPath, 'utf-8')
const items: Items = JSON.parse(rawItems)
const itemsValues = Object.values(items)

const rawRecipes = fs.readFileSync(recipesPath, 'utf-8')
const recipes: Record<string, Recipe[]> = JSON.parse(rawRecipes)
const recipeValues = Object.values(recipes).flat()

const rawStats = fs.readFileSync(statsPath, 'utf-8')
const stats: StatsInterface = JSON.parse(rawStats)

// export function getAllTags() {
//   return Array.from(tags).sort()
// }

export function getRawRecipes() {
  return recipes
}

export function getAllRecipes() {
  return recipeValues
}

export function getRecipesById(id: number): Recipe[] {
  return (recipes[String(id)] && recipes[String(id)].map((r: any) => r.inShape)) || []
}

export function getAllItems() {
  return itemsValues
}

export function getItemById(id: number) {
  return items[String(id)]
}

export function getAllStats() {
  return stats
}

export function getMinMaxID(): { minId: number; maxId: number } {
  let minId = Infinity
  let maxId = -Infinity

  const items = getAllItems()

  for (const item of items) {
    if (item.id < minId) minId = item.id
    if (item.id > maxId) maxId = item.id
  }

  return { minId, maxId }
}