import type { ItemName, Matrix3x3, MinecraftItem, Recipe, StatsInterface, Potion, BrewingRule } from '@shared/types'

interface Items {
  [id: string]: MinecraftItem
}

import itemsJson from '../data/items.json'
import recipesJson from '../data/recipes.json'
import stats from '../data/stats.json'
import potionsJson from '../data/potions.json'
import potionsIngredients from '../data/potions_ingredients.json'
import brewingRulesJson from '../data/brewing_rules.json'

const recipes = recipesJson as unknown as Record<string, Recipe[]>
const items = itemsJson as Items
const potions = potionsJson as unknown as Record<string, Potion>
const brewingRules = brewingRulesJson as BrewingRule[]
const itemsValues = Object.values(items)
const recipeValues = Object.values(recipes).flat()

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