import fs from 'fs'
import path from 'path'
import type { MinecraftItem } from '@shared/types'

interface Items {
  [id: string]: MinecraftItem
}

const itemsPath = path.resolve('src/data/items.json')

const raw = fs.readFileSync(itemsPath, 'utf-8')
const items: Items = JSON.parse(raw)
const itemsValues = Object.values(items)
const tags = new Set<string>()

for (const item of itemsValues) {
  if (item.tags) {
    for (const tag of item.tags) {
      tags.add(tag)
    }
  }
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