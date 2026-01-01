import express from 'express'
import cors from 'cors'
import { normalizeMatrix, containsSubmatrix, toMatrix2D } from '@shared/utils'
import type { Id, Matrix3x3, RecipeMap, MinecraftItem, ItemName, UniqueCategory, UniqueTag } from '@shared/types'
import { getAllItems, getItemById, getMinMaxID, getAllRecipes, getRecipesById, getAllStats } from './services/items.service'

const app = express()
app.use(cors())
app.use(express.json())

// TAGS

const tagsCount = {} as Record<string, UniqueTag>;

for (const item of getAllItems()) {
  if (item.tags) {
    for (const tag of item.tags) {
      if (!tagsCount[tag]) {
        tagsCount[tag] = { 
          tag,
          count: 0 
        };
      }
      tagsCount[tag].count++;
    }
  }
}

const tagsCountValue = Object.values(tagsCount)
  .sort((a, b) => b.count - a.count);

// CATEGORIES

const categoriesCount = {} as Record<string, UniqueCategory>;

for (const item of getAllItems()) {
  if (item.category) {
    const category = item.category;

    if (!categoriesCount[category]) {
      categoriesCount[category] = {
        category,
        count: 0
      };
    }
    categoriesCount[category].count++;
  }
}
const categoriesCountValue = Object.values(categoriesCount)
  .sort((a, b) => b.count - a.count);

// API

app.get('/api/itemsMeta', (req, res) => {
  const { minId, maxId } = getMinMaxID()
  res.json({
    count: getAllItems().length,
    minId,
    maxId
  })
})

// possible recipes for a given crafting matrix (with caching)
const possibleRecipesCache = new Map<string, MinecraftItem[]>()

app.get('/api/possibleRecipes', (req, res) => {
  if (!req.query.recipe) {
    return res.status(400).json({ error: "Faltando parâmetro 'recipe'!" })
  }
  const search = (req.query.search ?? '').toString().toLowerCase()
  const offset = Number(req.query.offset ?? 0)
  const limit = Number(req.query.limit ?? 30)
  
  const flat = JSON.parse(req.query.recipe as string) as Id[]
  const matrix = toMatrix2D(flat, 3) as Matrix3x3<Id>
  
  const normalizedInput = normalizeMatrix(matrix) as Id[][]
  const cacheKey = JSON.stringify(normalizedInput)

  let results = possibleRecipesCache.get(cacheKey)

  if (!results) {
    const matches: RecipeMap = {}

    const recipeValues = getAllRecipes()

    for (const recipe of recipeValues) {
      if (containsSubmatrix(recipe.inShape.map(r => r.map(id => id.id)), normalizedInput)) {
        const id = recipe.result.id
        
        if (!matches[recipe.result.id]) {
          matches[recipe.result.id] = {
            id,
            name: getItemById(id)?.name,
            displayName: getItemById(id)?.displayName,
            recipes: [] as Matrix3x3<ItemName>[]
          }
        }
        
        matches[id].recipes!.push(recipe.inShape)
      }
    }
  
    results = Object.values(matches) as MinecraftItem[]
    possibleRecipesCache.set(cacheKey, results)
  }

  const filteredResults = search ? results.filter(item =>
    item.displayName.toLowerCase().includes(search) ||
    item.name.toLowerCase().includes(search)
  ) : results

  return res.json({
    items: filteredResults.slice(offset, offset + limit),
    nextOffset: offset + limit,
    hasMore: offset + limit < filteredResults.length
  })
})

// individual item (by ID or name)
app.get('/api/item/:identifier', (req, res) => {
  const { identifier } = req.params
  const numeric = !isNaN(Number(identifier))
  if (!numeric) {
    throw new Error('Fetching by name is not supported yet.')
  }

  const item = getItemById(Number(identifier)) as MinecraftItem | undefined

  if (!item) {
    return res.status(404).json({ error: "Item não encontrado!" })
  }

  const recipes = getRecipesById(item.id)

  res.json({ ...item, recipes })
})

// all items (with search, pagination and caching)
const itemsCache = new Map<string, MinecraftItem[]>()

app.get('/api/items', (req, res) => {
  const offset = Number(req.query.offset ?? 0)
  const limit = Number(req.query.limit ?? 20)
  const search = (req.query.search ?? '').toString().toLowerCase()

  let filteredItems: MinecraftItem[]

  if (itemsCache.has(search)) {
    filteredItems = itemsCache.get(search)!
  } else {
    const allItems = getAllItems()

    filteredItems = search ? allItems.filter(item =>
      item.displayName.toLowerCase().includes(search) ||
      item.name.toLowerCase().includes(search)
    )
    : allItems

    itemsCache.set(search, filteredItems)
  }

  if (search) {
  }

  res.json({
    items: filteredItems.slice(offset, offset + limit),
    nextOffset: offset + limit,
    hasMore: offset + limit < filteredItems.length
  })
})

// all unique tags
// app.get('/api/tags', (req, res) => {
//   res.json(getAllTags())
// })

// all stats
app.get('/api/stats', (req, res) => {
  res.json({ 
    ...getAllStats(), 
    uniqueTags: tagsCountValue,
    uniqueCategories: categoriesCountValue
  })
})

const port = 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})