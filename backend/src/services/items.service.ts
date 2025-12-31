import fs from 'fs'
import path from 'path'
import type { MinecraftItem, Recipe, Id } from '@shared/types'

interface Items {
  [id: string]: MinecraftItem
}

const itemsPath = path.resolve('src/data/items.json')
const recipesPath = path.resolve('src/data/recipes.json')

const rawItems = fs.readFileSync(itemsPath, 'utf-8')
const items: Items = JSON.parse(rawItems)
const itemsValues = Object.values(items)

const tags = new Set<string>()
for (const item of itemsValues) {
  if (item.tags) {
    for (const tag of item.tags) {
      tags.add(tag)
    }
  }
}

const RawRecipes = fs.readFileSync(recipesPath, 'utf-8')
const recipes = JSON.parse(RawRecipes)
const recipeValues = Object.values(recipes).flat() as Recipe[]

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

export function getAllTags() {
  return Array.from(tags)
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