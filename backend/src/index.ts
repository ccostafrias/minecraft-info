import express from 'express'
import cors from 'cors'
import minecraftData from 'minecraft-data'

const app = express()
const mcData = minecraftData('1.20')

app.use(cors())
app.use(express.json())

// API

app.get('api/items/:name', (req, res) => {
  const item = mcData.itemsByName[req.params.name]

  if (!item) {
    return res.status(404).json({ error: "Item não encontrado!" })
  }

  res.json(item)
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})