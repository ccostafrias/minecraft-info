import { promises as fs } from 'fs'
import path from 'path'
import { toMatrix2D, transformRecipe, normalizeRecipe } from '@shared/utils'
import { getItemById } from '../services/items.service'
import type { Id, ItemName, Matrix3x3, Recipe } from '@shared/types'

const API_URL = 'http://localhost:3000/api/recipes'

interface RawRecipe {
  [key: string]: RawRecipeEntry[]
}

interface RawRecipeEntry {
  result: {
    id: number;
    count: number;
  };
  inShape?: Id[][] | Matrix3x3<ItemName>;
  ingredients?: Id[];
}

const getRecipe = (id: number | null) => id ? getItemById(id) : undefined

async function exportRecipes() {
  try {
    const res = await fetch(API_URL)

    if (!res.ok) {
      throw new Error(`Erro na requisição: ${res.status}`)
    }

    const recipes = await res.json() as RawRecipe

    for (const recipe in recipes) {
      const actualRecipes = recipes[recipe]

      for (let r of actualRecipes) {
        const hasIngredient = r.ingredients && r.ingredients.length > 0
        let inShape = (r.inShape ?? []) as Id[][]

        if (hasIngredient) {
          const ingredients = r.ingredients || []
          inShape = toMatrix2D(ingredients, 3)
        }
        
        const inShapeMatrix = normalizeRecipe(transformRecipe(inShape, getRecipe))

        r.inShape = inShapeMatrix
        r.ingredients = undefined
      }
    }

    const outputDir = path.resolve('src/data')
    await fs.mkdir(outputDir, { recursive: true })

    const outputPath = path.join(outputDir, 'recipes.json')

    await fs.writeFile(
      outputPath,
      JSON.stringify(recipes, null, 2),
      'utf-8'
    )

    console.log(`✔ Recipes salvos em ${outputPath}`)
  } catch (err) {
    console.error('❌ Erro ao exportar recipes:', err)
    process.exitCode = 1
  }
}

exportRecipes()
