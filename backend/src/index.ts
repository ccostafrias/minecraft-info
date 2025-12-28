import express from 'express'
import cors from 'cors'
import minecraftData from 'minecraft-data'
import { normalizeMatrix, containsSubmatrix, toMatrix2D, normalizeRecipe, transformRecipe } from '@shared/utils'
import type { Id, Matrix3x3, RecipeMap, MinecraftItem, ItemName, Recipe } from '@shared/types'

const app = express()
const mcData = minecraftData('1.20')

app.use(cors())
app.use(express.json())

// API

function getMinMaxID(items: MinecraftItem[]): { minId: number; maxId: number } {
  let minId = Infinity
  let maxId = -Infinity

  for (const item of items) {
    if (item.id < minId) minId = item.id
    if (item.id > maxId) maxId = item.id
  }

  return { minId, maxId }
}

const getRecipe = (id: number | null) => id ? mcData.items[id] : undefined

for (const recipe in mcData.recipes) {
  mcData.recipes[recipe].map((r: any) => {
      if (!r.inShape) {
        const ingredients = r.ingredients || []
        r.inShape = toMatrix2D(ingredients, 3)
      }
      r.inShape = normalizeMatrix(r.inShape)
      return r
    })
}

const recipeValues = Object.values(mcData.recipes).flat() as Recipe<Id>[]
const itemValues = Object.values(mcData.items) as MinecraftItem[]

app.get('/api/itemsMeta', (req, res) => {
  const { minId, maxId } = getMinMaxID(itemValues)
  res.json({
    count: itemValues.length,
    minId,
    maxId
  })
})

app.get('/api/possibleRecipes', (req, res) => {
  if (!req.query.recipe) {
    return res.status(400).json({ error: "Faltando parâmetro 'recipe'!" })
  }

  const flat = JSON.parse(req.query.recipe as string) as Id[]
  const matrix = toMatrix2D(flat, 3) as Matrix3x3<Id>
  
  const normalizedInput = normalizeMatrix(matrix) as Id[][]
  const matches: RecipeMap = {}

  for (const recipe of recipeValues) {
    if (containsSubmatrix(recipe.inShape, normalizedInput)) {
      const id = recipe.result.id
      
      if (!matches[recipe.result.id]) {
        matches[recipe.result.id] = {
          id,
          name: mcData.items[id].name,
          displayName: mcData.items[id].displayName,
          recipes: [] as Matrix3x3<ItemName>[]
        }
      }
      
      const newShape = normalizeRecipe(transformRecipe(recipe.inShape, getRecipe))
      matches[id].recipes!.push(newShape)
    }
  }

  const finalMatches = Object.values(matches) as MinecraftItem[]
  return res.json(finalMatches.length ? finalMatches : null)
})

app.get('/api/recipes', (req, res) => {
  const search = (req.query.search ?? '').toString().toLowerCase()
  const recipes = recipeValues
    .filter((r: any) => {
      const resultItem = mcData.items[r.result.id]
      return resultItem.displayName.toLowerCase().includes(search) ||
             resultItem.name.toLowerCase().includes(search)
    })

  res.json(recipes)
})

app.get('/api/recipe/:itemId', (req, res) => {
  const itemId = Number(req.params.itemId)
  const recipes = mcData.recipes[itemId] || []

  res.json(recipes)
})

const handleItemRequest = (identifier: string, res: express.Response) => {
  const numeric = !isNaN(Number(identifier))
  const item = (numeric ? mcData.items[Number(identifier)] : mcData.itemsByName[identifier]) as MinecraftItem | undefined

  if (!item) {
    return res.status(404).json({ error: "Item não encontrado!" })
  }

  const recipes = mcData.recipes[item.id] || []
  const recipesFiltered = recipes
    .filter((r: any) => r?.inShape)
    .map((recipe: any) => (
      normalizeRecipe(transformRecipe(recipe.inShape, getRecipe))
    )) as Matrix3x3<ItemName>[]

  res.json({ ...item, recipes: recipesFiltered })
}

app.get('/api/item/:identifier', (req, res) => {
  handleItemRequest(req.params.identifier, res)
})

app.get('/api/items', (req, res) => {
  const offset = Number(req.query.offset ?? 0)
  const limit = Number(req.query.limit ?? 50)
  const search = (req.query.search ?? '').toString().toLowerCase()

  let items = itemValues

  if (search) {
    items = items.filter(item =>
      item.displayName.toLowerCase().includes(search) ||
      item.name.toLowerCase().includes(search)
    )
  }

  res.json({
    items: items.slice(offset, offset + limit),
    nextOffset: offset + limit,
    hasMore: offset + limit < items.length
  })
})

const port = 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})