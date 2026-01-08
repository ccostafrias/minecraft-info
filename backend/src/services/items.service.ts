import fs from 'fs'
import path from 'path'
import type { ItemName, Matrix3x3, MinecraftItem, Recipe, StatsInterface, Potion, BrewingRule } from '@shared/types'

interface Items {
  [id: string]: MinecraftItem
}

const itemsPath = path.resolve('src/data/items.json')
const recipesPath = path.resolve('src/data/recipes.json')
const statsPath = path.resolve('src/data/stats.json')
const potionsPath = path.resolve('src/data/potions.json')
const potionsIngredientsPath = path.resolve('src/data/potions_ingredients.json')
const brewingRulesPath = path.resolve('src/data/brewing_rules.json')

const rawItems = fs.readFileSync(itemsPath, 'utf-8')
const items: Items = JSON.parse(rawItems)
const itemsValues = Object.values(items)

const rawRecipes = fs.readFileSync(recipesPath, 'utf-8')
const recipes: Record<string, Recipe[]> = JSON.parse(rawRecipes)
const recipeValues = Object.values(recipes).flat()

const rawStats = fs.readFileSync(statsPath, 'utf-8')
const stats: StatsInterface = JSON.parse(rawStats)

const rawPotions = fs.readFileSync(potionsPath, 'utf-8')
const potions = JSON.parse(rawPotions) as Record<string, Potion>

const rawPotionsIngredients = fs.readFileSync(potionsIngredientsPath, 'utf-8')
const potionsIngredients: MinecraftItem[] = JSON.parse(rawPotionsIngredients)

const rawBrewingRules = fs.readFileSync(brewingRulesPath, 'utf-8')
const brewingRules = JSON.parse(rawBrewingRules) as BrewingRule[]

export function getPotionsIngredients() {
  return potionsIngredients
}

export function getAllPotions() {
  return potions
}

export function getBrewingRules() {
  return brewingRules
}

// export function getAllTags() {
//   return Array.from(tags).sort()
// }

export function getRawRecipes() {
  return recipes
}

export function getAllRecipes() {
  return recipeValues
}

export function getRecipesById(id: number): Matrix3x3<ItemName>[] {
  return (recipes[String(id)] && recipes[String(id)].map((r: Recipe) => r.inShape)) || []
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
    const id = item.id! as number

    if (id < minId) minId = id
    if (id > maxId) maxId = id
  }

  return { minId, maxId }
}