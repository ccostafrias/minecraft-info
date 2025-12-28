import type { Id, ItemName, Matrix3x3, MinecraftItem } from './types'

export function normalizeMatrix(matrix: Id[][]): Id[][] {
  let top = 0
  let bottom = matrix.length - 1
  let left = 0
  let right = matrix[0].length - 1

  const isRowEmpty = (row: Id[]) => row.every(v => v === 0)

  while (top <= bottom && isRowEmpty(matrix[top])) top++
  while (top <= bottom && isRowEmpty(matrix[bottom])) bottom--

  const isColEmpty = (col: number) => {
    for (let i = top; i <= bottom; i++) {
      if (matrix[i][col] !== 0) return false
    }
    return true
  }

  while (left <= right && isColEmpty(left)) left++
  while (left <= right && isColEmpty(right)) right--

  if (top > bottom || left > right) {
    return [[0]]
  }

  const result: Id[][] = []
  for (let i = top; i <= bottom; i++) {
    result.push(matrix[i].slice(left, right + 1))
  }

  return result
}

export function matchesAt(
  big: number[][],
  small: number[][],
  startY: number,
  startX: number
): boolean {
  for (let y = 0; y < small.length; y++) {
    for (let x = 0; x < small[0].length; x++) {
      const wanted = small[y][x]
      const current = big[startY + y][startX + x]

      if (wanted !== 0 && wanted !== current) {
        return false
      }
    }
  }
  return true
}

export function containsSubmatrix(
  big: number[][],
  small: number[][]
): boolean {
  const H = big.length
  const W = big[0].length
  const h = small.length
  const w = small[0].length

  if (h > H || w > W) return false

  for (let y = 0; y <= H - h; y++) {
    for (let x = 0; x <= W - w; x++) {
      if (matchesAt(big, small, y, x)) {
        return true
      }
    }
  }

  return false
}

export function toMatrix2D(arr: Id[], width: number): Id[][] {
  const ref = [...arr]
  
  while (ref.length % width !== 0) {
    ref.push(0)
  }

  const matrix: Id[][] = []

  for (let i = 0; i < ref.length; i += width) {
    matrix.push(ref.slice(i, i + width))
  }

  return matrix
}

// Normaliza uma receita para uma matriz 3x3, preenchendo com itens vazios quando necessário
export const normalizeRecipe = (inShape: ItemName[][]): Matrix3x3<ItemName> => {
  const normalized = Array.from({ length: 3 }, (_, i) =>
    Array.from(
      { length: 3 },
      (_, j) => (inShape[i] && inShape[i][j] ? inShape[i][j] : defaultItemName())
    )
  ) as Matrix3x3<ItemName>;

  return normalized;
};

export function defaultItemName(): ItemName {
  return { name: 'empty', displayName: '', id: -1 };
}

export function defaultCrafting(): ItemName[] {
  return Array.from({ length: 9 }, () => defaultItemName())
}

// Transforma uma matriz de IDs em uma matriz de ItemName usando o callback fornecido
export function transformRecipe(inShape: Id[][], callback: (id: number | null) => MinecraftItem | undefined): ItemName[][] {
  return inShape.map((row: (number | null)[]) =>
    row.map((id: number | null) => {
      const itm = callback(id)
      return itm ? { name: itm.name, displayName: itm.displayName, id: itm.id } : defaultItemName()
    })
  )
}