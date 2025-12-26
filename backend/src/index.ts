import express from 'express'
import cors from 'cors'
import minecraftData from 'minecraft-data'
import { normalizeMatrix, containsSubmatrix, toMatrix2D, normalizeRecipe } from '@shared/utils'

const app = express()
const mcData = minecraftData('1.20')

app.use(cors())
app.use(express.json())

// API

const shapedRecipes = Object.values(mcData.recipes)
  .flat()
  .filter((r: any) => r.inShape)
  .map((r: any) => ({
    result: r.result,
    inShape: normalizeMatrix(r.inShape)
  }))

const ingredientRecipes = Object.values(mcData.recipes)
  .flat()
  .filter((r: any) => r.ingredients && !r.inShape)

app.get('/api/ingredientRecipes', (req, res) => {
  const ingredients = ingredientRecipes.map((r: any) => ({...r, ingredients: r.ingredients.map((id: number) => mcData.items[id].name), name: mcData.items[r.result.id].name}))
  res.json(ingredients.filter(r => r.ingredients.length > 4))
})

app.get('/api/possibleRecipes', (req, res) => {
  if (!req.query.recipe) {
    return res.status(400).json({ error: "Faltando parâmetro 'recipe'!" })
  }

  const flat = JSON.parse(req.query.recipe as string) as number[]
  const matrix = toMatrix2D(flat, 3)
  
  const normalizedInput = normalizeMatrix(matrix)
  const matches: any[] = []

  for (const recipe of shapedRecipes) {
    if (containsSubmatrix(recipe.inShape, normalizedInput)) {
      const resultItem = mcData.items[recipe.result.id]

      matches.push({
        ...resultItem,
        recipe: {
          inShape: recipe.inShape.map((row: (number | null)[]) =>
            row.map((id: number | null) => {
              const item = id != null ? mcData.items[id] : undefined
              return item
                ? { name: item.name, displayName: item.displayName, id: item.id }
                : null
            })
          ),
          result: recipe.result
        }
      })
    }
  }

  return res.json(matches.length ? matches : null)
})

app.get('/api/recipes', (req, res) => {
  const search = (req.query.search ?? '').toString().toLowerCase()
  const recipes = Object.values(mcData.recipes)
    .flat()
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

app.get('/api/itemId/:id', (req, res) => {
  const item = mcData.items[Number(req.params.id)]

  if (!item) {
    return res.status(404).json({ error: "Item não encontrado!" })
  }

  const recipes = mcData.recipes[item.id] || []

  const recipesFiltered = recipes
    .filter((r: any) => r?.inShape)
    .map((recipe: any) => ({...recipe, inShape: normalizeRecipe(recipe.inShape.map((row: number[]) => row.map((id: number) => {
      const item = mcData.items[id]
      return item
        ? { name: item.name, displayName: item.displayName }
        : null
    }))) }))

  res.json({...item, recipes: recipesFiltered })
})

app.get('/api/itemName/:name', (req, res) => {
  const item = mcData.itemsByName[req.params.name]

  if (!item) {
    return res.status(404).json({ error: "Item não encontrado!" })
  }

  const recipes = mcData.recipes[item.id] || []
  const recipesFiltered = recipes
    .filter((r: any) => r?.inShape)
    .map((recipe: any) => ({...recipe, inShape: normalizeRecipe(recipe.inShape.map((row: number[]) => row.map((id: number) => {
      const item = mcData.items[id]
      return item
        ? { name: item.name, displayName: item.displayName }
        : null
    }))) }))

  res.json({...item, recipes: recipesFiltered })
})

app.get('/api/items', (req, res) => {
  const offset = Number(req.query.offset ?? 0)
  const limit = Number(req.query.limit ?? 50)
  const search = (req.query.search ?? '').toString().toLowerCase()

  let items = Object.values(mcData.items)

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